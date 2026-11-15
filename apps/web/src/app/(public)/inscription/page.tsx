import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Choisissez votre profil pour adapter votre espace de travail."
      footer="Inscription de démonstration : aucune donnée réelle n'est transmise."
    >
      <SignupForm />
    </AuthLayout>
  );
}
