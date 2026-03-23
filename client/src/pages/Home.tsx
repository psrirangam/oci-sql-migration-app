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
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container py-8 md:py-12">
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
          <QuestionnaireView />
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
