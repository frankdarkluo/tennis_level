"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ASSESSMENT_QUESTIONS,
  PROFILE_QUESTION_IDS,
  SCORED_QUESTION_IDS
} from "@/data/assessmentQuestions";
import { calculateAssessmentResult } from "@/lib/assessment";
import { normalizeDraftStepIndex } from "@/lib/assessmentDraft";
import {
  clearAssessmentDraftFromStorage,
  hasCompletedAssessmentResult,
  readAssessmentDraftFromStorage,
  readAssessmentResultFromStorage,
  writeAssessmentDraftToStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { saveAssessmentResult } from "@/lib/userData";
import { AssessmentAnswerMap, AssessmentQuestion } from "@/types/assessment";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { useAppShell } from "@/components/app/AppShellProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AssessmentView = "checking" | "intro" | "core" | "transition" | "profile" | "submitting";

const CORE_QUESTIONS = ASSESSMENT_QUESTIONS.filter((question) => question.type === "scored");
const PROFILE_QUESTIONS = ASSESSMENT_QUESTIONS.filter((question) => question.type === "profile");

function getSourceRoute() {
  if (typeof document === "undefined" || !document.referrer) {
    return null;
  }

  try {
    return new URL(document.referrer).pathname;
  } catch {
    return null;
  }
}

function countAnswered(ids: string[], answers: AssessmentAnswerMap) {
  return ids.filter((id) => Boolean(answers[id])).length;
}

function deriveDraftCursor(answers: AssessmentAnswerMap) {
  const coreAnsweredCount = countAnswered(SCORED_QUESTION_IDS, answers);
  const profileAnsweredCount = countAnswered(PROFILE_QUESTION_IDS, answers);

  if (coreAnsweredCount < CORE_QUESTIONS.length) {
    return {
      view: "core" as const,
      coreIndex: coreAnsweredCount,
      profileIndex: 0
    };
  }

  if (profileAnsweredCount === 0) {
    return {
      view: "transition" as const,
      coreIndex: CORE_QUESTIONS.length - 1,
      profileIndex: 0
    };
  }

  if (profileAnsweredCount < PROFILE_QUESTIONS.length) {
    return {
      view: "profile" as const,
      coreIndex: CORE_QUESTIONS.length - 1,
      profileIndex: profileAnsweredCount
    };
  }

  return {
    view: "transition" as const,
    coreIndex: CORE_QUESTIONS.length - 1,
    profileIndex: PROFILE_QUESTIONS.length - 1
  };
}

function getDraftStepIndex(view: AssessmentView, coreIndex: number, profileIndex: number) {
  if (view === "core") {
    return coreIndex;
  }

  if (view === "transition") {
    return CORE_QUESTIONS.length;
  }

  if (view === "profile") {
    return CORE_QUESTIONS.length + profileIndex;
  }

  return CORE_QUESTIONS.length + PROFILE_QUESTIONS.length;
}

export default function AssessmentPage() {
  const router = useRouter();
  const { user, configured, loading } = useAuth();
  const { environment } = useAppShell();
  const { language, t } = useI18n();

  const [view, setView] = useState<AssessmentView>("checking");
  const [answers, setAnswers] = useState<AssessmentAnswerMap>({});
  const [coreIndex, setCoreIndex] = useState(0);
  const [profileIndex, setProfileIndex] = useState(0);
  const [draftRestored, setDraftRestored] = useState(false);
  const [retakeRequested, setRetakeRequested] = useState<boolean | null>(null);

  const answersRef = useRef<AssessmentAnswerMap>({});
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  const coreAnsweredCount = useMemo(() => countAnswered(SCORED_QUESTION_IDS, answers), [answers]);
  const currentQuestion: AssessmentQuestion | null = view === "core"
    ? CORE_QUESTIONS[coreIndex] ?? null
    : view === "profile"
      ? PROFILE_QUESTIONS[profileIndex] ?? null
      : null;
  const selectedValue = currentQuestion ? answers[currentQuestion.id] : undefined;

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setRetakeRequested(new URLSearchParams(window.location.search).get("retake") === "1");
  }, []);

  useEffect(() => {
    if (loading || retakeRequested === null) {
      return;
    }

    const storedResult = readAssessmentResultFromStorage();

    if (!retakeRequested && hasCompletedAssessmentResult(storedResult)) {
      router.replace("/assessment/result");
      return;
    }

    const storedDraft = readAssessmentDraftFromStorage();

    if (storedDraft?.answers) {
      const normalizedStep = normalizeDraftStepIndex(
        storedDraft.stepIndex,
        storedDraft.answers,
        ASSESSMENT_QUESTIONS
      );
      const nextAnswers = storedDraft.answers;
      const cursor = deriveDraftCursor(nextAnswers);

      answersRef.current = nextAnswers;
      setAnswers(nextAnswers);
      setCoreIndex(
        cursor.view === "core"
          ? Math.min(normalizedStep, CORE_QUESTIONS.length - 1)
          : cursor.coreIndex
      );
      setProfileIndex(cursor.profileIndex);
      setDraftRestored(true);
    }

    setView("intro");
  }, [loading, retakeRequested, router]);

  useEffect(() => {
    if (!startedRef.current) {
      return;
    }

    if (view !== "core" && view !== "transition" && view !== "profile") {
      return;
    }

    writeAssessmentDraftToStorage({
      stepIndex: getDraftStepIndex(view, coreIndex, profileIndex),
      answers,
      updatedAt: new Date().toISOString()
    });
  }, [answers, coreIndex, profileIndex, view]);

  useEffect(() => {
    return () => {
      if (!startedRef.current || completedRef.current) {
        return;
      }

      const answeredCount = Object.keys(answersRef.current).length;

      if (answeredCount === 0) {
        return;
      }

      logEvent("assessment.exited", {
        answeredCount,
        coreAnsweredCount: countAnswered(SCORED_QUESTION_IDS, answersRef.current),
        completed: false
      }, { page: "/assessment" });
    };
  }, []);

  const startAssessment = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      startedAtRef.current = Date.now();
      logEvent("assessment.started", {
        sourceRoute: getSourceRoute(),
        environment
      }, { page: "/assessment" });
    }

    if (draftRestored) {
      const cursor = deriveDraftCursor(answersRef.current);
      setCoreIndex(cursor.coreIndex);
      setProfileIndex(cursor.profileIndex);
      setView(cursor.view);
      return;
    }

    setView("core");
  };

  const finalizeAssessment = async (finalAnswers: AssessmentAnswerMap) => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    setView("submitting");

    const result = calculateAssessmentResult(finalAnswers);

    clearAssessmentDraftFromStorage();
    writeAssessmentResultToStorage(result);

    if (user?.id && configured) {
      const saveResult = await saveAssessmentResult(user.id, result);

      if (saveResult.error) {
        console.error("[assessment] failed to save result", saveResult.error);
      }
    }

    logEvent("assessment.completed", {
      durationMs: startedAtRef.current ? Date.now() - startedAtRef.current : null,
      approximateLevelBand: result.profileVector?.levelBand ?? null,
      primaryWeakness: result.profileVector?.primaryWeakness ?? null,
      playStyle: result.profileVector?.playStyle ?? null,
      playContext: result.profileVector?.playContext ?? null
    }, { page: "/assessment" });

    router.push("/assessment/result");
  };

  const handleSelect = (value: string) => {
    if (!currentQuestion || view === "submitting") {
      return;
    }

    const nextAnswers = {
      ...answersRef.current,
      [currentQuestion.id]: value
    };

    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);

    logEvent("assessment.step_answered", {
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      dimension: currentQuestion.dimension,
      value
    }, { page: "/assessment" });

    if (view === "core") {
      if (coreIndex === CORE_QUESTIONS.length - 1) {
        setView("transition");
        return;
      }

      setCoreIndex((current) => current + 1);
      return;
    }

    if (profileIndex === PROFILE_QUESTIONS.length - 1) {
      void finalizeAssessment(nextAnswers);
      return;
    }

    setProfileIndex((current) => current + 1);
  };

  const handlePrevious = () => {
    if (view === "core") {
      if (coreIndex === 0) {
        setView("intro");
        return;
      }

      setCoreIndex((current) => current - 1);
      return;
    }

    if (view === "transition") {
      setView("core");
      setCoreIndex(CORE_QUESTIONS.length - 1);
      return;
    }

    if (view === "profile") {
      if (profileIndex === 0) {
        setView("transition");
        return;
      }

      setProfileIndex((current) => current - 1);
    }
  };

  if (view === "checking") {
    return (
      <PageContainer>
        <Card className="text-sm text-slate-600">{t("assessment.loading")}</Card>
      </PageContainer>
    );
  }

  if (view === "intro") {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-3xl space-y-5">
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900">{t("assessment.title")}</h1>
            <p className="text-slate-600">{t("assessment.subtitle")}</p>
            {draftRestored ? (
              <p className="text-sm text-brand-700">{t("assessment.resumeDraft")}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={startAssessment}>{t("assessment.start")}</Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (view === "transition") {
    return (
      <PageContainer>
        <div className="mx-auto max-w-3xl space-y-4">
          <AssessmentProgress current={CORE_QUESTIONS.length} total={CORE_QUESTIONS.length} />
          <Card className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-brand-700">{t("assessment.progress.core")}</p>
              <h1 className="text-3xl font-black text-slate-900">{t("assessment.transition.title")}</h1>
              <p className="text-slate-600">{t("assessment.transition.subtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setView("profile")}>{t("assessment.transition.cta")}</Button>
              <Button variant="secondary" onClick={handlePrevious}>{t("assessment.previous")}</Button>
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl space-y-4">
        {view === "core" ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{t("assessment.progress.core")}</p>
            <AssessmentProgress current={coreAnsweredCount} total={CORE_QUESTIONS.length} />
          </div>
        ) : null}

        {currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            selectedValue={selectedValue}
            disabled={view === "submitting"}
            onSelect={handleSelect}
          />
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handlePrevious}>
            {t("assessment.previous")}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
