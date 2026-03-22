import { useLocation } from "wouter";

export default function Header() {
  const [location, setLocation] = useLocation();
  
  return (
    <header className="bg-white dark:bg-card border-b border-border shadow-sm">
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setLocation("/")}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-white font-bold text-lg">OCI</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                SQL Server Migration
              </h1>
              <p className="text-sm text-muted-foreground">
                Assessment & OCI Recommendation Tool
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/")}
              className={`text-sm font-medium transition-colors ${
                location === "/" || location === "/showcase"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setLocation("/assessment")}
              className={`text-sm font-medium transition-colors ${
                location === "/assessment"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Assessment
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
