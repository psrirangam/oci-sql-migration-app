import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Filter, RefreshCw, LogOut } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";

interface AssessmentRecord {
  id: string;
  timestamp: string;
  customerName: string;
  customerEmail: string;
  numInstances: number;
  currentVersion: string;
  currentEdition: string;
  currentDeployment: string;
  currentDeploymentType: string;
  licensingModel: string;
  softwareAssurance: string;
  purchaseDate: string;
  targetVersion: string;
  targetEdition: string;
  hadrRequirements: string;
  migrationApproach: string;
  licensingOption: string;
  recommendedInstances: string;
  deploymentModel: string;
  recommendationSummary: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRecommendation, setFilterRecommendation] = useState("");
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin session
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    const isAdminLoggedIn = adminSession ? JSON.parse(adminSession).loggedIn : false;
    
    if (!isAdminLoggedIn) {
      setLocation("/admin-login");
      return;
    }

    // Load assessments from localStorage
    const storedAssessments = localStorage.getItem("assessmentRecords");
    if (storedAssessments) {
      try {
        const parsed = JSON.parse(storedAssessments);
        setAssessments(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Failed to parse assessments:", error);
        setAssessments([]);
      }
    }
    setIsLoading(false);
  }, [setLocation]);

  // Filter and search assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesSearch =
        assessment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        !filterRecommendation ||
        assessment.licensingOption?.toLowerCase().includes(filterRecommendation.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [assessments, searchTerm, filterRecommendation]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredAssessments.length) {
      alert("No assessments to export");
      return;
    }

    const headers = [
      "Timestamp",
      "Customer Name",
      "Customer Email",
      "Number of Instances",
      "Current Version",
      "Current Edition",
      "Current Deployment",
      "Deployment Type",
      "License Purchase Date",
      "Current Licensing Model",
      "Software Assurance",
      "Target Version",
      "Target Edition",
      "HA/DR Requirements",
      "Migration Approach",
      "Licensing Option",
      "Recommended Instances",
      "Deployment Model",
      "Recommendation Summary",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredAssessments.map((assessment) =>
        [
          assessment.timestamp || "",
          `"${assessment.customerName || ""}"`,
          assessment.customerEmail || "",
          assessment.numInstances || "",
          assessment.currentVersion || "",
          assessment.currentEdition || "",
          assessment.currentDeployment || "",
          assessment.currentDeploymentType || "",
          assessment.purchaseDate || "",
          assessment.licensingModel || "",
          assessment.softwareAssurance || "",
          assessment.targetVersion || "",
          assessment.targetEdition || "",
          assessment.hadrRequirements || "",
          assessment.migrationApproach || "",
          `"${assessment.licensingOption || ""}"`,
          `"${assessment.recommendedInstances || ""}"`,
          assessment.deploymentModel || "",
          `"${assessment.recommendationSummary || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sql-server-assessments-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!filteredAssessments.length) {
      alert("No assessments to export");
      return;
    }

    const headers = [
      "Timestamp",
      "Customer Name",
      "Customer Email",
      "Number of Instances",
      "Current Version",
      "Current Edition",
      "Current Deployment",
      "Deployment Type",
      "License Purchase Date",
      "Current Licensing Model",
      "Software Assurance",
      "Target Version",
      "Target Edition",
      "HA/DR Requirements",
      "Migration Approach",
      "Licensing Option",
      "Recommended Instances",
      "Deployment Model",
      "Recommendation Summary",
    ];

    const csvContent = [
      headers.join("\t"),
      ...filteredAssessments.map((assessment) =>
        [
          assessment.timestamp || "",
          assessment.customerName || "",
          assessment.customerEmail || "",
          assessment.numInstances || "",
          assessment.currentVersion || "",
          assessment.currentEdition || "",
          assessment.currentDeployment || "",
          assessment.currentDeploymentType || "",
          assessment.purchaseDate || "",
          assessment.licensingModel || "",
          assessment.softwareAssurance || "",
          assessment.targetVersion || "",
          assessment.targetEdition || "",
          assessment.hadrRequirements || "",
          assessment.migrationApproach || "",
          assessment.licensingOption || "",
          assessment.recommendedInstances || "",
          assessment.deploymentModel || "",
          assessment.recommendationSummary || "",
        ].join("\t")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sql-server-assessments-${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Assessment Dashboard</h1>
            <p className="text-muted-foreground">
              View and manage all SQL Server migration assessments
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessments?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Filtered Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAssessments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {assessments?.[0]?.timestamp
                  ? new Date(assessments[0].timestamp).toLocaleDateString()
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Search by Name or Email
                </label>
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Filter by Licensing Option
                </label>
                <Input
                  placeholder="e.g., License Included, BYOL..."
                  value={filterRecommendation}
                  onChange={(e) => setFilterRecommendation(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>

              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export as CSV
              </Button>

              <Button
                onClick={handleExportExcel}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Download className="w-4 h-4" />
                Export as Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assessments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Records</CardTitle>
            <CardDescription>
              Showing {filteredAssessments.length} of {assessments?.length || 0} assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading assessments...</div>
            ) : filteredAssessments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assessments found. Try adjusting your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Instances
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Current Version
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Licensing Option
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Deployment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssessments.map((assessment, index) => (
                      <tr
                        key={index}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-muted-foreground">
                          {assessment.timestamp
                            ? new Date(assessment.timestamp).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {assessment.customerName || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {assessment.customerEmail || "N/A"}
                        </td>
                        <td className="py-3 px-4">{assessment.numInstances || "N/A"}</td>
                        <td className="py-3 px-4">{assessment.currentVersion || "N/A"}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                            {assessment.licensingOption || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{assessment.deploymentModel || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
