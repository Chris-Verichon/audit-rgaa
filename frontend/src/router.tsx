import {
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import { Layout } from "@/components/layout/layout";
import { DashboardPage } from "@/pages/dashboard";
import { NewProjectPage } from "@/pages/new-project";
import { ProjectDetailPage } from "@/pages/project-detail";

// Root route with layout
const rootRoute = createRootRoute({
  component: Layout,
});

// Dashboard (index)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

// Nouveau projet
const newProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/new",
  component: NewProjectPage,
});

// Détail projet
const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId",
  component: ProjectDetailPage,
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  newProjectRoute,
  projectDetailRoute,
]);

// Router
export const router = createRouter({ routeTree });

// Type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
