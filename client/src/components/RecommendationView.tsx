import { useAssessmentContext } from "@/contexts/AssessmentContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Zap, Target, Download, FileText, ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";
import { convertAssessmentToRecord, saveRecordToLocalStorage } from "@/lib/assessmentStorage";
import { generatePDF } from "@/lib/pdfExport";
import { RESOURCE_LINKS } from "@/lib/resourceLinks";
import { trpc } from "@/lib/trpc";

export default function RecommendationView() {
  const { result, answers } = useAssessmentContext();
  const saveMutation = trpc.assessment.save.useMutation();
  const hasSaved = useRef(false);

  if (!result) {
    return null;
  }

  const { recommendation, summary, estimatedComplexity } = result;

  // Save assessment record to localStorage for admin dashboard
  useEffect(() => {
    if (result && answers && !hasSaved.current) {
      hasSaved.current = true;
      const record = convertAssessmentToRecord(answers as any, recommendation);
      saveRecordToLocalStorage(record);
      saveMutation.mutate({
        customerName: record.customerName,
        customerEmail: record.customerEmail,
        sourcePlatform: record.sourcePlatform,
        workloadType: record.workloadType,
        numInstances: record.numInstances,
        totalVcpu: record.totalVcpu,
        totalStorageTb: record.totalStorageTb,
        currentlyRunning: (answers as any).currentlyRunning,
        currentVersion: record.currentVersion,
        currentEdition: record.currentEdition,
        currentDeploymentType: record.deploymentType,
        currentLicensingModel: record.currentLicensingModel,
        softwareAssurance: record.softwareAssurance,
        windowsLicensing: record.windowsLicensing,
        licensePurchaseDate: record.licensePurchaseDate,
        targetVersion: record.targetVersion,
        targetEdition: record.targetEdition,
        hadrRequirements: record.hadrRequirements,
        migrationApproach: record.migrationApproach,
        deploymentModel: recommendation.deploymentModel,
        licensingOption: recommendation.licensingOption,
        recommendedInstances: recommendation.recommendedInstances?.join("; "),
        recommendationSummary: summary,
        answersJson: answers,
        recommendationJson: recommendation,
      });
    }
  }, [result, answers, recommendation, saveMutation, summary]);

  const complexityColor: Record<string, string> = {
    Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const handleDownloadPDF = () => {
    generatePDF(answers as any, result, recommendation);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 animate-in fade-in duration-500">
      {/* Summary Section */}
      <Card className="apex-region gap-0 rounded-sm py-0">
        <CardHeader className="apex-region-header">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-primary" />
            OCI Recommendation
          </CardTitle>
          <CardDescription>Generated from the migration assessment inputs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="overflow-x-auto border border-border bg-[#faf9f7] p-4 text-xs whitespace-pre-wrap break-words">
              {summary}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deployment Model */}
        <Card className="apex-region gap-0 rounded-sm py-0">
          <CardHeader className="border-b border-border bg-[#faf9f7] pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Deployment Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">
              {recommendation.deploymentModel}
            </p>
          </CardContent>
        </Card>

        {/* Licensing Option */}
        <Card className="apex-region gap-0 rounded-sm py-0">
          <CardHeader className="border-b border-border bg-[#faf9f7] pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              Licensing Option
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">
              {recommendation.licensingOption}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Complexity Badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Estimated Complexity:</span>
        <Badge className={`${complexityColor[estimatedComplexity]} border-0`}>
          {estimatedComplexity}
        </Badge>
      </div>

      {/* Architecture */}
      <Card className="apex-region gap-0 rounded-sm py-0">
        <CardHeader className="border-b border-border bg-[#faf9f7]">
          <CardTitle className="text-lg">Recommended Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-foreground">{recommendation.architecture}</p>
        </CardContent>
      </Card>

      {/* Licensing Details */}
      <Card className="apex-region gap-0 rounded-sm py-0">
        <CardHeader className="border-b border-border bg-[#faf9f7]">
          <CardTitle className="text-lg">Licensing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-sm leading-relaxed">
            {recommendation.licensingDetails}
          </p>
        </CardContent>
      </Card>

      {/* Cost Considerations */}
      <Card className="apex-region gap-0 rounded-sm py-0">
        <CardHeader className="border-b border-border bg-[#faf9f7]">
          <CardTitle className="text-lg">Cost Considerations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-sm leading-relaxed">
            {recommendation.costConsiderations}
          </p>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <Card className="apex-region gap-0 rounded-sm py-0">
        <CardHeader className="border-b border-border bg-[#faf9f7]">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Key Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendation.keyBenefits.map((benefit: string, index: number) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="apex-region gap-0 rounded-sm py-0">
        <CardHeader className="border-b border-border bg-[#faf9f7]">
          <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {recommendation.nextSteps.map((step: string, index: number) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Reference Links */}
      <Card className="apex-region gap-0 rounded-sm py-0">
        <CardHeader className="border-b border-border bg-[#faf9f7]">
          <CardTitle className="text-lg">Reference Links</CardTitle>
          <CardDescription>
            OCI and Oracle internal references for licensing, deployment, HA/DR, identity, and marketplace images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {RESOURCE_LINKS.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group block border border-border bg-white p-3 text-sm transition-colors hover:border-primary hover:bg-[#faf9f7]"
              >
                <div className="mb-1 flex items-start justify-between gap-3">
                  <span className="font-semibold text-foreground">{link.title}</span>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="text-xs font-medium uppercase text-primary">{link.category}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{link.description}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Report Section */}
      <Card className="apex-region gap-0 rounded-sm py-0">
        <CardHeader className="border-b border-border bg-[#faf9f7]">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Download Assessment Report
          </CardTitle>
          <CardDescription>
            Download your personalized assessment report as PDF for sharing with stakeholders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleDownloadPDF}
            className="w-full rounded-sm bg-primary font-semibold text-white hover:bg-[#a53a2a] md:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report (PDF)
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Your assessment is saved for dashboard tracking. If OCI persistence is configured, it is stored in ATP and archived to Object Storage.
          </p>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="border border-border bg-white p-4 text-xs text-muted-foreground space-y-2">
        <p>
          <strong>Important:</strong> This assessment applies deterministic planning rules from current Microsoft
          Product Terms, SQL Server edition capabilities, and Oracle OCI guidance. For specific licensing
          decisions, consult the Microsoft licensing representative or Oracle Cloud account team.
        </p>
        <p>
          <strong>OCI Resources:</strong> Visit the OCI documentation for detailed deployment guides,
          or contact your Oracle sales representative for implementation support.
        </p>
      </div>
    </div>
  );
}
