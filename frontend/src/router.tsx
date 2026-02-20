import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import { Layout } from "@/components/layout/layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { DashboardPage } from "@/pages/dashboard";
import { NewProjectPage } from "@/pages/new-project";
import { ProjectDetailPage } from "@/pages/project-detail";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { UserManagementPage } from "@/pages/user-management";
import { getToken } from "@/lib/api";

// Root route
const rootRoute = createRootRoute({
  component: AuthLayout,
});

// ─── Auth routes (public) ───

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: "/" });
    }
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: "/" });
    }
  },
});

// ─── Protected layout ───

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  component: Layout,
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
  },
});

// ─── Protected routes ───

// Dashboard (index)
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: DashboardPage,
});

// New project
const newProjectRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/projects/new",
  component: NewProjectPage,
});

// Project detail
const projectDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/projects/$projectId",
  component: ProjectDetailPage,
});

// User management (admin)
const userManagementRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/users",
  component: UserManagementPage,
});

// Route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  layoutRoute.addChildren([
    indexRoute,
    newProjectRoute,
    projectDetailRoute,
    userManagementRoute,
  ]),
]);

// Router
export const router = createRouter({ routeTree });

// Type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
