"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { signIn } from "@/lib/auth/session";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof fieldErrors = {};
    if (!email.includes("@")) nextErrors.email = "Saisissez une adresse e-mail valide.";
    if (password.length < 8) nextErrors.password = "8 caractères minimum.";
    setFieldErrors(nextErrors);
    setError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await signIn({ email, password });
      router.push("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
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

      <Field label="Adresse e-mail" htmlFor="login-email" required error={fieldErrors.email}>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={Boolean(fieldErrors.email)}
          placeholder="prenom.nom@organisation.eu"
        />
      </Field>

      <Field label="Mot de passe" htmlFor="login-password" required error={fieldErrors.password}>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          invalid={Boolean(fieldErrors.password)}
        />
      </Field>

      <div className="flex items-center justify-between gap-2">
        <Link
          href="/mot-de-passe-oublie"
          className="font-mono text-label-md text-primary hover:underline"
        >
          Mot de passe oublié ?
        </Link>
        <span className="font-mono text-label-sm text-on-surface-variant">
          Démo : 8 caractères minimum
        </span>
      </div>

      <Button type="submit" fullWidth loading={loading}>
        Se connecter
      </Button>

      <p className="text-body-sm text-on-surface-variant">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
