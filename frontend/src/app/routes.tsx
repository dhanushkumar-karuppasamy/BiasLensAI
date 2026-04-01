import { Navigate, useRoutes } from "react-router-dom";
import BiasLensLandingPage from "../pages/BiasLensLandingPage";
import BiasLensInvestigativeReport from "../pages/BiasLensInvestigativeReport";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return useRoutes([
    { path: "/", element: <BiasLensInvestigativeReport /> },
    { path: "/legacy", element: <BiasLensLandingPage /> },
    { path: "/home", element: <Navigate to="/" replace /> },
    { path: "*", element: <NotFoundPage /> },
  ]);
}
