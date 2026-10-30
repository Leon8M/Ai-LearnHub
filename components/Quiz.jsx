'use client';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

/** Multiple-choice check-your-understanding quiz for one chapter. */
export default function Quiz({ questions = [] }) {
  const [answers, setAnswers] = useState({});
  if (!questions.length) return null;

  const answeredCount = Object.keys(answers).length;
  const score = questions.filter((q, i) => answers[i] === q.answerIndex).length;
  const finished = answeredCount === questions.length;

  return (
    <section className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 print:break-inside-avoid" aria-label="Chapter quiz">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold font-heading text-[var(--foreground)]">Check your understanding</h3>
        {finished && (
          <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-sm font-semibold text-[var(--primary)]">
            {score}/{questions.length} correct
          </span>
        )}
      </div>

      <ol className="space-y-6">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          const answered = chosen !== undefined;
          return (
            <li key={qi}>
              <p className="mb-2 font-medium text-[var(--foreground)]">
                {qi + 1}. {q.question}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((option, oi) => {
                  const isCorrect = oi === q.answerIndex;
                  const state = !answered ? 'idle' : isCorrect ? 'correct' : oi === chosen ? 'wrong' : 'idle';
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={answered}
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        state === 'correct'
                          ? 'border-green-600 bg-green-600/10'
                          : state === 'wrong'
                            ? 'border-[var(--destructive)] bg-[var(--destructive)]/10'
                            : 'border-[var(--border)] hover:bg-[var(--muted)] disabled:hover:bg-transparent'
                      }`}
                    >
                      {state === 'correct' && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />}
                      {state === 'wrong' && <XCircle className="h-4 w-4 shrink-0 text-[var(--destructive)]" />}
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
              {answered && q.explanation && <p className="mt-2 text-sm text-[var(--muted-foreground)]">{q.explanation}</p>}
            </li>
          );
        })}
      </ol>

      {answeredCount > 0 && (
        <Button variant="outline" className="mt-5 print:hidden" onClick={() => setAnswers({})}>
          <RotateCcw className="mr-2 h-4 w-4" /> Try again
        </Button>
      )}
    </section>
  );
}
