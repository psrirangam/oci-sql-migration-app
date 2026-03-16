import { useAssessmentContext } from "@/contexts/AssessmentContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function QuestionnaireView() {
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

  const handleInputChange = (value: string) => {
    if (isNumberInput) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        handleAnswer(questionId, numValue);
      }
    } else {
      handleAnswer(questionId, value);
    }
  };

  const handleNextClick = () => {
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
      <Card className="question-card mb-8 animate-in fade-in duration-300">
        <CardHeader>
          <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
          {currentQuestion.type === "number" && (
            <CardDescription>
              Enter a numeric value for this field
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {currentQuestion.type === "radio" && currentQuestion.options ? (
            <RadioGroup value={String(currentAnswer || "")} onValueChange={handleInputChange}>
              <div className="space-y-4">
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                    <RadioGroupItem
                      value={option.value}
                      id={`option-${option.value}`}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`option-${option.value}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <span className="block font-medium text-foreground">
                        {option.label}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : currentQuestion.type === "number" ? (
            <div className="space-y-3">
              <Input
                type="number"
                placeholder={currentQuestion.placeholder}
                value={currentAnswer || ""}
                onChange={(e) => handleInputChange(e.target.value)}
                className="text-lg py-3"
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                {currentQuestion.placeholder}
              </p>
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
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={() => handleNextClick()}
          disabled={!canProceedToNext()}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          {isLastQuestion && canProceedToNext() ? (
            <>
              Get Recommendations
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-secondary/30 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Your answers are based on the SQL Server 2022 Licensing Guide. 
          Select options that best match your current or planned deployment scenario.
        </p>
      </div>
    </div>
  );
}
