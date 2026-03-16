import React, { createContext, useContext } from "react";
import { useAssessment } from "@/hooks/useAssessment";

type AssessmentContextType = ReturnType<typeof useAssessment>;

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const assessment = useAssessment();

  return (
    <AssessmentContext.Provider value={assessment}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessmentContext() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessmentContext must be used within AssessmentProvider");
  }
  return context;
}
