import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthLayout
      title="Connexion"
      subtitle="Accédez à votre console de planification lunaire."
      footer="Connexion de démonstration : aucune donnée réelle n'est transmise."
    >
      <LoginForm />
    </AuthLayout>
  );
}
