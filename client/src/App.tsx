import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import WeeklyWorkflow from "@/pages/WeeklyWorkflow";
import LoginPage from "@/pages/LoginPage";
import { WorkflowProvider } from "@/context/WorkflowContext";
import { Loader2 } from "lucide-react";

interface AuthUser {
  id: string;
  email: string;
}

function AuthenticatedApp({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  return (
    <WorkflowProvider>
      <Switch>
        <Route path="/" component={() => <WeeklyWorkflow userEmail={user.email} onLogout={onLogout} />} />
        <Route component={NotFound} />
      </Switch>
    </WorkflowProvider>
  );
}

function AppContent() {
  const [authRefreshKey, setAuthRefreshKey] = useState(0);

  const { data: user, isLoading, error } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const handleLogin = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    setAuthRefreshKey(k => k + 1);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    queryClient.clear();
    setAuthRefreshKey(k => k + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !user) {
    const is401 = error.message?.includes("401");
    if (!is401) {
      return (
        <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground text-sm">Unable to connect to server</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] })}
              className="text-primary text-sm hover:underline"
              data-testid="button-retry"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AuthenticatedApp key={authRefreshKey} user={user} onLogout={handleLogout} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
