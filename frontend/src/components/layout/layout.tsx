import { Outlet } from "@tanstack/react-router";
import { Header } from "./header";
import { Toaster } from "sonner";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
