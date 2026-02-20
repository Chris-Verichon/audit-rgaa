import { Link } from "@tanstack/react-router";
import { CheckCircle, LogOut, Users, Shield, Moon, Sun, ChevronDown, Languages } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t, locale, toggleLocale } = useI18n();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-grey-50 dark:border-gray-800">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <CheckCircle className="h-8 w-8 text-blue-900 dark:text-blue-400" />
          <span className="text-lg font-semibold text-blue-900 dark:text-blue-300 tracking-tight">
            Audit <span className="text-blue-400 dark:text-blue-500">RGAA</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className="relative px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 [&.active]:text-slate-600 dark:[&.active]:text-white [&.active]:bg-white dark:[&.active]:bg-slate-800 [&.active]:border [&.active]:border-slate-700"
            >
              {t.Header.dashboard}
            </Link>
            <Link
              to="/projects/new"
              className="relative px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 [&.active]:text-slate-600 dark:[&.active]:text-white [&.active]:bg-white dark:[&.active]:bg-slate-800 [&.active]:border [&.active]:border-slate-700"
            >
              {t.Header.newProject}
            </Link>
            {isAdmin && (
              <Link
                to="/users"
                className="relative px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 [&.active]:text-slate-600 dark:[&.active]:text-white [&.active]:bg-white dark:[&.active]:bg-slate-800 [&.active]:border [&.active]:border-slate-700 gap-1 inline-flex items-center"
              >
                <Users className="h-3.5 w-3.5" />
                {t.Header.users}
              </Link>
            )}
          </nav>

          {user && (
            <div className="flex items-center ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {user.prenom[0]}
                    {user.nom[0]}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium leading-none dark:text-slate-200">
                      {user.prenom} {user.nom}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isAdmin && (
                        <Badge variant="default" className="text-[10px] px-1 py-0 h-4 gap-0.5">
                          <Shield className="h-2.5 w-2.5" />
                          {t.Common.admin}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <div
                    className="relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleTheme();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isDark ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                      <span>{t.Common.darkMode}</span>
                    </div>
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLocale();
                    }}
                    className="cursor-pointer"
                  >
                    <Languages className="mr-2 h-4 w-4" />
                    {locale === "fr" ? t.Common.english : t.Common.french}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t.Common.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
