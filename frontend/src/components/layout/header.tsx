import { Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-grey-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <CheckCircle className="h-8 w-8 text-blue-900" />
          <span className="text-lg font-semibold text-blue-900 tracking-tight">
            Audit <span className="text-blue-400">RGAA</span>
          </span>
        </Link>

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
        </nav>
      </div>
    </header>
  );
}
