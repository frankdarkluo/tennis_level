"use client";

import { FormEvent, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/lib/i18n/config";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  contextMessage?: string;
};

export function LoginModal({ open, onClose, contextMessage }: LoginModalProps) {
  const { user, sendMagicLink, signOut } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const helperText = useMemo(() => {
    if (user?.email) {
      return t("auth.modal.loggedInAs", { value: user.email });
    }
    return t("auth.modal.helper");
  }, [t, user?.email]);

  function localizeAuthErrorMessage(error: string) {
    const normalizedError = error.trim().toLowerCase();

    if (
      normalizedError.includes("email rate limit exceeded")
      || normalizedError.includes("over_email_send_rate_limit")
      || normalizedError.includes("rate limit")
    ) {
      return t("auth.modal.errorRateLimit");
    }

    return error;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const result = await sendMagicLink(email);

    if (result.error) {
      setStatus("error");
      setMessage(localizeAuthErrorMessage(result.error));
      return;
    }

    setStatus("sent");
    setMessage(t("auth.modal.linkSent"));
  }

  async function handleSignOut() {
    await signOut();
    setStatus("idle");
    setMessage(t("auth.modal.signedOut"));
  }

  return (
    <Modal open={open} onClose={onClose} title={user ? t("auth.modal.accountTitle") : t("auth.modal.emailTitle")}>
      <div className="space-y-4">
        {contextMessage && !user ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {contextMessage}
          </div>
        ) : null}
        <p className="text-sm leading-6 text-slate-600">{helperText}</p>

        {user ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSignOut}>{t("auth.modal.signOut")}</Button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={status === "sending"}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!email || status === "sending"}>
                {status === "sending" ? t("auth.modal.sending") : t("auth.modal.send")}
              </Button>
            </div>
          </form>
        )}

        {message ? (
          <div
            className={status === "error"
              ? "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              : "rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700"}
          >
            {message}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
