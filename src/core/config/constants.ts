export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export const PERSONAL_CARE_DATA = {
  skin: {
    types: ["Oily", "Combination", "Dry", "Normal"],
    concerns: [
      "Dullness",
      "Tan",
      "Roughness",
      "Wrinkles",
      "Sagging Skin",
      "Dark Circles",
      "Undereye Puffiness",
      "Melasma",
      "Dark Spots",
      "Photodamage",
      "Acne",
      "Oily Skin",
      "Dryness",
    ],
  },
  hair: {
    types: [],
    concerns: [
      "Dull Hair",
      "Damaged Hair",
      "Split Hair",
      "Hair Loss",
      "Brittle Hair",
    ],
  },
  scalp: {
    types: [],
    concerns: ["Dandruff", "Sensitive Scalp"],
  },
};

export interface AgeGroup {
  label: string;
  min: number;
  max: number;
}

export const MASTER_DATA = {
  location: ["Metro", "Tier 1", "Tier 2"],
  gender: ["Male", "Female"],
  ageGroup: [
    { label: "18-24", min: 18, max: 24 },
    { label: "25-32", min: 25, max: 32 },
    { label: "33-50", min: 33, max: 50 },
    { label: "51+", min: 51, max: 150 },
  ] as AgeGroup[],
};

export const SURVEY = {
  MAX_QUESTIONS: 5,
  MAX_OPTIONS: 7,
  INPUT_TYPES: ["Yes/No", "MCQ", "Scaling", "Descriptive"],

  BRAND_PRODUCT_CATEGORY_OPTIONS: {
    colourCosmetics: { value: "colour-cosmetics", label: "Colour Cosmetics" },
    personalCareProducts: {
      value: "personal-care-products",
      label: "Personal Care Products",
    },
    nutraceuticalsAndWellness: {
      value: "nutraceuticals-and-wellness",
      label: "Nutraceuticals and Wellness",
    },
    devices: { value: "devices", label: "Devices" },
  },

  SELLING_PLATFORMS: {
    amazon: { label: "Amazon", value: "amazon" },
    flipkart: { label: "Flipkart", value: "flipkart" },
    myntra: { label: "Myntra", value: "myntra" },
    nykaa: { label: "Nykaa", value: "nykaa" },
    purplle: { label: "Purplle", value: "purplle" },
    other: { label: "Other", value: "other" },
  },
};
