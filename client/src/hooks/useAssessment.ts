import { useState, useCallback, useMemo, useEffect } from "react";
import { AssessmentAnswers, generateRecommendation, QUESTIONS } from "@/lib/assessmentLogic";

export function useAssessment() {
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({});
  const [result, setResult] = useState<any>(null);

  const visibleQuestions = useMemo(
    () => QUESTIONS.filter((q) => !q.conditional || q.conditional(answers)),
    [answers]
  );
  const currentQuestion = visibleQuestions[currentVisibleIndex];
  const totalQuestions = visibleQuestions.length;
  const visibleQuestionIndex = currentVisibleIndex;
  const progressPercentage = Math.round(((visibleQuestionIndex + 1) / visibleQuestions.length) * 100);

  useEffect(() => {
    if (currentVisibleIndex >= visibleQuestions.length) {
      setCurrentVisibleIndex(Math.max(visibleQuestions.length - 1, 0));
    }
  }, [currentVisibleIndex, visibleQuestions.length]);

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
    if (currentVisibleIndex < totalQuestions - 1) {
      setCurrentVisibleIndex((prev) => prev + 1);
    }
  }, [currentVisibleIndex, totalQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentVisibleIndex > 0) {
      setCurrentVisibleIndex((prev) => prev - 1);
    }
  }, [currentVisibleIndex]);

  const handleSubmit = useCallback(() => {
    // Fill in default values for conditional questions that weren't asked
    const completeAnswers: AssessmentAnswers = {
      customerName: (answers.customerName as string) || "Not provided",
      customerEmail: (answers.customerEmail as string) || "Not provided",
      sourcePlatform: (answers.sourcePlatform as AssessmentAnswers["sourcePlatform"]) || "on-premises",
      workloadType: (answers.workloadType as AssessmentAnswers["workloadType"]) || "windows-sql",
      numInstances: String(answers.numInstances ?? "0"),
      totalVcpu: answers.totalVcpu === undefined ? "" : String(answers.totalVcpu),
      totalStorageTb: answers.totalStorageTb === undefined ? "" : String(answers.totalStorageTb),
      currentlyRunning: (answers.currentlyRunning as "yes" | "no") || "no",
      currentVersion: (answers.currentVersion as string) || "unknown",
      currentEdition: (answers.currentEdition as string) || "standard",
      currentDeploymentType: (answers.currentDeploymentType as AssessmentAnswers["currentDeploymentType"]) || "iaas",
      licensePurchaseDate: (answers.licensePurchaseDate as AssessmentAnswers["licensePurchaseDate"]) || "unknown",
      currentLicensingModel: (answers.currentLicensingModel as AssessmentAnswers["currentLicensingModel"]) || "unknown",
      softwareAssurance: (answers.softwareAssurance as AssessmentAnswers["softwareAssurance"]) || "unknown",
      windowsLicensing: (answers.windowsLicensing as AssessmentAnswers["windowsLicensing"]) || "oci-included",
      targetVersion: (answers.targetVersion as string) || "sql-2022",
      targetEdition: (answers.targetEdition as string) || "standard",
      hadrRequirements: (answers.hadrRequirements as AssessmentAnswers["hadrRequirements"]) || "none",
      migrationApproach: (answers.migrationApproach as AssessmentAnswers["migrationApproach"]) || "lift-shift",
    };

    const recommendation = generateRecommendation(completeAnswers);
    setResult(recommendation);
  }, [answers]);

  const handleReset = useCallback(() => {
    setCurrentVisibleIndex(0);
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
    currentQuestionIndex: currentVisibleIndex,
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
    isLastQuestion: currentVisibleIndex === totalQuestions - 1,
  };
}
