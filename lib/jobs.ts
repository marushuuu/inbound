export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  prefecture: string;
  category: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Seasonal";
  salary: string;
  japaneseLevel: "None" | "N5" | "N4" | "N3" | "N2" | "N1";
  visaSupport: boolean;
  tags: string[];
  summary: string;
  description: string[];
  requirements: string[];
};

export const CATEGORIES = [
  "Hotel & Ryokan",
  "Restaurant & Café",
  "Tour & Activity",
  "Resort & Leisure",
  "Retail & Duty Free",
  "Office & Marketing",
] as const;

export const JOBS: Job[] = [
  {
    id: "hotel-front-desk-kyoto",
    title: "Front Desk Staff (English-speaking)",
    company: "Sakura Grand Hotel Kyoto",
    location: "Kyoto City, Kyoto",
    prefecture: "Kyoto",
    category: "Hotel & Ryokan",
    employmentType: "Full-time",
    salary: "¥250,000 – ¥320,000 / month",
    japaneseLevel: "N3",
    visaSupport: true,
    tags: ["Visa support", "English OK", "Training provided"],
    summary:
      "Welcome international guests at a 4-star hotel near Kyoto Station. English is your main working language.",
    description: [
      "Sakura Grand Hotel Kyoto welcomes guests from over 60 countries every year. As front desk staff, you will be the face of the hotel for our international guests.",
      "You will handle check-in/check-out, concierge requests, and guest communication in English and Japanese. Team members from 8 countries currently work here.",
    ],
    requirements: [
      "Conversational Japanese (JLPT N3 or equivalent)",
      "Business-level English",
      "Hospitality experience welcome but not required",
      "Currently in Japan or willing to relocate (visa sponsorship available)",
    ],
  },
  {
    id: "ryokan-service-hakone",
    title: "Ryokan Guest Service (仲居)",
    company: "Yumoto Onsen Ryokan Kikuya",
    location: "Hakone, Kanagawa",
    prefecture: "Kanagawa",
    category: "Hotel & Ryokan",
    employmentType: "Full-time",
    salary: "¥230,000 – ¥280,000 / month + dormitory",
    japaneseLevel: "N2",
    visaSupport: true,
    tags: ["Dormitory", "Visa support", "Onsen town"],
    summary:
      "Experience traditional omotenashi at a 90-year-old onsen ryokan. Staff dormitory and meals included.",
    description: [
      "Kikuya is a historic ryokan in Hakone's Yumoto onsen district. Half of our guests now come from overseas, and we are building an international service team.",
      "You will serve kaiseki dinners, guide guests through ryokan etiquette, and create memorable stays. Full training in traditional service is provided.",
    ],
    requirements: [
      "Business Japanese (JLPT N2 or equivalent)",
      "Any second language (English, Chinese, Korean welcome)",
      "Interest in Japanese traditional culture",
    ],
  },
  {
    id: "tour-guide-tokyo",
    title: "Walking Tour Guide (Multilingual)",
    company: "Edo Discovery Tours",
    location: "Asakusa, Tokyo",
    prefecture: "Tokyo",
    category: "Tour & Activity",
    employmentType: "Part-time",
    salary: "¥1,800 – ¥2,500 / hour + tips",
    japaneseLevel: "N4",
    visaSupport: false,
    tags: ["English OK", "Flexible schedule", "No suit required"],
    summary:
      "Lead food and history walking tours in Asakusa and Ueno for small international groups.",
    description: [
      "Edo Discovery Tours runs top-rated small-group tours in Tokyo's historic shitamachi districts.",
      "Guides lead 2–3 hour walking tours for groups of up to 10 guests. Routes, scripts and training are provided — your storytelling makes them come alive.",
    ],
    requirements: [
      "Fluent English (other languages a plus)",
      "Basic Japanese for daily communication",
      "Valid work permission in Japan (student visa with permission OK)",
      "Outgoing personality and love of Tokyo",
    ],
  },
  {
    id: "ski-resort-niseko",
    title: "Ski Resort Staff (Winter Season)",
    company: "Niseko Powder Resort",
    location: "Niseko, Hokkaido",
    prefecture: "Hokkaido",
    category: "Resort & Leisure",
    employmentType: "Seasonal",
    salary: "¥1,400 – ¥1,700 / hour + season pass",
    japaneseLevel: "None",
    visaSupport: false,
    tags: ["No Japanese OK", "Free ski pass", "Staff housing"],
    summary:
      "Work the winter season in Japan's most international ski resort. Japanese not required.",
    description: [
      "Join 200+ international staff for the December–March season at Niseko Powder Resort. Positions in lift operations, rental shop, and guest services.",
      "Staff housing available, free season pass included, and your coworkers come from 20+ countries. English is the working language.",
    ],
    requirements: [
      "Working holiday or other valid work visa",
      "Conversational English",
      "Available for the full season (Dec 1 – Mar 31)",
    ],
  },
  {
    id: "izakaya-manager-osaka",
    title: "Restaurant Floor Manager",
    company: "Namba Yokocho Group",
    location: "Namba, Osaka",
    prefecture: "Osaka",
    category: "Restaurant & Café",
    employmentType: "Full-time",
    salary: "¥280,000 – ¥350,000 / month",
    japaneseLevel: "N2",
    visaSupport: true,
    tags: ["Visa support", "Career growth", "Inbound focus"],
    summary:
      "Manage a lively izakaya floor serving international tourists in Osaka's most famous food district.",
    description: [
      "Namba Yokocho Group operates 12 restaurants in central Osaka. Over 70% of our guests are international visitors, and we want managers who can bridge cultures.",
      "You will lead a team of 15 staff, improve the guest experience for overseas visitors, and help develop multilingual menus and service standards.",
    ],
    requirements: [
      "Business Japanese (JLPT N2+)",
      "Fluent English or Chinese",
      "2+ years restaurant or hospitality experience",
    ],
  },
  {
    id: "duty-free-shinjuku",
    title: "Duty Free Sales Associate (Chinese/Korean speaker)",
    company: "Tokyo Duty Free Shinjuku",
    location: "Shinjuku, Tokyo",
    prefecture: "Tokyo",
    category: "Retail & Duty Free",
    employmentType: "Full-time",
    salary: "¥240,000 – ¥300,000 / month + incentives",
    japaneseLevel: "N3",
    visaSupport: true,
    tags: ["Visa support", "Incentive pay", "Station area"],
    summary:
      "Serve international shoppers at a flagship duty-free store. Chinese or Korean speakers especially welcome.",
    description: [
      "Tokyo Duty Free Shinjuku serves thousands of international customers daily in cosmetics, electronics, and fashion.",
      "Sales associates assist customers in their native language, handle tax-free procedures, and earn monthly sales incentives.",
    ],
    requirements: [
      "Native-level Chinese or Korean",
      "Conversational Japanese (N3 or equivalent)",
      "Customer service mindset",
    ],
  },
  {
    id: "inbound-marketing-tokyo",
    title: "Inbound Marketing Coordinator",
    company: "Japan Travel Media Inc.",
    location: "Shibuya, Tokyo (Hybrid)",
    prefecture: "Tokyo",
    category: "Office & Marketing",
    employmentType: "Full-time",
    salary: "¥320,000 – ¥420,000 / month",
    japaneseLevel: "N2",
    visaSupport: true,
    tags: ["Hybrid work", "Visa support", "English OK"],
    summary:
      "Create English content and campaigns that bring international travelers to Japan's hidden destinations.",
    description: [
      "Japan Travel Media runs travel platforms reaching 5M+ monthly international readers.",
      "You will plan SNS campaigns, write and edit English travel content, and coordinate with tourism boards across Japan.",
    ],
    requirements: [
      "Native-level English writing",
      "Business Japanese (N2+) for internal communication",
      "Experience in content marketing or SNS a plus",
    ],
  },
  {
    id: "guesthouse-fukuoka",
    title: "Guesthouse Front & Community Staff",
    company: "Hakata Base Hostel",
    location: "Hakata, Fukuoka",
    prefecture: "Fukuoka",
    category: "Hotel & Ryokan",
    employmentType: "Part-time",
    salary: "¥1,100 – ¥1,300 / hour",
    japaneseLevel: "N4",
    visaSupport: false,
    tags: ["Student OK", "English OK", "International team"],
    summary:
      "Run the front desk and community events at a backpacker hostel loved by travelers worldwide.",
    description: [
      "Hakata Base is a 60-bed hostel welcoming guests from around the world. Staff organize nightly events — izakaya tours, takoyaki parties, city walks.",
      "Perfect for students who want to use English every day while working in a fun, international environment.",
    ],
    requirements: [
      "Conversational English",
      "Basic Japanese (N4 or equivalent)",
      "Valid work permission (student visa with permission OK)",
    ],
  },
];

export function getJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}
