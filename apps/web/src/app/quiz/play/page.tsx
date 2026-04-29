"use client";

import { useState } from "react";

import { LatexPreview } from "@/shared/ui";
import { AppShell } from "@/widgets/app-shell";

export default function QuizPlayPage() {
  const [latexInput, setLatexInput] = useState("\\frac{a}{b}");

  return (
    <AppShell>
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Quiz</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Quiz Play
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            This temporary Step 14 screen verifies the LaTeX live preview
            component. The full quiz player will be implemented in Step 15.
          </p>

          <label className="mt-8 block">
            <span className="text-sm font-medium text-neutral-800">
              LaTeX input
            </span>
            <textarea
              value={latexInput}
              onChange={(event) => setLatexInput(event.target.value)}
              rows={8}
              className="mt-2 w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-950 outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
              placeholder="x^2"
            />
          </label>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm font-medium text-neutral-800">
              Test examples
            </p>
            <div className="mt-3 grid gap-2 text-sm text-neutral-600">
              <button
                type="button"
                onClick={() => setLatexInput("x^2")}
                className="text-left underline underline-offset-4 transition-[color] hover:text-neutral-950"
              >
                x^2
              </button>
              <button
                type="button"
                onClick={() => setLatexInput("\\frac{a}{b}")}
                className="text-left underline underline-offset-4 transition-[color] hover:text-neutral-950"
              >
                \frac{"{a}"}{"{b}"}
              </button>
              <button
                type="button"
                onClick={() => setLatexInput("\\sum_{i=1}^{n} i")}
                className="text-left underline underline-offset-4 transition-[color] hover:text-neutral-950"
              >
                \sum_{"{i=1}"}^{"{n}"} i
              </button>
              <button
                type="button"
                onClick={() => setLatexInput("\\invalid{")}
                className="text-left underline underline-offset-4 transition-[color] hover:text-neutral-950"
              >
                invalid syntax
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Live Preview</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Rendered Output
          </h2>
          <p className="mt-3 text-sm text-neutral-600">
            Preview updates as the input changes.
          </p>

          <div className="mt-8">
            <LatexPreview value={latexInput} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}