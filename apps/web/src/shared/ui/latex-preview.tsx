"use client";

import katex from "katex";
import { useMemo } from "react";

import { cn } from "@/shared/lib/utils";

type LatexPreviewProps = {
  value: string;
  className?: string;
  emptyMessage?: string;
};

function normalizePreviewValue(value: string) {
  return value.trim();
}

export function LatexPreview({
  value,
  className,
  emptyMessage = "Type LaTeX to preview the rendered equation.",
}: LatexPreviewProps) {
  const normalizedValue = useMemo(() => normalizePreviewValue(value), [value]);

  const renderResult = useMemo(() => {
    if (!normalizedValue) {
      return {
        html: "",
        error: null,
      };
    }

    try {
      return {
        html: katex.renderToString(normalizedValue, {
          displayMode: true,
          throwOnError: true,
          strict: false,
        }),
        error: null,
      };
    } catch (error) {
      return {
        html: "",
        error:
          error instanceof Error
            ? error.message
            : "Preview error. Check LaTeX syntax.",
      };
    }
  }, [normalizedValue]);

  if (!normalizedValue) {
    return (
      <div
        className={cn(
          "flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center",
          className,
        )}
      >
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  if (renderResult.error) {
    return (
      <div
        className={cn(
          "min-h-32 rounded-2xl border border-red-200 bg-red-50 px-4 py-5",
          className,
        )}
      >
        <p className="text-sm font-medium text-red-700">
          Preview error. Check LaTeX syntax.
        </p>
        <p className="mt-2 text-xs text-red-600">{renderResult.error}</p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-white px-3 py-2 text-sm text-red-800">
          {value}
        </pre>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-32 overflow-x-auto rounded-2xl border border-neutral-200 bg-white px-4 py-8",
        className,
      )}
    >
      <div
        className="min-w-max text-neutral-950"
        dangerouslySetInnerHTML={{ __html: renderResult.html }}
      />
    </div>
  );
}