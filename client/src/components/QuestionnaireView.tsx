import { useAssessmentContext } from "@/contexts/AssessmentContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { isValidOracleEmail } from "@/lib/csvExport";

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
    <div className="max-w-2xl mx-auto">
      {/* Progress Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Question {visibleQuestionIndex + 1} of {visibleQuestions.length}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {currentQuestion.category}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{progressPercentage}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="question-card mb-8 animate-in fade-in duration-300 border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
          {currentQuestion.type === "number" && (
            <CardDescription>
              Enter a numeric value for this field
            </CardDescription>
          )}
          {currentQuestion.type === "email" && (
            <CardDescription>
              We will use this Oracle.com email to reach back with your assessment results
            </CardDescription>
          )}
          {currentQuestion.type === "text" && (
            <CardDescription>
              Please provide your response
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {currentQuestion.type === "radio" && currentQuestion.options ? (
            <RadioGroup value={String(currentAnswer || "")} onValueChange={handleInputChange}>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = String(currentAnswer) === option.value;
                  return (
                    <div
                      key={option.value}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border bg-card hover:border-primary/50 hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <RadioGroupItem
                          value={option.value}
                          id={`option-${option.value}`}
                          className="w-5 h-5"
                        />
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor={`option-${option.value}`}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          <span className="block font-semibold text-foreground text-base">
                            {option.label}
                          </span>
                        </Label>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          ) : (isTextInput || isEmailInput || isNumberInput) ? (
            <div className="space-y-3">
              <Input
                type={isEmailInput ? "email" : isNumberInput ? "number" : "text"}
                placeholder={isEmailInput ? "your.name@oracle.com" : isNumberInput ? "Enter a number" : "Enter your response"}
                value={String(currentAnswer || "")}
                onChange={(e) => handleInputChange(e.target.value)}
                className="text-base py-3 border-2 focus:border-primary"
              />
              {isEmailInput && emailError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          onClick={() => handlePrevious()}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          size="lg"
          className="gap-2 border-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={() => handleNextClick()}
          disabled={!canProceedToNext() || (isEmailInput && emailError !== "")}
          size="lg"
          className="gap-2 bg-primary hover:bg-red-700 text-white font-bold shadow-lg"
        >
          {isLastQuestion && canProceedToNext() ? (
            <>
              <span>Generate Recommendation</span>
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Tip Section */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Tip:</strong> Your answers are based on the SQL Server 2022 Licensing Guide. Select the option that best matches your current or planned deployment scenario. Selected options are highlighted in red.
        </p>
      </div>
    </div>
  );
}
