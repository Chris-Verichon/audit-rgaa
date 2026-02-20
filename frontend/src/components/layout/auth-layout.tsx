import { Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export function AuthLayout() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
