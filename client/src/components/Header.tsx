import { useLocation } from "wouter";

export default function Header() {
  const [location, setLocation] = useLocation();
  
  const adminSession = localStorage.getItem("adminSession");
  const isAdminLoggedIn = adminSession ? JSON.parse(adminSession).loggedIn : false;

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    setLocation("/");
  };
  
  return (
    <header className="bg-white dark:bg-card border-b-2 border-primary shadow-md">
      <div className="container py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setLocation("/")}
          >
            {/* Oracle Red Logo Box */}
            <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">OCI</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                SQL Server Migration
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Oracle Cloud Infrastructure Assessment Tool
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setLocation("/")}
              className={`text-sm font-semibold transition-all duration-200 ${
                location === "/" || location === "/showcase"
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setLocation("/assessment")}
              className={`text-sm font-semibold transition-all duration-200 ${
                location === "/assessment"
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Assessment
            </button>
            {isAdminLoggedIn ? (
              <>
                <button
                  onClick={() => setLocation("/admin")}
                  className={`text-sm font-semibold transition-all duration-200 ${
                    location === "/admin"
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setLocation("/admin-login")}
                className={`text-sm font-semibold transition-all duration-200 ${
                  location === "/admin-login"
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
