"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Field, Icon, Input } from "@/components/ui";
import { requestPasswordReset } from "@/lib/auth/session";

export function ResetForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Envoi impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-3" role="status">
        <p className="flex items-start gap-2 rounded border border-quality-validated/40 bg-quality-validated-soft/30 px-2 py-1 text-body-sm text-quality-validated">
          <Icon name="check-circle" size={15} className="mt-0.5 shrink-0" />
          Si un compte existe pour <span className="font-mono">{email}</span>, un lien de
          réinitialisation a été envoyé.
        </p>
        <Button variant="secondary" fullWidth onClick={() => setSent(false)}>
          Renvoyer un lien
        </Button>
        <Link href="/connexion" className="block font-mono text-label-md text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      {error ? (
        <p
          role="alert"
          className="rounded border border-error/50 bg-error-container/30 px-2 py-1 text-body-sm text-error"
        >
          {error}
        </p>
      ) : null}
      <Field
        label="Adresse e-mail"
        htmlFor="reset-email"
        required
        hint="Le lien expire au bout de 30 minutes."
      >
        <Input
          id="reset-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <Button type="submit" fullWidth loading={loading}>
        Envoyer le lien
      </Button>
      <Link href="/connexion" className="block font-mono text-label-md text-primary hover:underline">
        Retour à la connexion
      </Link>
    </form>
  );
}
