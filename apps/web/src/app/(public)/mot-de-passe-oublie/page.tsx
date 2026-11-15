import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetForm } from "@/features/auth/reset-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ResetPage() {
  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Recevez un lien sécurisé pour réinitialiser votre mot de passe."
      footer="Aucun e-mail n'est réellement envoyé en mode démonstration."
    >
      <ResetForm />
    </AuthLayout>
  );
}
