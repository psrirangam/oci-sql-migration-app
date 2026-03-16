export default function Header() {
  return (
    <header className="bg-white dark:bg-card border-b border-border shadow-sm">
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          <div className="hidden md:block text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Based on SQL Server 2022 Licensing Guide
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
