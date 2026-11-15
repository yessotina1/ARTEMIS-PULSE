"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DemoBanner,
  Field,
  Icon,
  Input,
  Select,
} from "@/components/ui";
import {
  clearSession,
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
} from "@/lib/auth/session";
import { USE_MOCKS } from "@/lib/env";
import { PROFILE_LABELS, type UserProfileKind } from "@/types";
import { cn } from "@/lib/cn";

const PROFILE_OPTIONS = (
  Object.keys(PROFILE_LABELS) as UserProfileKind[]
).map((profile) => ({ value: profile, label: PROFILE_LABELS[profile] }));

export function SettingsView() {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  const [fullName, setFullName] = useState(session?.user.fullName ?? "Camille Roux");
  const [email, setEmail] = useState(session?.user.email ?? "camille.roux@artemis-pulse.eu");
  const [organization, setOrganization] = useState(
    session?.user.organization ?? "Centre de planification polaire",
  );
  const [profile, setProfile] = useState<UserProfileKind>(session?.user.profile ?? "PLANNER");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (fullName.trim().length < 2) nextErrors.fullName = "Indiquez votre nom complet.";
    if (!email.includes("@")) nextErrors.email = "Adresse e-mail invalide.";
    setErrors(nextErrors);
    setSaved(false);
    if (Object.keys(nextErrors).length > 0) return;
    setSaved(true);
  }

  function logout() {
    clearSession();
    router.push("/");
  }

  return (
    <div className="space-y-md">
      <div className="grid gap-md lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader
            eyebrow="Profil"
            title="Identité et rôle"
            icon={<Icon name="user" size={16} />}
            actions={session ? <Badge tone="success">SESSION ACTIVE</Badge> : <Badge tone="neutral">INVITÉ</Badge>}
          />
          <CardBody>
            <form onSubmit={save} noValidate className="space-y-md">
              {saved ? (
                <p
                  role="status"
                  className="rounded border border-quality-validated/40 bg-quality-validated-soft/30 px-sm py-xs text-body-sm text-quality-validated"
                >
                  Préférences enregistrées localement (démonstration, aucune requête envoyée).
                </p>
              ) : null}
              <div className="grid gap-md sm:grid-cols-2">
                <Field label="Nom complet" htmlFor="settings-name" required error={errors.fullName}>
                  <Input
                    id="settings-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    invalid={Boolean(errors.fullName)}
                  />
                </Field>
                <Field label="Adresse e-mail" htmlFor="settings-email" required error={errors.email}>
                  <Input
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    invalid={Boolean(errors.email)}
                  />
                </Field>
                <Field label="Organisation" htmlFor="settings-org">
                  <Input
                    id="settings-org"
                    value={organization}
                    onChange={(event) => setOrganization(event.target.value)}
                  />
                </Field>
                <Field label="Profil" htmlFor="settings-profile" hint="Détermine votre espace de travail.">
                  <Select
                    id="settings-profile"
                    options={PROFILE_OPTIONS}
                    value={profile}
                    onChange={(event) => setProfile(event.target.value as UserProfileKind)}
                  />
                </Field>
              </div>

              <fieldset>
                <legend className="mb-xs font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
                  Choix du profil
                </legend>
                <div className="grid gap-xs sm:grid-cols-3">
                  {(Object.keys(PROFILE_LABELS) as UserProfileKind[]).map((item) => (
                    <label
                      key={item}
                      className={cn(
                        "flex cursor-pointer items-center gap-sm rounded border px-sm py-xs text-body-sm",
                        profile === item
                          ? "border-primary/60 bg-primary/10"
                          : "border-grid hover:border-outline-variant",
                      )}
                    >
                      <input
                        type="radio"
                        name="settings-profile-radio"
                        checked={profile === item}
                        onChange={() => setProfile(item)}
                        className="accent-primary"
                      />
                      {PROFILE_LABELS[item]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap items-center gap-sm border-t border-outline-variant pt-sm">
                <Button type="submit">Enregistrer</Button>
                <Button variant="secondary" onClick={() => setSaved(false)}>Annuler</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-md">
          <Card>
            <CardHeader eyebrow="Affichage" title="Préférences" icon={<Icon name="sliders" size={16} />} />
            <CardBody className="space-y-sm">
              <Field label="Fuseau horaire" htmlFor="settings-timezone" hint="Toutes les dates sont affichées en UTC.">
                <Select
                  id="settings-timezone"
                  options={[{ value: "UTC", label: "UTC — verrouillé" }]}
                  value="UTC"
                  disabled
                />
              </Field>
              <div className="space-y-xs font-mono text-label-sm text-on-surface-variant">
                <p className="flex items-center justify-between gap-sm">
                  Unités <span className="text-on-surface">° · m · s · W/m²</span>
                </p>
                <p className="flex items-center justify-between gap-sm">
                  Densité <span className="text-on-surface">Console haute densité</span>
                </p>
                <p className="flex items-center justify-between gap-sm">
                  Bandeau démo <DemoBanner />
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader eyebrow="Données" title="Provenance & mode" icon={<Icon name="layers" size={16} />} />
            <CardBody className="space-y-xs font-mono text-label-sm text-on-surface-variant">
              <p className="flex justify-between gap-sm">
                Source <span className="text-on-surface">SPICE / DE440</span>
              </p>
              <p className="flex justify-between gap-sm">
                Modèle <span className="text-on-surface">MOLA/LOLA 20 m</span>
              </p>
              <p className="flex justify-between gap-sm">
                Version <span className="text-on-surface">2029.1</span>
              </p>
              <p className="flex justify-between gap-sm">
                Mode API <span className="text-on-surface">{USE_MOCKS ? "Mocks" : "HTTP"}</span>
              </p>
              <Link href="/documentation" className="mt-xs block text-primary hover:underline">
                Hypothèses et limites →
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader eyebrow="Session" title="Authentification" icon={<Icon name="logout" size={16} />} />
            <CardBody className="space-y-sm">
              <p className="text-body-sm text-on-surface-variant">
                {session
                  ? `Connecté en tant que ${session.user.fullName} (${PROFILE_LABELS[session.user.profile]}).`
                  : "Aucune session active : les écrans planificateur restent accessibles en mode démonstration."}
              </p>
              {session ? (
                <Button variant="danger" fullWidth onClick={logout}>
                  Se déconnecter
                </Button>
              ) : (
                <Link href="/connexion">
                  <Button fullWidth>Se connecter</Button>
                </Link>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <p className="font-mono text-label-sm text-on-surface-variant">
        Terre visible = visibilité géométrique, pas une garantie de liaison radio · Soleil visible ≠
        énergie produite
      </p>
    </div>
  );
}
