import { useState } from "react";
import { useLocation } from "wouter";
import { AssessmentProvider, useAssessmentContext } from "@/contexts/AssessmentContext";
import QuestionnaireView from "@/components/QuestionnaireView";
import RecommendationView from "@/components/RecommendationView";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

function HomeContent() {
  const { result, handleReset } = useAssessmentContext();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-5 md:py-6">
        {result ? (
          <>
            <RecommendationView />
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                Start New Assessment
              </Button>
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                Back to Overview
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-5">
            <section className="apex-page-header">
              <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Oracle Internal</span>
                    <span>/</span>
                    <span>Cloud Migration</span>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Windows and SQL Server Migration Assessment
                  </h2>
                  <p className="mt-1 max-w-4xl text-sm text-muted-foreground">
                    Capture source platform, licensing posture, estate size, and target OCI availability model before architecture design.
                  </p>
                </div>
              </div>
            </section>
            <QuestionnaireView />
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AssessmentProvider>
      <HomeContent />
    </AssessmentProvider>
  );
}
