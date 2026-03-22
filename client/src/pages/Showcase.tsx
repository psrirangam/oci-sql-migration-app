import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap, BarChart3, Shield, Clock, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Showcase() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
      title: "SQL Server 2022 Compliant",
      description: "Assessment based on official SQL Server 2022 Licensing Guide with October 1, 2019 licensing changes"
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Personalized Recommendations",
      description: "Get tailored OCI deployment paths including Bare Metal, VM shapes, and licensing options"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: "Comprehensive Analysis",
      description: "Evaluates current state, licensing model, HA/DR requirements, and migration approach"
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Secure & Internal",
      description: "Oracle.com email validation ensures only authorized team members access the tool"
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Quick Assessment",
      description: "Complete the questionnaire in 5-10 minutes with clear, actionable recommendations"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Data Tracking",
      description: "Cumulative CSV export for customer follow-up and sales analytics"
    }
  ];

  const benefits = [
    "Understand SQL Server licensing implications for OCI migration",
    "Identify the most cost-effective deployment model for your workload",
    "Evaluate BYOL vs License Included options based on your licensing history",
    "Plan HA/DR strategies aligned with OCI capabilities",
    "Get expert guidance on migration approach (Lift & Shift, Re-platform, Re-factor)",
    "Build business case with clear OCI recommendations"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              OCI
            </div>
            <div>
              <h1 className="font-bold text-lg">SQL Server Migration</h1>
              <p className="text-xs text-muted-foreground">Assessment Tool</p>
            </div>
          </div>
          <Button 
            onClick={() => setLocation("/assessment")}
            className="gap-2"
          >
            Launch Questionnaire
          </Button>
        </div>
      </header>

      <main className="container py-12 md:py-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto mb-20 text-center">
          <div className="mb-6 inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <p className="text-sm font-semibold text-primary">Professional Assessment Tool</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
            Plan Your SQL Server Migration to OCI
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get personalized recommendations for migrating your SQL Server workloads to Oracle Cloud Infrastructure. 
            Based on the official SQL Server 2022 Licensing Guide with support for legacy versions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation("/assessment")}
              className="gap-2"
            >
              Start Assessment
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2"
            >
              Learn More
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive assessment covering all aspects of SQL Server licensing and OCI deployment
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-3">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Why Use This Assessment?</h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 border border-primary/20">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary mb-2">9</p>
                  <p className="text-muted-foreground">Strategic Questions</p>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="text-center text-sm text-muted-foreground mb-4">Covers:</p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span>SQL Server Editions & Versions</p>
                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span>Licensing Models & History</p>
                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span>Current Deployment & Cloud</p>
                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span>HA/DR & Migration Approach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
            <p className="text-muted-foreground">Simple 4-step process to get your personalized recommendation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Answer Questions", description: "Provide details about your current SQL Server environment and requirements" },
              { step: 2, title: "Assess State", description: "System evaluates your licensing, deployment, and migration needs" },
              { step: 3, title: "Generate Plan", description: "Receive personalized OCI deployment recommendations" },
              { step: 4, title: "Export Data", description: "Download assessment results as CSV for your records" }
            ].map((item, index) => (
              <div key={index} className="relative">
                <Card>
                  <CardHeader>
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">
                      {item.step}
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/20"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Plan Your Migration?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start the assessment now and get personalized OCI recommendations for your SQL Server workloads.
            Takes just 5-10 minutes to complete.
          </p>
          <Button 
            size="lg" 
            onClick={() => setLocation("/assessment")}
            className="gap-2 text-base"
          >
            Launch Assessment
          </Button>
        </section>

        {/* Footer Info */}
        <section className="mt-20 pt-12 border-t border-border text-center text-sm text-muted-foreground">
          <p className="mb-4">
            This assessment is based on the SQL Server 2022 Licensing Guide and provides general guidance.
          </p>
          <p>
            For specific licensing decisions, consult with your Microsoft licensing representative or Oracle Cloud sales team.
          </p>
        </section>
      </main>
    </div>
  );
}
