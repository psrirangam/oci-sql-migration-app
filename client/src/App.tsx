import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Showcase from "./pages/Showcase";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

function Router() {
  const { user } = useAuth();
  const adminSession = localStorage.getItem("adminSession");
  const isAdminLoggedIn = adminSession ? JSON.parse(adminSession).loggedIn : false;
  
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Switch>
          <Route path={"/admin-login"} component={AdminLogin} />
          <Route path={"/admin"} component={() => isAdminLoggedIn ? <AdminDashboard /> : <AdminLogin />} />
          <Route path={"/showcase"} component={Showcase} />
          <Route path={"/assessment"} component={Home} />
          <Route path={"/"} component={Showcase} />
          <Route path={"/404"} component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
