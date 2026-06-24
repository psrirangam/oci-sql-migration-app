import { useAssessmentContext } from "@/contexts/AssessmentContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, AlertCircle, Check, Circle } from "lucide-react";
import { useState } from "react";
import { isValidOracleEmail } from "@/lib/csvExport";
import { AssessmentAnswers } from "@/lib/assessmentLogic";

export default function QuestionnaireView() {
  const [emailError, setEmailError] = useState<string>("");
  
  const {
    currentQuestion,
    currentQuestionIndex,
    visibleQuestions,
    visibleQuestionIndex,
    progressPercentage,
    answers,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleSubmit,
    canProceedToNext,
    isLastQuestion,
  } = useAssessmentContext();

  if (!currentQuestion) {
    return null;
  }

  const questionId = currentQuestion.id;
  const currentAnswer = answers[questionId as keyof typeof answers];
  const isNumberInput = currentQuestion.type === "number";
  const isTextInput = currentQuestion.type === "text";
  const isEmailInput = currentQuestion.type === "email";
  const questionOptions = currentQuestion.getOptions ? currentQuestion.getOptions(answers as AssessmentAnswers) : currentQuestion.options || [];
  const sectionNames = Array.from(new Set(visibleQuestions.map((question) => question.category)));
  const activeSectionIndex = sectionNames.findIndex((section) => section === currentQuestion.category);
  const helperText =
    currentQuestion.helper ||
    (isNumberInput
      ? "Enter a numeric value for this field."
      : isEmailInput
        ? "Use an Oracle email address for internal ownership and follow-up."
        : isTextInput
          ? "Please provide your response."
          : "");

  const handleInputChange = (value: string) => {
    if (isNumberInput) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        handleAnswer(questionId, numValue);
      }
    } else if (isEmailInput) {
      // Validate Oracle email
      if (value && !isValidOracleEmail(value)) {
        setEmailError("Please use your Oracle.com email address");
      } else {
        setEmailError("");
      }
      handleAnswer(questionId, value);
    } else {
      handleAnswer(questionId, value);
    }
  };

  const handleNextClick = () => {
    // Validate email before proceeding
    if (isEmailInput && currentAnswer) {
      if (!isValidOracleEmail(String(currentAnswer))) {
        setEmailError("Please use your Oracle.com email address to proceed");
        return;
      }
    }
    
    if (isLastQuestion && canProceedToNext()) {
      handleSubmit();
    } else {
      handleNext();
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="apex-side-region hidden lg:block">
        <div className="border-b border-border bg-[#faf9f7] px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Assessment Sections</h3>
          <p className="mt-1 text-xs text-muted-foreground">{visibleQuestions.length} questions</p>
        </div>
        <div className="py-2">
          {sectionNames.map((section, index) => {
            const isActive = index === activeSectionIndex;
            const isComplete = index < activeSectionIndex;
            return (
              <div
                key={section}
                className={`apex-step-row ${isActive ? "apex-step-row-active" : ""}`}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-white">
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Circle className={`h-3 w-3 ${isActive ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${isActive ? "text-foreground" : ""}`}>{section}</p>
                  <p className="text-xs text-muted-foreground">
                    {visibleQuestions.filter((question) => question.category === section).length} item(s)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="apex-region">
          <div className="apex-region-header">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Question {visibleQuestionIndex + 1} of {visibleQuestions.length}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-foreground">{currentQuestion.category}</h3>
            </div>
            <div className="min-w-28 text-right">
              <p className="text-lg font-semibold text-primary">{progressPercentage}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-1 rounded-none" />
          <div className="apex-region-body">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-foreground md:text-[26px]">
                {currentQuestion.question}
              </h2>
              {helperText && <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>}
            </div>

            {currentQuestion.type === "radio" ? (
              <RadioGroup value={String(currentAnswer || "")} onValueChange={handleInputChange}>
                <div className="divide-y divide-border border border-border">
                  {questionOptions.map((option) => {
                    const isSelected = String(currentAnswer) === option.value;
                    return (
                      <div
                        key={option.value}
                        className={`apex-choice cursor-pointer ${isSelected ? "apex-choice-selected" : ""}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <RadioGroupItem
                            value={option.value}
                            id={`option-${option.value}`}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex-1">
                          <Label
                            htmlFor={`option-${option.value}`}
                            className="cursor-pointer font-normal"
                          >
                            <span className="block text-sm font-medium text-foreground">
                              {option.label}
                            </span>
                          </Label>
                        </div>
                        {isSelected && (
                          <div className="shrink-0">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                              <Check className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            ) : (isTextInput || isEmailInput || isNumberInput) ? (
              <div className="max-w-xl space-y-3">
                <Input
                  type={isEmailInput ? "email" : isNumberInput ? "number" : "text"}
                  placeholder={isEmailInput ? "your.name@oracle.com" : isNumberInput ? "Enter a number" : "Enter your response"}
                  value={String(currentAnswer || "")}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="h-10 rounded-sm border-border bg-white text-sm focus:border-primary"
                />
                {isEmailInput && emailError && (
                  <div className="flex items-start gap-2 border border-destructive/30 bg-red-50 p-3 text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-sm">{emailError}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="apex-region-footer">
            <Button
              onClick={() => handlePrevious()}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              size="sm"
              className="gap-2 rounded-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={() => handleNextClick()}
              disabled={!canProceedToNext() || (isEmailInput && emailError !== "")}
              size="sm"
              className="gap-2 rounded-sm bg-primary font-semibold text-white hover:bg-[#a53a2a]"
            >
              {isLastQuestion && canProceedToNext() ? (
                <>
                  <span>Generate Recommendation</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="apex-callout">
          <p>
            <strong>Planning note:</strong> Use the best information available now. The report guides OCI migration discovery and highlights licensing items to validate before final architecture or pricing.
          </p>
        </div>
      </section>
    </div>
  );
}
