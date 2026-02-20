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
import { login } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Loader2, CheckCircle } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error(t.Login.validationRequired);
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email: email.trim(), password });
      setUser(result.user);
      toast.success(t.Login.toastWelcome(result.user.prenom));
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.message || t.Login.toastError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
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
            <CardTitle>{t.Login.title}</CardTitle>
            <CardDescription>
              {t.Login.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.Login.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.Login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.Login.passwordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t.Login.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
                    {t.Login.submitting}
                  </>
                ) : (
                  t.Login.submit
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t.Login.noAccount}{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                {t.Login.createAccount}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
