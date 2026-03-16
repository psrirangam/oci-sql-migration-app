import { useState } from "react";
import { AssessmentProvider, useAssessmentContext } from "@/contexts/AssessmentContext";
import QuestionnaireView from "@/components/QuestionnaireView";
import RecommendationView from "@/components/RecommendationView";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

function HomeContent() {
  const { result, handleReset } = useAssessmentContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />
      
      <main className="container py-8 md:py-12">
        {result ? (
          <>
            <RecommendationView />
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                Start New Assessment
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
