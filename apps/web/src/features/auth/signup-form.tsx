"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import { signUp } from "@/lib/auth/session";
import { PROFILE_LABELS, type UserProfileKind } from "@/types";

const PROFILES: { value: UserProfileKind; description: string; icon: string }[] = [
  {
    value: "PLANNER",
    description: "Préparer des scénarios et comparer des sites.",
    icon: "target",
  },
  {
    value: "EDUCATOR",
    description: "Construire des activités pédagogiques.",
    icon: "book",
  },
  {
    value: "EXPLORER",
    description: "Explorer librement les sites et les données.",
    icon: "compass",
  },
];

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<UserProfileKind>("PLANNER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp({ fullName, email, password, profile });
      router.push("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-md">
      {error ? (
        <p
          role="alert"
          className="rounded border border-error/50 bg-error-container/30 px-sm py-xs text-body-sm text-error"
        >
          {error}
        </p>
      ) : null}

      <fieldset>
        <legend className="font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
          Profil
        </legend>
        <div className="mt-xs grid gap-xs">
          {PROFILES.map((item) => {
            const selected = profile === item.value;
            return (
              <label
                key={item.value}
                className={cn(
                  "flex cursor-pointer items-start gap-sm rounded border px-sm py-xs",
                  selected
                    ? "border-primary/60 bg-primary/10"
                    : "border-grid hover:border-outline-variant hover:bg-container-high",
                )}
              >
                <input
                  type="radio"
                  name="profile"
                  value={item.value}
                  checked={selected}
                  onChange={() => setProfile(item.value)}
                  className="mt-1 accent-primary"
                />
                <span className="min-w-0">
                  <span className="block text-body-md text-on-surface">
                    {PROFILE_LABELS[item.value]}
                  </span>
                  <span className="block text-body-sm text-on-surface-variant">
                    {item.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field label="Nom complet" htmlFor="signup-name" required>
        <Input
          id="signup-name"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </Field>

      <Field label="Adresse e-mail" htmlFor="signup-email" required>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field
        label="Mot de passe"
        htmlFor="signup-password"
        required
        hint="8 caractères minimum."
      >
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      <Button type="submit" fullWidth loading={loading}>
        Créer le compte
      </Button>

      <p className="text-body-sm text-on-surface-variant">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
