import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { quizQuestions, computeArchetype } from "@/data/quiz";
import { saveProfile } from "@/lib/storage";
import { ArrowLeft, X } from "lucide-react";

const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const question = quizQuestions[step];
  const progress = (step / quizQuestions.length) * 100;

  const choose = (optionIndex: number) => {
    const next = [...answers.slice(0, step), optionIndex];
    setAnswers(next);
    if (step + 1 < quizQuestions.length) {
      setStep(step + 1);
    } else {
      const archetypeId = computeArchetype(next);
      saveProfile(archetypeId);
      navigate("/journey?welcome=1");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-lg px-5 py-6">
        <div className="mb-8 flex items-center gap-4">
          {step > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link to="/">
                <X className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground">
            {step + 1}/{quizQuestions.length}
          </span>
        </div>

        <div key={step} className="animate-fade-up">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            Self-discovery
          </p>
          <h1 className="text-2xl font-semibold leading-snug sm:text-3xl">
            {question.question}
          </h1>
          {question.hint && (
            <p className="mt-2 text-sm text-muted-foreground">{question.hint}</p>
          )}

          <div className="mt-7 space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                className="paper-card flex w-full items-center gap-4 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xl">
                  {option.emoji}
                </span>
                <span className="text-sm font-medium leading-snug">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          A reflective framework inspired by traditional Chinese concepts — not
          a medical assessment.
        </p>
      </div>
    </div>
  );
};

export default Quiz;
