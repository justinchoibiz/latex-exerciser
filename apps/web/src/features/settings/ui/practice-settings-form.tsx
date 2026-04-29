"use client";

import { toast } from "sonner";
import { getErrorMessage } from "@/shared/api/error";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/entities/auth";
import type { UserSettings } from "@/entities/settings";
import { getSettings, patchSettings } from "@/features/settings/api/settings-api";

const levelOptions = Array.from({ length: 10 }, (_, index) => index + 1);

type SaveState = "idle" | "saving" | "saved" | "error";

const defaultFormValue: UserSettings = {
  defaultLevelMin: 1,
  defaultLevelMax: 3,
  defaultTimeLimit: 60,
  strictMode: false,
  autoAdvanceAfterAnswer: false,
};

export function PracticeSettingsForm() {
  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);

  const [formValue, setFormValue] = useState<UserSettings>(defaultFormValue);
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedLevelCount = useMemo(() => {
    return formValue.defaultLevelMax - formValue.defaultLevelMin + 1;
  }, [formValue.defaultLevelMax, formValue.defaultLevelMin]);

  const generatedQuizCount = useMemo(() => {
    if (selectedLevelCount < 1) {
      return 0;
    }

    return selectedLevelCount * 10;
  }, [selectedLevelCount]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function loadSettings() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const settings = await getSettings(token);
        setFormValue(settings);
      } catch (error) {
        const message = getErrorMessage(error, "Failed to load settings.");
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadSettings();
  }, [token]);

  function updateField<TField extends keyof UserSettings>(
    field: TField,
    value: UserSettings[TField],
  ) {
    setSaveState("idle");
    setErrorMessage(null);

    setFormValue((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      const message = "Login is required to save settings.";
      setSaveState("error");
      setErrorMessage(message);
      toast.error(message);
      
      return;
    }

    if (formValue.defaultLevelMin > formValue.defaultLevelMax) {
      const message =
      "Default minimum level must be less than or equal to maximum level.";
      setSaveState("error");
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    setSaveState("saving");
    setErrorMessage(null);

    try {
      const nextSettings = await patchSettings(token, formValue);

      setFormValue(nextSettings);
      setSaveState("saved");
      toast.success("Settings saved.");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to save settings.");

      setSaveState("error");
      setErrorMessage(message);
      toast.error(message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-neutral-500">Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Practice Settings
        </h1>
        <p className="text-sm text-neutral-600">
          Configure default quiz difficulty, timer, grading strictness, and
          answer flow.
        </p>
      </div>

      {!token ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Login is required to load and save your settings.
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
          Loading settings...
        </div>
      ) : (
        <div className="mt-8 grid gap-6">
          <div className="grid gap-4 rounded-2xl border border-neutral-200 p-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-neutral-800">
                Default level min
              </span>
              <select
                value={formValue.defaultLevelMin}
                onChange={(event) =>
                  updateField("defaultLevelMin", Number(event.target.value))
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-800">
                Default level max
              </span>
              <select
                value={formValue.defaultLevelMax}
                onChange={(event) =>
                  updateField("defaultLevelMax", Number(event.target.value))
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2">
              <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                Generated quiz count:{" "}
                <span className="font-semibold text-neutral-950">
                  {generatedQuizCount}
                </span>
              </div>
            </div>
          </div>

          <label className="block rounded-2xl border border-neutral-200 p-5">
            <span className="text-sm font-medium text-neutral-800">
              Default time limit
            </span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={5}
                max={300}
                value={formValue.defaultTimeLimit}
                onChange={(event) =>
                  updateField("defaultTimeLimit", Number(event.target.value))
                }
                className="w-36 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
              />
              <span className="text-sm text-neutral-600">seconds</span>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Allowed range: 5 to 300 seconds.
            </p>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-5">
              <input
                type="checkbox"
                checked={formValue.strictMode}
                onChange={(event) =>
                  updateField("strictMode", event.target.checked)
                }
                className="mt-1 size-4 rounded border-neutral-300"
              />
              <span>
                <span className="block text-sm font-medium text-neutral-800">
                  Strict mode
                </span>
                <span className="mt-1 block text-sm text-neutral-600">
                  Require exact LaTeX string match instead of normalized match.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-5">
              <input
                type="checkbox"
                checked={formValue.autoAdvanceAfterAnswer}
                onChange={(event) =>
                  updateField("autoAdvanceAfterAnswer", event.target.checked)
                }
                className="mt-1 size-4 rounded border-neutral-300"
              />
              <span>
                <span className="block text-sm font-medium text-neutral-800">
                  Auto advance after answer
                </span>
                <span className="mt-1 block text-sm text-neutral-600">
                  Move to the next question automatically after submission.
                </span>
              </span>
            </label>
          </div>
        </div>
      )}

      {errorMessage ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {saveState === "saved" ? (
        <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Settings saved.
        </p>
      ) : null}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isLoading || saveState === "saving" || !token}
          className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition-[background-color,opacity] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveState === "saving" ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}