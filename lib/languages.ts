export type LanguageOption = {
  code: string;
  label: string; // English label
  native: string; // native-script label
};

// Languages most relevant to inbound-industry hiring in Japan.
export const LANGUAGES: LanguageOption[] = [
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "en", label: "English", native: "English" },
  { code: "zh", label: "Chinese (Mandarin)", native: "中文(普通话)" },
  { code: "zh-yue", label: "Chinese (Cantonese)", native: "中文(廣東話)" },
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "th", label: "Thai", native: "ไทย" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia" },
  { code: "tl", label: "Filipino (Tagalog)", native: "Filipino" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "my", label: "Burmese", native: "မြန်မာဘာသာ" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "other", label: "Other", native: "その他" },
];

// Japanese ability is assessed on the JLPT scale, which is what
// employers in Japan actually screen on.
export const JAPANESE_LEVELS = [
  { value: "native", label: "Native / ネイティブ" },
  { value: "n1", label: "JLPT N1 (fluent)" },
  { value: "n2", label: "JLPT N2 (business)" },
  { value: "n3", label: "JLPT N3 (conversational)" },
  { value: "n4", label: "JLPT N4 (basic)" },
  { value: "n5", label: "JLPT N5 (beginner)" },
  { value: "none", label: "Not yet / これから" },
] as const;

// All other languages use a simple proficiency scale.
export const GENERAL_LEVELS = [
  { value: "native", label: "Native" },
  { value: "fluent", label: "Fluent" },
  { value: "business", label: "Business" },
  { value: "conversational", label: "Conversational" },
  { value: "basic", label: "Basic" },
] as const;

export type LanguageSkill = {
  language: string; // LanguageOption.code, "" = unselected
  level: string; // level value, "" = unselected
};
