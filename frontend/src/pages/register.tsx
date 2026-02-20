import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { register } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Loader2, CheckCircle } from "lucide-react";
import type { OrganisationType } from "@/types";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { t } = useI18n();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organisation, setOrganisation] = useState<OrganisationType>("entreprise");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom.trim() || !prenom.trim() || !email.trim() || !password) {
      toast.error(t.Register.validationAllFieldsRequired);
      return;
    }

    if (password.length < 6) {
      toast.error(t.Register.validationPasswordMinLength);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.Register.validationPasswordsMismatch);
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        password,
        organisation,
      });
      setUser(result.user);
      toast.success(t.Register.toastWelcome(result.user.prenom));
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.message || t.Register.toastError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="h-10 w-10 text-blue-900" />
            <span className="text-2xl font-bold text-blue-900">
              Audit <span className="text-blue-400">RGAA</span>
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.Register.title}</CardTitle>
            <CardDescription>
              {t.Register.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">{t.Register.firstNameLabel}</Label>
                  <Input
                    id="prenom"
                    placeholder={t.Register.firstNamePlaceholder}
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">{t.Register.lastNameLabel}</Label>
                  <Input
                    id="nom"
                    placeholder={t.Register.lastNamePlaceholder}
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.Register.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.Register.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organisation">{t.Register.organisationLabel}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrganisation("entreprise")}
                    className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                      organisation === "entreprise"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {t.Register.enterprise}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrganisation("particulier")}
                    className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                      organisation === "particulier"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {t.Register.individual}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.Register.passwordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t.Register.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                  {t.Register.passwordMinChars}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.Register.confirmPasswordLabel}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t.Register.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.Register.submitting}
                  </>
                ) : (
                  t.Register.submit
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t.Register.alreadyHaveAccount}{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                {t.Register.login}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
