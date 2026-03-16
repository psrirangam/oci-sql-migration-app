import { useState, useCallback } from "react";
import { AssessmentAnswers, AssessmentResult, generateRecommendation, QUESTIONS } from "@/lib/assessmentLogic";

export function useAssessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // Filter visible questions based on conditional logic
  const visibleQuestions = QUESTIONS.filter((q) => {
    if (!q.conditional) return true;
    const conditionField = q.conditional.field as keyof AssessmentAnswers;
    return answers[conditionField] === q.conditional.value;
  });

  const visibleQuestionIndex = visibleQuestions.findIndex((q) => q.id === currentQuestion?.id);
  const visibleProgressPercentage = Math.round(((visibleQuestionIndex + 1) / visibleQuestions.length) * 100);

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
      edition: (answers.edition as string) || "standard",
      licensingModel: (answers.licensingModel as string) || "per-core",
      virtualization: (answers.virtualization as string) || "no",
      virtualCoresPerVM: (answers.virtualCoresPerVM as number) || 8,
      vmsPerHost: (answers.vmsPerHost as number) || 1,
      softwareAssurance: (answers.softwareAssurance as string) || "no",
      licenseMobility: (answers.licenseMobility as string) || "no",
      haDrBenefit: (answers.haDrBenefit as string) || "no",
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
    const questionId = currentQuestion.id as keyof AssessmentAnswers;
    return answers[questionId] !== undefined;
  };

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    visibleQuestions,
    visibleQuestionIndex,
    progressPercentage: visibleProgressPercentage,
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
