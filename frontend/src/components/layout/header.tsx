import { Link } from "@tanstack/react-router";
import { CheckCircle, LogOut, Users, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="bg-white border-b border-grey-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <CheckCircle className="h-8 w-8 text-blue-900" />
          <span className="text-lg font-semibold text-blue-900 tracking-tight">
            Audit <span className="text-blue-400">RGAA</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className="relative px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-600 transition-colors rounded-md hover:bg-slate-100 [&.active]:text-slate-600 [&.active]:bg-white [&.active]:border [&.active]:border-slate-700"
            >
              Dashboard
            </Link>
            <Link
              to="/projects/new"
              className="relative px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-600 transition-colors rounded-md hover:bg-slate-100 [&.active]:text-slate-600 [&.active]:bg-white [&.active]:border [&.active]:border-slate-700"
            >
              Nouveau projet
            </Link>
            {isAdmin && (
              <Link
                to="/users"
                className="relative px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-600 transition-colors rounded-md hover:bg-slate-100 [&.active]:text-slate-600 [&.active]:bg-white [&.active]:border [&.active]:border-slate-700 gap-1 inline-flex items-center"
              >
                <Users className="h-3.5 w-3.5" />
                Utilisateurs
              </Link>
            )}
          </nav>

          {user && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {user.prenom[0]}
                  {user.nom[0]}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">
                    {user.prenom} {user.nom}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isAdmin && (
                      <Badge variant="default" className="text-[10px] px-1 py-0 h-4 gap-0.5">
                        <Shield className="h-2.5 w-2.5" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-500 hover:text-slate-700"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
