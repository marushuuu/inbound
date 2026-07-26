"use client";

import {
  LANGUAGES,
  JAPANESE_LEVELS,
  GENERAL_LEVELS,
  type LanguageSkill,
} from "@/lib/languages";

const MAX_LANGUAGES = 5;

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400";

export default function LanguagePicker({
  value,
  onChange,
}: {
  value: LanguageSkill[];
  onChange: (skills: LanguageSkill[]) => void;
}) {
  const update = (index: number, patch: Partial<LanguageSkill>) => {
    const next = value.map((skill, i) => {
      if (i !== index) return skill;
      const updated = { ...skill, ...patch };
      // Level scales differ per language, so switching language resets level.
      if (patch.language !== undefined && patch.language !== skill.language) {
        updated.level = "";
      }
      return updated;
    });
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const add = () => {
    if (value.length < MAX_LANGUAGES) {
      onChange([...value, { language: "", level: "" }]);
    }
  };

  const usedLanguages = value.map((s) => s.language);

  return (
    <div className="space-y-3">
      {value.map((skill, index) => {
        const levels =
          skill.language === "ja" ? JAPANESE_LEVELS : GENERAL_LEVELS;
        return (
          <div key={index} className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-2 gap-2">
              <select
                aria-label="Language"
                className={selectClass}
                value={skill.language}
                onChange={(e) => update(index, { language: e.target.value })}
              >
                <option value="" disabled>
                  Select language
                </option>
                {LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    disabled={
                      lang.code !== skill.language &&
                      usedLanguages.includes(lang.code)
                    }
                  >
                    {lang.label}
                    {lang.native !== lang.label ? ` / ${lang.native}` : ""}
                  </option>
                ))}
              </select>

              <select
                aria-label="Proficiency level"
                className={selectClass}
                value={skill.level}
                disabled={!skill.language}
                onChange={(e) => update(index, { level: e.target.value })}
              >
                <option value="" disabled>
                  {skill.language ? "Select level" : "Level"}
                </option>
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              aria-label="Remove language"
              onClick={() => remove(index)}
              disabled={value.length <= 1}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:invisible"
            >
              ✕
            </button>
          </div>
        );
      })}

      {value.length < MAX_LANGUAGES && (
        <button
          type="button"
          onClick={add}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          + Add another language
        </button>
      )}
    </div>
  );
}
