"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  diagnoseProblem,
  getContentsByIds,
  getDefaultDiagnosisResult,
  getProblemPreviewOptions
} from "@/lib/diagnosis";
import {
  readLocalDiagnosisSnapshot,
  writeLocalDiagnosisSnapshot
} from "@/lib/appShell/localRouteState";
import {
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { getAssessmentLevelBand } from "@/lib/assessment";
import { CONSUMER_VISIBLE_FOLLOWUP_CAP, decideDiagnoseFlow } from "@/lib/intake/decideDiagnoseFlow";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { buildDeepDiagnosisHandoff, buildEnrichedDiagnosisContext } from "@/lib/diagnose/enrichedContext";
import { prepareDiagnoseSubmission } from "@/lib/intake/prepareDiagnoseSubmission";
// hasStudyTaskRating removed: actionability prompt not shown on diagnose page
import { getLatestAssessmentResult, saveDiagnosisHistory } from "@/lib/userData";
import type { ObserveDiagnoseMediation } from "@/lib/intake/diagnoseMediation/types";
import type { AssessmentResult } from "@/types/assessment";
import type { DeepDiagnosisHandoff } from "@/types/enrichedDiagnosis";
import type { DiagnosisEffortMode, DiagnosisResult, DiagnosisSnapshot } from "@/types/diagnosis";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { DiagnoseInput } from "@/components/diagnose/DiagnoseInput";
import { DeepScenarioModule } from "@/components/diagnose/DeepScenarioModule";
import { DiagnoseMediationInline } from "@/components/diagnose/DiagnoseMediationInline";
import { InlineFollowupFlow } from "@/components/diagnose/InlineFollowupFlow";
import { DiagnoseResult as DiagnoseResultPanel } from "@/components/diagnose/DiagnoseResult";
import { useAppShell } from "@/components/app/AppShellProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildDiagnosisGuidanceContext } from "@/lib/guidance-context/build";
import type { ScenarioQuestion, ScenarioState } from "@/types/scenario";

function toConfidenceBucket(score: number) {
  if (score >= 6) return "high";
  if (score >= 3) return "mid";
  return "low";
}

function createDiagnosisSnapshot(result: DiagnosisResult, locale: "zh" | "en"): DiagnosisSnapshot {
  return {
    inputSummary: locale === "en"
      ? `Diagnosis snapshot: ${result.title}`
      : `诊断快照：${result.title}`,
    capturedAt: new Date().toISOString(),
    matchedRuleId: result.matchedRuleId,
    matchScore: result.matchScore,
    confidence: result.confidence,
    effortMode: result.effortMode,
    evidenceLevel: result.evidenceLevel,
    needsNarrowing: result.needsNarrowing,
    narrowingPrompts: [...result.narrowingPrompts],
    narrowingSuggestions: [...result.narrowingSuggestions],
    refusalReasonCodes: [...(result.refusalReasonCodes ?? [])],
    missingEvidenceSlots: [...(result.missingEvidenceSlots ?? [])],
    primaryNextStep: result.primaryNextStep,
    problemTag: result.problemTag,
    category: [...result.category],
    title: result.title,
    summary: result.summary,
    detailedSummary: result.detailedSummary ?? null,
    causes: [...result.causes],
    fixes: [...result.fixes],
    drills: [...result.drills],
    recommendedContentIds: result.recommendedContents.map((item) => item.id),
    fallbackUsed: result.fallbackUsed,
    fallbackMode: result.fallbackMode,
    level: result.level,
    enrichedContext: result.enrichedContext ?? null,
    guidanceContext: result.guidanceContext ?? null,
    categoryConsistency: result.categoryConsistency,
    categoryConflict: result.categoryConflict ?? null
  };
}

function replayDiagnosisFromSnapshot(
  snapshot: DiagnosisSnapshot,
  fallbackLevel?: string
): DiagnosisResult {
  return {
    input: snapshot.inputSummary,
    normalizedInput: snapshot.inputSummary.toLowerCase(),
    matchedRuleId: snapshot.matchedRuleId,
    matchedKeywords: [],
    matchedSynonyms: [],
    matchScore: snapshot.matchScore,
    confidence: snapshot.confidence,
    effortMode: snapshot.effortMode,
    evidenceLevel: snapshot.evidenceLevel,
    needsNarrowing: snapshot.needsNarrowing,
    narrowingPrompts: [...snapshot.narrowingPrompts],
    narrowingSuggestions: [...snapshot.narrowingSuggestions],
    refusalReasonCodes: [...(snapshot.refusalReasonCodes ?? [])],
    missingEvidenceSlots: [...(snapshot.missingEvidenceSlots ?? [])],
    primaryNextStep: snapshot.primaryNextStep,
    problemTag: snapshot.problemTag,
    category: [...snapshot.category],
    title: snapshot.title,
    summary: snapshot.summary,
    detailedSummary: snapshot.detailedSummary ?? null,
    causes: [...snapshot.causes],
    fixes: [...snapshot.fixes],
    drills: [...snapshot.drills],
    recommendedContents: getContentsByIds(snapshot.recommendedContentIds, undefined, 3, snapshot.level ?? fallbackLevel),
    searchQueries: null,
    fallbackUsed: snapshot.fallbackUsed,
    fallbackMode: snapshot.fallbackMode,
    level: snapshot.level ?? fallbackLevel,
    enrichedContext: snapshot.enrichedContext ?? null,
    guidanceContext: snapshot.guidanceContext ?? null,
    categoryConsistency: snapshot.categoryConsistency,
    categoryConflict: snapshot.categoryConflict ?? null
  };
}

type ConsumerFollowupState = {
  scenario: ScenarioState;
  selectedQuestion: ScenarioQuestion;
  followupCount: number;
  sourceInput: string;
};

type ConsumerMediationState = {
  mode: "paraphrase" | "clarify";
  displayText: string | null;
  question: string | null;
  sourceInput: string;
};

function DiagnosePageContent() {
  const searchParams = useSearchParams();
  const { user, configured, loading } = useAuth();
  const { environment, language, loading: appShellLoading } = useAppShell();
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [currentLevel, setCurrentLevel] = useState<string | undefined>(undefined);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [effortMode, setEffortMode] = useState<DiagnosisEffortMode>("standard");
  const [result, setResult] = useState<DiagnosisResult>(getDefaultDiagnosisResult());
  const [latestSnapshot, setLatestSnapshot] = useState<DiagnosisSnapshot | null>(null);
  const [contextReady, setContextReady] = useState(false);
  const [followupState, setFollowupState] = useState<ConsumerFollowupState | null>(null);
  const [followupSubmitting, setFollowupSubmitting] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [mediationState, setMediationState] = useState<ConsumerMediationState | null>(null);
  const [mediationSubmitting, setMediationSubmitting] = useState(false);
  const [mediationError, setMediationError] = useState<string | null>(null);
  const [deepResetSignal, setDeepResetSignal] = useState(0);
  const diagnosisRunTokenRef = useRef(0);
  const handledQueryRef = useRef<string | null>(null);

  const previewOptions = getProblemPreviewOptions();
  const quickTags = previewOptions.map((item) => language === "en" ? item.label_en : item.label);
  const hasDiagnosed = Boolean(result.input.trim());

  function resetFollowupState(clearCurrentResult = false) {
    setFollowupState(null);
    setFollowupSubmitting(false);
    setFollowupError(null);

    if (clearCurrentResult) {
      setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
    }
  }

  function resetMediationState() {
    setMediationState(null);
    setMediationSubmitting(false);
    setMediationError(null);
  }

  function resetDeepScenarioState() {
    setDeepResetSignal((signal) => signal + 1);
  }

  function invalidatePendingDiagnosisRuns() {
    diagnosisRunTokenRef.current += 1;
    return diagnosisRunTokenRef.current;
  }

  function startDiagnosisRun() {
    diagnosisRunTokenRef.current += 1;
    return diagnosisRunTokenRef.current;
  }

  function isCurrentDiagnosisRun(runToken: number) {
    return diagnosisRunTokenRef.current === runToken;
  }

  const applyDiagnosisResult = async ({
    diagnosisInput,
    queryText,
    scenario,
    deepHandoff,
    runToken
  }: {
    diagnosisInput: string;
    queryText: string;
    scenario: ScenarioState | null;
    deepHandoff?: DeepDiagnosisHandoff | null;
    runToken: number;
  }) => {
    const trimmedDiagnosisInput = diagnosisInput.trim();
    const trimmedQueryText = queryText.trim();

    if (!isCurrentDiagnosisRun(runToken)) {
      return;
    }

    resetFollowupState();
    setText(trimmedQueryText);

    const resolvedEffortMode: DiagnosisEffortMode = deepHandoff ? "deep" : effortMode;
    const diagnosisResult = diagnoseProblem(trimmedDiagnosisInput, {
      level: currentLevel,
      assessmentResult,
      maxRecommendations: 5,
      effortMode: resolvedEffortMode,
      locale: language,
      environment,
      deepHandoff: deepHandoff ?? null
    });
    const finalResult: DiagnosisResult = {
      ...diagnosisResult,
      enrichedContext: deepHandoff
        ? buildEnrichedDiagnosisContext({
            handoff: deepHandoff,
            problemTag: diagnosisResult.problemTag
          })
        : null
    };
    finalResult.guidanceContext = buildDiagnosisGuidanceContext({
      problemTag: finalResult.problemTag,
      level: finalResult.level,
      locale: language,
      primaryNextStep: finalResult.primaryNextStep,
      diagnosisInput: trimmedDiagnosisInput,
      deepContext: finalResult.enrichedContext ?? null
    });

    if (!isCurrentDiagnosisRun(runToken)) {
      return;
    }

    setResult(finalResult);
    const snapshot = createDiagnosisSnapshot(finalResult, language);
    writeLocalDiagnosisSnapshot(snapshot);
    setLatestSnapshot(snapshot);

    logEvent("diagnose.rule_matched", {
      matched: Boolean(diagnosisResult.matchedRuleId),
      ruleId: diagnosisResult.matchedRuleId,
      confidenceBucket: toConfidenceBucket(diagnosisResult.matchScore)
    }, { page: "/diagnose" });

    if (diagnosisResult.fallbackUsed) {
      logEvent("diagnose.fallback_used", {
        fallbackType: diagnosisResult.fallbackMode === "assessment" ? "assessment_based" : "general_guidance"
      }, { page: "/diagnose" });
    }

    logEvent("diagnose.result_viewed", {
      problemTag: diagnosisResult.problemTag,
      immediateFixCode: diagnosisResult.fixes[0] ?? null,
      structuredPath: Boolean(scenario)
    }, { page: "/diagnose" });

    if (user?.id && configured) {
      const saveResult = await saveDiagnosisHistory(user.id, trimmedQueryText, finalResult);
      if (saveResult.error) {
        console.error("[diagnose] failed to save diagnosis history", saveResult.error);
      }
    }
  };

  const runDiagnosis = async (
    nextQueryText: string,
    inputSource: "typed" | "tag_click" = "typed",
    options?: {
      clarificationRerun?: boolean;
    }
  ) => {
    const trimmedQueryText = nextQueryText.trim();
    const runToken = startDiagnosisRun();

    if (!trimmedQueryText) {
      resetFollowupState(true);
      resetMediationState();
      setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
      return;
    }

    setText(nextQueryText);
    setFollowupError(null);

    if (!options?.clarificationRerun) {
      logEvent("diagnose.input_method_selected", {
        inputMethod: inputSource === "tag_click" ? "quick_tag" : "typing"
      }, { page: "/diagnose" });
      logEvent("diagnose.submitted", {
        inputMethod: inputSource === "tag_click" ? "quick_tag" : "typing",
        queryLength: trimmedQueryText.length,
        inheritedLevelBand: currentLevel ?? null,
        usedAssessmentContext: Boolean(assessmentResult),
        intakeSource: "auto"
      }, { page: "/diagnose" });
    }

    const observeMediation: ObserveDiagnoseMediation = (event) => {
      if (event.type === "gate") {
        logEvent("diagnose.mediation_gate_decided", {
          shouldMediate: event.shouldMediate,
          reason: event.reason,
          lockedCategory: event.lockedCategory,
          clarificationUsed: event.clarificationUsed
        }, { page: "/diagnose" });
        return;
      }

      if (event.type === "mode") {
        logEvent("diagnose.mediation_mode_selected", {
          mode: event.mode,
          reason: event.reason,
          clarificationUsed: event.clarificationUsed
        }, { page: "/diagnose" });
        return;
      }

      if (event.type === "validator_rejected") {
        logEvent("diagnose.mediation_validator_rejected", {
          rejectionReason: event.rejectionReason
        }, { page: "/diagnose" });
        return;
      }

      logEvent("diagnose.mediation_fallback", {
        reason: event.reason
      }, { page: "/diagnose" });
    };

    const preparedSubmission = await prepareDiagnoseSubmission({
      text: trimmedQueryText,
      locale: language,
      clarificationUsed: options?.clarificationRerun === true,
      observeMediation
    });

    if (!isCurrentDiagnosisRun(runToken)) {
      return;
    }

    if (options?.clarificationRerun) {
      logEvent("diagnose.mediation_clarification_completed", {
        outcome: preparedSubmission.decision,
        source: preparedSubmission.source,
        mediationMode: preparedSubmission.mediationMode
      }, { page: "/diagnose" });
    }

    if (!options?.clarificationRerun && preparedSubmission.mediationMode === "clarify") {
      resetFollowupState();
      setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
      setMediationState({
        mode: "clarify",
        displayText: null,
        question: preparedSubmission.mediationQuestion,
        sourceInput: trimmedQueryText
      });
      setMediationError(null);
      return;
    }

    if (!options?.clarificationRerun && preparedSubmission.mediationMode === "paraphrase") {
      setMediationState({
        mode: "paraphrase",
        displayText: preparedSubmission.mediationDisplayText,
        question: null,
        sourceInput: trimmedQueryText
      });
      setMediationError(null);
    } else {
      resetMediationState();
    }

    if (preparedSubmission.decision === "needs_followup" && preparedSubmission.scenario && preparedSubmission.selectedQuestion) {
      setFollowupState({
        scenario: preparedSubmission.scenario,
        selectedQuestion: preparedSubmission.selectedQuestion,
        followupCount: 0,
        sourceInput: trimmedQueryText
      });
      return;
    }

    await applyDiagnosisResult({
      diagnosisInput: preparedSubmission.diagnosisInput,
      queryText: trimmedQueryText,
      scenario: preparedSubmission.decision === "raw_text_fallback" ? null : preparedSubmission.scenario,
      runToken
    });
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setText(q);
    }

    if (loading) {
      return;
    }

    let active = true;

    async function hydrateAssessmentContext() {
      const localResult = readAssessmentResultFromStorage();
      let nextLevel: string | undefined = getAssessmentLevelBand(localResult) ?? undefined;
      let nextAssessmentResult = localResult ?? null;

      if (user?.id && configured) {
        const remoteResult = await getLatestAssessmentResult(user.id);

        if (!active) {
          return;
        }

        if (remoteResult.data) {
          nextLevel = getAssessmentLevelBand(remoteResult.data) ?? undefined;
          nextAssessmentResult = remoteResult.data;
          writeAssessmentResultToStorage(remoteResult.data);
        }
      }

      if (!active) {
        return;
      }

      setCurrentLevel(nextLevel);
      setAssessmentResult(nextAssessmentResult);
      setResult(getDefaultDiagnosisResult(nextLevel, undefined, undefined, language));
      setLatestSnapshot(readLocalDiagnosisSnapshot());
      setContextReady(true);
    }

    void hydrateAssessmentContext();

    return () => {
      active = false;
    };
  }, [configured, language, loading, searchParams, user?.id]);

  useEffect(() => {
    if (!contextReady) {
      return;
    }

    logEvent("diagnose.started", {
      sourceRoute: null,
      inheritedLevelBand: currentLevel ?? null
    }, { page: "/diagnose" });
  }, [contextReady, currentLevel]);

  useEffect(() => {
    if (!contextReady) {
      return;
    }

    const q = searchParams.get("q")?.trim();
    if (!q || handledQueryRef.current === q) {
      return;
    }

    handledQueryRef.current = q;
    void runDiagnosis(q, "typed");
  }, [contextReady, searchParams]);

  const onDiagnose = async () => {
    if (effortMode === "deep") {
      invalidatePendingDiagnosisRuns();
      resetFollowupState(true);
      resetMediationState();
      document.getElementById("deep-scenario-module")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      return;
    }

    await runDiagnosis(text);
  };

  const onClear = () => {
    invalidatePendingDiagnosisRuns();
    setText("");
    setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
    resetFollowupState();
    resetMediationState();
    resetDeepScenarioState();
  };

  const handleEffortModeChange = (nextMode: DiagnosisEffortMode) => {
    if (nextMode === effortMode) {
      return;
    }

    invalidatePendingDiagnosisRuns();
    setEffortMode(nextMode);
    setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
    resetFollowupState();
    resetMediationState();
    resetDeepScenarioState();
  };

  async function handleFollowupAnswer(answerKey: string) {
    if (!followupState) {
      return;
    }

    const runToken = startDiagnosisRun();
    setFollowupSubmitting(true);
    setFollowupError(null);

    try {
      const response = await fetch("/api/scenario-reconstruction/answer-followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scenario: followupState.scenario,
          question_id: followupState.selectedQuestion.id,
          answer: answerKey,
          ui_language: language
        })
      });
      const payload = await response.json() as {
        scenario?: ScenarioState;
        selected_question?: ScenarioQuestion | null;
      };

      if (!response.ok || !payload.scenario) {
        throw new Error("followup_failed");
      }

      if (!isCurrentDiagnosisRun(runToken)) {
        return;
      }

      const nextCount = followupState.followupCount + 1;
      const decision = decideDiagnoseFlow({
        scenario: payload.scenario,
        locale: language,
        followupCount: nextCount,
        selectedQuestion: payload.selected_question ?? null
      });

      if (decision.type === "needs_followup" && decision.selectedQuestion) {
        setFollowupState({
          scenario: payload.scenario,
          selectedQuestion: decision.selectedQuestion,
          followupCount: nextCount,
          sourceInput: followupState.sourceInput
        });
        return;
      }

      await applyDiagnosisResult({
        diagnosisInput: decision.type === "raw_text_fallback"
          ? followupState.sourceInput
          : decision.diagnosisInput,
        queryText: followupState.sourceInput,
        scenario: decision.type === "raw_text_fallback" ? null : payload.scenario,
        runToken
      });
    } catch {
      if (isCurrentDiagnosisRun(runToken)) {
        setFollowupError(language === "en" ? "Follow-up failed. Please try again." : "补充追问失败，请稍后再试。");
      }
    } finally {
      if (isCurrentDiagnosisRun(runToken)) {
        setFollowupSubmitting(false);
      }
    }
  }

  async function handleMediationAnswer(answer: string) {
    if (!mediationState || mediationState.mode !== "clarify") {
      return;
    }

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      return;
    }

    setMediationSubmitting(true);
    setMediationError(null);

    try {
      const clarifiedComplaint = `${mediationState.sourceInput.trim()} ${trimmedAnswer}`.trim();
      await runDiagnosis(clarifiedComplaint, "typed", {
        clarificationRerun: true
      });
    } catch {
      setMediationError(language === "en" ? "Clarification failed. Please try again." : "补充说明失败，请重试。");
    } finally {
      setMediationSubmitting(false);
    }
  }

  if (appShellLoading || !contextReady) {
    return (
      <PageContainer>
        <Card className="text-sm text-slate-600">{t("assessment.loading")}</Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        {hasDiagnosed ? (
          <PageBreadcrumbs items={[
            { href: "/diagnose", label: language === "en" ? "← Diagnose again" : "← 重新诊断" },
            { href: "/", label: language === "en" ? "Back home" : "回到首页" }
          ]} />
        ) : null}
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t("diagnose.title")}</h1>
          <p className="mt-2 text-slate-600">{t("diagnose.subtitle")}</p>
        </div>

        <DiagnoseInput
          value={text}
          quickTags={quickTags}
          quickTagsLabel={t("diagnose.quickTags")}
          locale={language === "en" ? "en" : "zh"}
          effortMode={effortMode}
          onChange={(value) => {
            invalidatePendingDiagnosisRuns();
            setText(value);
            if (followupState && value.trim() !== followupState.sourceInput.trim()) {
              resetFollowupState(true);
            }
            if (mediationState && value.trim() !== mediationState.sourceInput.trim()) {
              resetMediationState();
            }
          }}
          onEffortModeChange={handleEffortModeChange}
          onDiagnose={onDiagnose}
          onClear={onClear}
          onQuickTagClick={(tag) => {
            if (effortMode === "deep") {
              invalidatePendingDiagnosisRuns();
              setText(tag);
              setResult(getDefaultDiagnosisResult(currentLevel, undefined, undefined, language));
              resetFollowupState();
              resetMediationState();
              resetDeepScenarioState();
              return;
            }

            void runDiagnosis(tag, "tag_click");
          }}
        />

        {effortMode === "deep" ? (
          <div id="deep-scenario-module">
            <DeepScenarioModule
              sourceText={text}
              language={language === "en" ? "en" : "zh"}
              visible
              resetSignal={deepResetSignal}
              onApplyScenario={({ scenario, diagnosisInput }) => {
                const queryText = text.trim() || diagnosisInput.trim();
                const deepHandoff = buildDeepDiagnosisHandoff({
                  mode: "deep",
                  sourceInput: queryText,
                  scenario,
                  level: currentLevel
                });

                void applyDiagnosisResult({
                  diagnosisInput,
                  queryText,
                  scenario,
                  deepHandoff,
                  runToken: startDiagnosisRun()
                });
              }}
            />
          </div>
        ) : null}

        {effortMode === "standard" && mediationState ? (
          <DiagnoseMediationInline
            language={language === "en" ? "en" : "zh"}
            mode={mediationState.mode}
            displayText={mediationState.displayText}
            question={mediationState.question}
            submitting={mediationSubmitting}
            error={mediationError}
            onSubmit={(answer) => {
              void handleMediationAnswer(answer);
            }}
          />
        ) : null}

        {effortMode === "standard" && followupState ? (
          <InlineFollowupFlow
            scenario={followupState.scenario}
            question={followupState.selectedQuestion}
            language={language === "en" ? "en" : "zh"}
            followupCount={followupState.followupCount}
            followupCap={CONSUMER_VISIBLE_FOLLOWUP_CAP}
            submitting={followupSubmitting}
            error={followupError}
            onAnswer={(answerKey) => {
              void handleFollowupAnswer(answerKey);
            }}
          />
        ) : null}

        {!hasDiagnosed && effortMode === "standard" && !followupState && !mediationState && latestSnapshot ? (
          <Card className="space-y-3 border-slate-200 bg-slate-50/60">
            <p className="text-sm font-semibold text-slate-900">
              {language === "en" ? "Latest diagnosis snapshot" : "最近一次诊断快照"}
            </p>
            <p className="text-sm text-slate-600">{latestSnapshot.title}</p>
            <p className="text-sm font-medium text-slate-900">{latestSnapshot.primaryNextStep}</p>
            <div>
              <Button
                variant="secondary"
                onClick={() => {
                  setResult(replayDiagnosisFromSnapshot(latestSnapshot, currentLevel));
                }}
              >
                {language === "en" ? "Replay this diagnosis" : "重演本次判断"}
              </Button>
            </div>
          </Card>
        ) : null}

        {hasDiagnosed ? <DiagnoseResultPanel result={result} /> : null}
        {/* ActionabilityPrompt removed from diagnose page per product request */}
      </div>
    </PageContainer>
  );
}

export default function DiagnosePage() {
  return (
    <Suspense fallback={<PageContainer><p className="text-slate-600">Loading...</p></PageContainer>}>
      <DiagnosePageContent />
    </Suspense>
  );
}
