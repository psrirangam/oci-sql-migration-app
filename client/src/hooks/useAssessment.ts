import { useState, useCallback } from "react";
import { AssessmentAnswers, generateRecommendation, QUESTIONS } from "@/lib/assessmentLogic";

export function useAssessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({});
  const [result, setResult] = useState<any>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;

  // Filter visible questions based on conditional logic
  const visibleQuestions = QUESTIONS.filter((q) => {
    if (!q.conditional) return true;
    const conditionField = q.conditional.field as keyof AssessmentAnswers;
    return answers[conditionField] === q.conditional.value;
  });

  const visibleQuestionIndex = visibleQuestions.findIndex((q) => q.id === currentQuestion?.id);
  const progressPercentage = Math.round(((visibleQuestionIndex + 1) / visibleQuestions.length) * 100);

  const handleAnswer = useCallback(
    (questionId: string, value: string | number) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    },
    []
  );

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(() => {
    // Fill in default values for conditional questions that weren't asked
    const completeAnswers: AssessmentAnswers = {
      customerName: (answers.customerName as string) || "Not provided",
      customerEmail: (answers.customerEmail as string) || "Not provided",
      numInstances: (answers.numInstances as string) || "0",
      currentlyRunning: (answers.currentlyRunning as "yes" | "no") || "no",
      currentVersion: (answers.currentVersion as string) || "2019",
      currentEdition: (answers.currentEdition as string) || "standard",
      currentDeployment: (answers.currentDeployment as string) || "on-premises",
      currentDeploymentType: (answers.currentDeploymentType as "paas" | "iaas") || "iaas",
      licensePurchaseDate: (answers.licensePurchaseDate as "before-oct-2019" | "after-oct-2019") || "after-oct-2019",
      currentLicensingModel: (answers.currentLicensingModel as "per-core" | "server-cal") || "per-core",
      softwareAssurance: (answers.softwareAssurance as "yes" | "no") || "no",
      targetVersion: (answers.targetVersion as string) || "2022",
      targetEdition: (answers.targetEdition as string) || "standard",
      hadrRequirements: (answers.hadrRequirements as string) || "no-hadr",
      migrationApproach: (answers.migrationApproach as string) || "lift-shift",
    };

    const recommendation = generateRecommendation(completeAnswers);
    setResult(recommendation);
  }, [answers]);

  const handleReset = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  }, []);

  const canProceedToNext = () => {
    if (!currentQuestion) return false;
    const questionId = currentQuestion.id;
    return answers[questionId as keyof AssessmentAnswers] !== undefined;
  };

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    visibleQuestions,
    visibleQuestionIndex,
    progressPercentage,
    answers,
    result,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleSubmit,
    handleReset,
    canProceedToNext,
    isLastQuestion: currentQuestionIndex === totalQuestions - 1,
  };
}
