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
    <div className="min-h-screen bg-white">
      <main className="container py-12 md:py-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto mb-20 text-center">
          <div className="mb-6 inline-block px-4 py-2 rounded-full bg-red-50 border border-primary">
            <p className="text-sm font-bold text-primary">Professional Assessment Tool</p>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight tracking-tight">
            Plan Your SQL Server Migration to OCI
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Get personalized recommendations for migrating your SQL Server workloads to Oracle Cloud Infrastructure. 
            Based on the official SQL Server 2022 Licensing Guide with support for legacy versions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation("/assessment")}
              className="bg-primary hover:bg-red-700 text-white font-bold px-8 py-6 text-lg"
            >
              Start Assessment
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Powerful Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="border border-border hover:shadow-lg transition-shadow duration-200 hover:border-primary/50">
                <CardHeader>
                  <div className="mb-3">{feature.icon}</div>
                  <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20 bg-red-50 rounded-lg p-12">
          <h3 className="text-3xl font-bold mb-8 text-foreground">Why Use This Assessment?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-foreground font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Answer Questions", desc: "Provide information about your current SQL Server setup and OCI requirements" },
              { step: "2", title: "Analyze Licensing", desc: "We evaluate your licensing model, Software Assurance, and grandfathering status" },
              { step: "3", title: "Generate Report", desc: "Receive a comprehensive assessment with OCI instance recommendations" },
              { step: "4", title: "Next Steps", desc: "Get actionable recommendations for deployment, licensing, and migration" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold text-lg">
                  {item.step}
                </div>
                <h4 className="font-bold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary to-red-700 text-white rounded-lg p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Migrate to OCI?</h3>
          <p className="text-lg mb-8 text-red-50">Start your assessment now and get personalized recommendations for your SQL Server migration.</p>
          <Button 
            size="lg"
            onClick={() => setLocation("/assessment")}
            className="bg-white text-primary hover:bg-red-50 font-bold px-8 py-6 text-lg"
          >
            Launch Questionnaire
          </Button>
        </section>
      </main>
    </div>
  );
}
