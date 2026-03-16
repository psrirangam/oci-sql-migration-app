import { useAssessmentContext } from "@/contexts/AssessmentContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Zap, Target } from "lucide-react";

export default function RecommendationView() {
  const { result } = useAssessmentContext();

  if (!result) {
    return null;
  }

  const { recommendation, summary, estimatedComplexity } = result;

  const complexityColor = {
    Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Summary Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your Personalized OCI Recommendation
          </CardTitle>
          <CardDescription>Based on your SQL Server 2022 licensing assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deployment Model */}
        <Card>
          <CardHeader className="pb-3">
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
        <Card>
          <CardHeader className="pb-3">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommended Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-foreground">{recommendation.architecture}</p>
        </CardContent>
      </Card>

      {/* Licensing Details */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Licensing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-sm leading-relaxed">
            {recommendation.licensingDetails}
          </p>
        </CardContent>
      </Card>

      {/* Cost Considerations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost Considerations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-sm leading-relaxed">
            {recommendation.costConsiderations}
          </p>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Key Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendation.keyBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-secondary/30 border-secondary">
        <CardHeader>
          <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {recommendation.nextSteps.map((step, index) => (
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

      {/* Footer Note */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground space-y-2">
        <p>
          <strong>Important:</strong> This assessment is based on the SQL Server 2022 Licensing Guide 
          and provides general guidance. For specific licensing decisions, please consult with your 
          Microsoft licensing representative or Oracle Cloud sales team.
        </p>
        <p>
          <strong>OCI Resources:</strong> Visit the OCI documentation for detailed deployment guides, 
          pricing information, and support resources.
        </p>
      </div>
    </div>
  );
}
