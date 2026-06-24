import { useLocation } from "wouter";

export default function Header() {
  const [location, setLocation] = useLocation();
  
  return (
    <header>
      <div className="apex-shell-header">
        <div className="container py-2.5">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setLocation("/")}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-xs font-bold text-white">
                OCI
              </div>
              <div>
                <h1 className="text-base font-semibold text-white">
                  OCI Migration Assessment
                </h1>
                <p className="text-xs text-white/70">
                  Windows and SQL Server planning
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 text-xs text-white/70 md:flex">
              <span className="rounded-sm border border-white/20 px-2 py-1">Internal</span>
            </div>
          </div>
        </div>
      </div>
      <div className="apex-toolbar">
        <div className="container">
          <div className="flex items-center justify-between">
            <div
              className="hidden items-center gap-3 py-2 text-xs text-muted-foreground md:flex"
              onClick={() => setLocation("/")}
            >
              <span>Applications</span>
              <span>/</span>
              <span className="font-medium text-foreground">SQL Assessment</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLocation("/showcase")}
                className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  location === "/showcase"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Guide
              </button>
              <button
                onClick={() => setLocation("/assessment")}
                className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  location === "/" || location === "/assessment"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Assessment
              </button>
              <button
                onClick={() => setLocation("/admin")}
                className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  location.startsWith("/admin")
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
