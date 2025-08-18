import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { Textarea } from "@/core/components/ui/textarea";
import { basePythonApiUrl } from "@/core/config/baseUrls";
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import React, { useCallback, useMemo, useRef, useState } from "react";

type AnalyzeRequest = { inci_names: string[] };

type MatchedItem = {
  ingredient_name: string;
  supplier_name: string;
  description: string;
  functionality_category_tree: string[][];
  chemical_class_category_tree: string[][];
  match_score: number; // 0..1
  matched_inci: string[];
  matched_count: number;
  total_brand_inci: number;
};

type AnalyzeResponse = {
  matched: MatchedItem[];
  unmatched: string[];
  overall_confidence: number; // 0..1
  processing_time: number; // 0..1
};
// const MOCK_RESPONSE: AnalyzeResponse = {
//   matched: [
//     {
//       ingredient_name: "Exfo-Bio",
//       supplier_name: "Chemyunion",
//       description:
//         "Exfo-Bio is a fruit extract containing carbohydrates and alpha-hydroxy acids that stimulates gentle biological exfoliation through the intelligent cell renewal. It also stimulates the production of extracellular matrix and acts as a wrinkles and fine lines filler.",
//       functionality_category_tree: [
//         ["Skin Conditioning Agents", "Miscellaneous"],
//       ],
//       chemical_class_category_tree: [["Botanical Products", "Derivatives"]],
//       match_score: 1,
//       matched_inci: [
//         "benzyl alcohol",
//         "glycerin",
//         "mangifera indica (mango) pulp extract",
//         "aqua",
//         "potassium sorbate",
//         "spondias mombin pulp extract",
//         "musa sapientum (banana) pulp extract",
//       ],
//       matched_count: 7,
//       total_brand_inci: 7,
//     },
//     {
//       ingredient_name: "Exfo-Bio",
//       supplier_name: "Chemyunion",
//       description:
//         "Exfo-Bio is a fruit extract containing carbohydrates and alpha-hydroxy acids that stimulates gentle biological exfoliation through the intelligent cell renewal. It also stimulates the production of extracellular matrix and acts as a wrinkles and fine lines filler.",
//       functionality_category_tree: [
//         ["Skin Conditioning Agents", "Miscellaneous"],
//       ],
//       chemical_class_category_tree: [["Botanical Products", "Derivatives"]],
//       match_score: 1,
//       matched_inci: [
//         "benzyl alcohol",
//         "glycerin",
//         "aqua",
//         "mangifera indica (mango) pulp extract",
//         "potassium sorbate",
//         "spondias mombin pulp extract",
//         "musa sapientum (banana) pulp extract",
//       ],
//       matched_count: 7,
//       total_brand_inci: 7,
//     },
//     {
//       ingredient_name: "euxyl® K 700",
//       supplier_name: "DKSH",
//       description:
//         "euxyl® K 700 from Ashland is a liquid cosmetic preservative, which can be used in leave-on as well as rinse-off products. It was developed for use in cosmetic formulations with a skin-friendly pH value up to 5.5. euxyl® K 700 has a broad, balanced spectrum of effect against bacteria, yeasts and mould fungi as well as a good vapour phase effectiveness. As a result of the special preparation, the tendency to discolouration known for sorbic acid can be reduced or prevented. In addition euxyl® K 700 can be stored for a longer period.",
//       functionality_category_tree: [
//         ["Oral Care Agents"],
//         ["Antioxidants"],
//         ["Fragrance Ingredients"],
//         ["Skin Conditioning Agents", "Miscellaneous"],
//         ["Skin Conditioning Agents", "Occlusives"],
//         ["Preservatives"],
//         ["Solvents"],
//         ["Viscosity Modifiers", "Decreasing"],
//         ["External Analgesics"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: [
//         "phenoxyethanol",
//         "tocopherol",
//         "benzyl alcohol",
//         "aqua",
//         "potassium sorbate",
//       ],
//       matched_count: 5,
//       total_brand_inci: 5,
//     },
//     {
//       ingredient_name: "euxyl® K 700",
//       supplier_name: "DKSH",
//       description:
//         "euxyl® K 700 from Ashland is a liquid cosmetic preservative, which can be used in leave-on as well as rinse-off products. It was developed for use in cosmetic formulations with a skin-friendly pH value up to 5.5. euxyl® K 700 has a broad, balanced spectrum of effect against bacteria, yeasts and mould fungi as well as a good vapour phase effectiveness. As a result of the special preparation, the tendency to discolouration known for sorbic acid can be reduced or prevented. In addition euxyl® K 700 can be stored for a longer period.",
//       functionality_category_tree: [
//         ["Oral Care Agents"],
//         ["Antioxidants"],
//         ["Fragrance Ingredients"],
//         ["Skin Conditioning Agents", "Miscellaneous"],
//         ["Skin Conditioning Agents", "Occlusives"],
//         ["Preservatives"],
//         ["Solvents"],
//         ["Viscosity Modifiers", "Decreasing"],
//         ["External Analgesics"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: [
//         "phenoxyethanol",
//         "tocopherol",
//         "benzyl alcohol",
//         "aqua",
//         "potassium sorbate",
//       ],
//       matched_count: 5,
//       total_brand_inci: 5,
//     },
//     {
//       ingredient_name: "euxyl® K 900",
//       supplier_name: "DKSH",
//       description:
//         "euxyl® K 900 from Schuelke is a liquid cosmetic preservative based on benzyl alcohol and ethylhexylglycerin. The addition of ethylhexylglycerin affects the interfacial tension at the cell membrane of microorganisms, improving the preservative activity of benzyl alcohol. Its use is permitted both in products that remain on the skin as well as in rinse-off products. It has a broad, balanced spectrum of effect against bacteria, yeasts and mould fungi.",
//       functionality_category_tree: [
//         ["Fragrance Ingredients"],
//         ["Preservatives"],
//         ["Solvents"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: ["benzyl alcohol", "ethylhexylglycerin", "tocopherol"],
//       matched_count: 3,
//       total_brand_inci: 3,
//     },
//     {
//       ingredient_name: "Frulix Guava",
//       supplier_name: "Assessa Indústria Comércio e Exportação Ltda",
//       description:
//         "Frulix Guava is obtained through an exclusive biotechnological process that mimics the natural ripening of fruit. Using the fruits’ native enzymes that change the texture of the fruit during its ripening, it transforms its pulp into a crystalline liquid. FRULIX preserves the properties of each fruit as found in nature. No water is added to the process. Solvent-free. 29 different fruits and 5 fruit complexes containing moisturizing mucilages, antioxidant flavonoids, vitamins, bioflavonoids, organic acids, essential sugars, and anthocyanins.",
//       functionality_category_tree: [["Bioactives"]],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: [
//         "psidium guajava fruit extract",
//         "ethylhexylglycerin",
//         "phenoxyethanol",
//       ],
//       matched_count: 3,
//       total_brand_inci: 3,
//     },
//     {
//       ingredient_name: "GINGER OIL",
//       supplier_name: "Provital",
//       description:
//         "GINGER OIL is an anti-inflammatory. Sensitive and/or irritated skin. Antioxidant. Anti-aging. Photoprotection. Hair color protection.",
//       functionality_category_tree: [],
//       chemical_class_category_tree: [],
//       match_score: 1,
//       matched_inci: [
//         "helianthus annuus (sunflower) seed oil",
//         "tocopherol",
//         "zingiber officinale (ginger) root extract",
//       ],
//       matched_count: 3,
//       total_brand_inci: 3,
//     },
//     {
//       ingredient_name: "euxyl® K 900",
//       supplier_name: "DKSH",
//       description:
//         "euxyl® K 900 from Schuelke is a liquid cosmetic preservative based on benzyl alcohol and ethylhexylglycerin. The addition of ethylhexylglycerin affects the interfacial tension at the cell membrane of microorganisms, improving the preservative activity of benzyl alcohol. Its use is permitted both in products that remain on the skin as well as in rinse-off products. It has a broad, balanced spectrum of effect against bacteria, yeasts and mould fungi.",
//       functionality_category_tree: [
//         ["Fragrance Ingredients"],
//         ["Preservatives"],
//         ["Solvents"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: ["benzyl alcohol", "ethylhexylglycerin", "tocopherol"],
//       matched_count: 3,
//       total_brand_inci: 3,
//     },
//     {
//       ingredient_name: "Frulix Guava",
//       supplier_name: "Assessa Indústria Comércio e Exportação Ltda",
//       description:
//         "Frulix Guava is obtained through an exclusive biotechnological process that mimics the natural ripening of fruit. Using the fruits’ native enzymes that change the texture of the fruit during its ripening, it transforms its pulp into a crystalline liquid. FRULIX preserves the properties of each fruit as found in nature. No water is added to the process. Solvent-free. 29 different fruits and 5 fruit complexes containing moisturizing mucilages, antioxidant flavonoids, vitamins, bioflavonoids, organic acids, essential sugars, and anthocyanins.",
//       functionality_category_tree: [["Bioactives"]],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: [
//         "psidium guajava fruit extract",
//         "ethylhexylglycerin",
//         "phenoxyethanol",
//       ],
//       matched_count: 3,
//       total_brand_inci: 3,
//     },
//     {
//       ingredient_name: "GINGER OIL",
//       supplier_name: "Provital",
//       description:
//         "GINGER OIL is an anti-inflammatory. Sensitive and/or irritated skin. Antioxidant. Anti-aging. Photoprotection. Hair color protection.",
//       functionality_category_tree: [],
//       chemical_class_category_tree: [],
//       match_score: 1,
//       matched_inci: [
//         "helianthus annuus (sunflower) seed oil",
//         "tocopherol",
//         "zingiber officinale (ginger) root extract",
//       ],
//       matched_count: 3,
//       total_brand_inci: 3,
//     },
//     {
//       ingredient_name: "Cetearyl Olivate (and) Sorbitan Olivate",
//       supplier_name: "Suzhou Greenway Biotech Co.,Ltd",
//       description:
//         "Cetearyl Olivate (and) Sorbitan Olivate is a natural emulsifier derived from olive oil. It has gentle and stable properties, enhances the texture and moisturizing effects of skincare products, and is suitable for dry and sensitive skin.",
//       functionality_category_tree: [
//         ["Hair Conditioning Agents"],
//         ["Skin Conditioning Agents", "Emollients"],
//         ["Slip Modifiers"],
//         ["Stabilizers", "Emulsion Stabilizers"],
//         ["Surfactants", "Emulsifying Agents"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: ["cetearyl olivate", "sorbitan olivate"],
//       matched_count: 2,
//       total_brand_inci: 2,
//     },
//     {
//       ingredient_name: "euxyl® PE 9010",
//       supplier_name: "DKSH",
//       description:
//         "Euxyl® PE9010 from Ashland, is a liquid cosmetic preservative with a broad, balanced spectrum of effect against bacteria, yeasts and mould fungi. It acts even in very low use-concentrations and has good vapor phase effectiveness. It can be used for leave on, rinse off, Leave on, sensitive and wet wipes application. Available in select countries. Please inquire for more details.",
//       functionality_category_tree: [
//         ["Anti", "Microbial Agents"],
//         ["Anti", "Fungal Agents"],
//         ["Preservatives"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: ["phenoxyethanol", "ethylhexylglycerin"],
//       matched_count: 2,
//       total_brand_inci: 2,
//     },
//     {
//       ingredient_name: "Florasun™ 90",
//       supplier_name: "Cargill Beauty",
//       description:
//         "Florasun™ 90 is a natural, triglyceride oil with superb oxidative stability and excellent emollient properties. The unprecedented resistance of Florasun 90 to rancidity is largely due to its high oleic acid content which represents 85% to 90% of the oil. By including this monounsaturated fatty acid and excluding high levels of polyunsaturates, exceptional oxidative stability is achieved without the presence of trans fatty acids.",
//       functionality_category_tree: [
//         ["Hair Conditioning Agents"],
//         ["Skin Conditioning Agents", "Emollients"],
//       ],
//       chemical_class_category_tree: [["Fats and Oils"]],
//       match_score: 1,
//       matched_inci: ["helianthus annuus (sunflower) seed oil", "tocopherol"],
//       matched_count: 2,
//       total_brand_inci: 2,
//     },
//     {
//       ingredient_name: "AE ProTek® Plus",
//       supplier_name: "AE Chemie",
//       description:
//         "New AE ProTek® Plus effectively reduces the surface tension of water, thus the wetting of surface is improved. This phenomenon makes the mixture of phenoxyethanol and ethylhexylglycerin very effective in penetrating the cell membranes of microorganisms resulting in optimized anti- microbial efficacy.",
//       functionality_category_tree: [
//         ["Anti", "Microbial Agents", "Cosmetic Biocides"],
//         ["Fragrance Ingredients"],
//         ["Skin Conditioning Agents", "Miscellaneous"],
//         ["Preservatives"],
//         ["Deodorant Agents"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: ["phenoxyethanol", "ethylhexylglycerin"],
//       matched_count: 2,
//       total_brand_inci: 2,
//     },
//     {
//       ingredient_name: "AmviShield® PE 9010",
//       supplier_name: "AMVIGOR ORGANICS PVT LTD",
//       description:
//         "AmviShield® PE 9010 is a liquid cosmetic preservative designed to prevent degradation of ingredients and deterioration of physical and chemical stability. It is used to prevent contamination during formulation, shipment, storage or consumer use in cosmetics. It also has a large spectrum of antimicrobial activity and is effective against various Gram-negative and Gram-positive as well as against yeasts.",
//       functionality_category_tree: [
//         ["Anti", "Microbial Agents", "Cosmetic Biocides"],
//         ["Fragrance Ingredients"],
//         ["Skin Conditioning Agents", "Miscellaneous"],
//         ["Preservatives"],
//         ["Deodorant Agents"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: ["phenoxyethanol", "ethylhexylglycerin"],
//       matched_count: 2,
//       total_brand_inci: 2,
//     },
//     {
//       ingredient_name: "AE ProTek® NPB",
//       supplier_name: "AE Chemie",
//       description:
//         "New AE ProTek® NPB has a broad spectrum efficacy against Gram Positive, Gram Negative, Yeast, and Fungi. It has efficacy booster and stabilizer for antimicrobials in combination with other ingredients. Non-Paraben Preservative for Cosmetics and Toiletries.",
//       functionality_category_tree: [
//         ["Anti", "Microbial Agents", "Cosmetic Biocides"],
//         ["Fragrance Ingredients"],
//         ["Skin Conditioning Agents", "Miscellaneous"],
//         ["Preservatives"],
//         ["Deodorant Agents"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: ["phenoxyethanol", "ethylhexylglycerin"],
//       matched_count: 2,
//       total_brand_inci: 2,
//     },
//     {
//       ingredient_name: "AdvensProtect PEHG",
//       supplier_name: "Seqens",
//       description:
//         "AdvensProtect PEHG is a combination of phenoxyethanol and ethylhexylglycerin. Phenoxyethanol is a broad-spectrum antimicrobial effective against Gram-negative and Gram-positive bacteria, as well as against yeasts. Ethylhexylglycerin is a multifunctional ingredient with great emollient and preservative booster properties. It is a strong booster for better protection against microbial growth. The boosting effect is due to the surfactant properties of ethylhexylglycerin, which affects the surface tension properties of bacteria, improving the contact between phenoxyethanol and the bacterial membrane.",
//       functionality_category_tree: [
//         ["Anti", "Microbial Agents", "Cosmetic Biocides"],
//         ["Fragrance Ingredients"],
//         ["Skin Conditioning Agents", "Miscellaneous"],
//         ["Preservatives"],
//         ["Deodorant Agents"],
//       ],
//       chemical_class_category_tree: [["Mixtures"]],
//       match_score: 1,
//       matched_inci: ["phenoxyethanol", "ethylhexylglycerin"],
//       matched_count: 2,
//       total_brand_inci: 2,
//     },
//     {
//       ingredient_name: "Biochemica® Sunflower Oil REF",
//       supplier_name: "Hallstar",
//       description:
//         "Biochemica® Sunflower Oil REF exhibits excellent penetrating qualities and good spreadability on the skin, making it ideal as a massage oil or as a carrier oil for cosmetics and treatment products. It adds moisturizing attributes to creams, lotions and bar soaps. This product may be used in cosmetics, toiletries, bar soaps, massage oils, hair care and sun care applications.",
//       functionality_category_tree: [],
//       chemical_class_category_tree: [],
//       match_score: 1,
//       matched_inci: ["helianthus annuus (sunflower) seed oil"],
//       matched_count: 1,
//       total_brand_inci: 1,
//     },
//     {
//       ingredient_name: "Beta-Carotene",
//       supplier_name: "COSROMA",
//       description:
//         "Beta-Carotene offered by COSROMA® is called Cosroma® BCT-S. Cosroma® BCT-S is one of the carotenoids. It serves as an antioxidant and precursor to vitamin A, it is referred to as provitamin A. Cosroma® BCT-S is a wonderful skin conditioning ingredient and is also used as a cosmetic colorant. Cosroma® BCT-S is commonly used into skincare products for protecting against UVA-light induced damage.",
//       functionality_category_tree: [],
//       chemical_class_category_tree: [],
//       match_score: 1,
//       matched_inci: ["beta-carotene"],
//       matched_count: 1,
//       total_brand_inci: 1,
//     },
//     {
//       ingredient_name: "Covi-ox® T-70 C",
//       supplier_name: "BASF",
//       description:
//         "Covi-ox® T 70 C is an active ingredient and antioxidant in skin and hair care preparations.",
//       functionality_category_tree: [],
//       chemical_class_category_tree: [],
//       match_score: 1,
//       matched_inci: ["tocopherol"],
//       matched_count: 1,
//       total_brand_inci: 1,
//     },
//     {
//       ingredient_name: "Covi-ox® T-50 C",
//       supplier_name: "BASF",
//       description:
//         "Covi-ox® T 50 C is an active ingredient and antioxidant in skin and hair care preparations.",
//       functionality_category_tree: [],
//       chemical_class_category_tree: [],
//       match_score: 1,
//       matched_inci: ["tocopherol"],
//       matched_count: 1,
//       total_brand_inci: 1,
//     },
//     {
//       ingredient_name: "Covi-Ox® T-90 EU C",
//       supplier_name: "BASF",
//       description:
//         "Covi-ox® T-90 EU C is an active ingredient and antioxidant in skin and hair care preparations. It is derived from non-genetically modified sources.",
//       functionality_category_tree: [],
//       chemical_class_category_tree: [],
//       match_score: 1,
//       matched_inci: ["tocopherol"],
//       matched_count: 1,
//       total_brand_inci: 1,
//     },
//     {
//       ingredient_name: "Edeta® BD",
//       supplier_name: "BASF",
//       description:
//         "EDETA® BD is a complex builder for sequestering undesirable metal ions in cosmetic preparations.",
//       functionality_category_tree: [],
//       chemical_class_category_tree: [],
//       match_score: 1,
//       matched_inci: ["disodium edta"],
//       matched_count: 1,
//       total_brand_inci: 1,
//     },
//     {
//       ingredient_name: "Copherol® F 1300 C",
//       supplier_name: "BASF",
//       description:
//         "Copherol® F 1300 C is an active ingredient in skin care and hair care preparations",
//       functionality_category_tree: [],
//       chemical_class_category_tree: [],
//       match_score: 1,
//       matched_inci: ["tocopherol"],
//       matched_count: 1,
//       total_brand_inci: 1,
//     },
//   ],
//   unmatched: [
//     "arisaema amurense extract",
//     "carica papaya fruit extract",
//     "citrus limon (lemon) peel extract",
//     "fragrance",
//     "lactic acid/glycolic acid copolymer",
//     "linoleic acid",
//     "methyl lactate",
//     "norisoleucyl sh-nonapeptide-1",
//     "nymphaea alba flower extract",
//     "palmitoyl sh-octapeptide-24 amide",
//     "palmitoyl sh-tripeptide-5",
//     "polyvinyl alcohol",
//     "saxifraga sarmentosa extract",
//     "sodium palmitoyl proline",
//     "xanthophylls",
//   ],
//   overall_confidence: 1,
//   processing_time: 3.971,
// };

async function fetchIngredientAnalysis(
  req: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  // simulate an API call (kept synchronous-fast for now)
  //   console.log("Analyze payload", req);
  //   return Promise.resolve(MOCK_RESPONSE);
  const response = await axios.post(
    `${basePythonApiUrl}/api/analyze-inci`,
    req,
  );
  return response.data;
}

/* ---------------------------------- UI ------------------------------------ */

// const Badge = memo(function Badge({ children }: { children: React.ReactNode }) {
//   return (
//     <span
//       className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/10 ring-inset"
//       role="status"
//     >
//       {children}
//     </span>
//   );
// });

// function Progress({ value }: { value: number }) {
//   const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
//   return (
//     <div aria-label="match score" className="w-24">
//       <div className="flex items-center justify-end gap-2 text-sm font-semibold">
//         <span>{pct}%</span>
//       </div>
//       <div
//         className="mt-1 h-2 w-full rounded-full bg-gray-200"
//         role="progressbar"
//         aria-valuenow={pct}
//         aria-valuemin={0}
//         aria-valuemax={100}
//       >
//         <div
//           className="h-2 rounded-full bg-emerald-500"
//           style={{ width: `${pct}%` }}
//         />
//       </div>
//     </div>
//   );
// }

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold tracking-tight">{children}</h2>;
}

function IngredientAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AnalyzeResponse | null>(null);
  console.log("🚀 ~ IngredientAnalyzer ~ resp:", resp);
  const [activeTab, setActiveTab] = useState<"matched" | "unmatched">(
    "matched",
  );
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Parse list on the fly (fast + memoized)
  const parsed = useMemo(() => {
    return (
      text
        .split(/[\n,]+/g)
        //   .map((s) => s.trim())
        .filter(Boolean)
    );
  }, [text]);

  const detectedCount = parsed?.length;

  const onAnalyze = useCallback(async () => {
    setLoading(true);
    try {
      const payload: AnalyzeRequest = { inci_names: parsed };
      const data = await fetchIngredientAnalysis(payload);
      setResp(data);
      setActiveTab("matched");
    } finally {
      setLoading(false);
    }
  }, [parsed]);

  //   const tryExample = useCallback(() => {
  //     const sample = [
  //       "arisaema amurense extract",
  //       "palmitoyl sh-octapeptide-24 amide",
  //       "palmitoyl sh-tripeptide-5",
  //       "decyl glucoside",
  //       "1,2-hexanediol",
  //       "zingiber officinale (ginger) root extract",
  //     ].join(", ");
  //     setText(sample);
  //     // move focus for a11y
  //     requestAnimationFrame(() => inputRef.current?.focus());
  //   }, []);

  return (
    <PageContent hideGradient className="mx-auto max-w-6xl p-6">
      {/* Top card */}
      <div className="bg-card border-border rounded-xl border p-6 shadow-lg">
        <h1 className="text-xl font-semibold">
          Paste your product&apos;s INCI list
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter ingredients separated by commas, as they appear on your product
          label
        </p>

        <div className="relative mt-4">
          <label htmlFor="inci" className="sr-only">
            INCI list
          </label>
          <Textarea
            id="inci"
            ref={inputRef}
            className="min-h-[180px]"
            placeholder="e.g. Aqua, Glycerin, Decyl Glucoside, 1,2-Hexanediol…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-describedby="inci-help"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            variant={"contained"}
            color={"primary"}
            type="button"
            onClick={onAnalyze}
            disabled={loading || parsed?.length === 0}
          >
            <MagnifyingGlassIcon />
            {loading ? "Analyzing…" : "Analyze Ingredients"}
          </Button>

          <div className="ml-auto text-sm text-gray-600">
            <span className="mr-2">📦</span>
            {detectedCount} ingredient{textEnding(detectedCount)} detected
          </div>
        </div>
      </div>

      {/* Results */}
      {resp && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Analysis Results</h2>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-emerald-700">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Overall: {Math.round(resp.overall_confidence * 100)}% confidence
              </div>
              <div className="text-gray-500">
                {resp.processing_time}s processing time
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex flex-wrap gap-2">
            <TabButton
              active={activeTab === "matched"}
              onClick={() => setActiveTab("matched")}
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-600 text-[11px] font-bold text-white">
                  ⓘ
                </span>
              }
              label={"Branded Ingredients"}
              count={resp.matched?.length}
            />
            <TabButton
              active={activeTab === "unmatched"}
              onClick={() => setActiveTab("unmatched")}
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-gray-900 text-[11px] text-white">
                  ⚡
                </span>
              }
              label="Unmatched INCI"
              count={resp.unmatched?.length}
            />
            {/* <TabButton
              active={activeTab === "conflicts"}
              onClick={() => setActiveTab("conflicts")}
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-[11px] text-gray-800">
                  ⓘ
                </span>
              }
              label="Conflicts & Ambiguities"
              count={0}
            /> */}
          </div>

          {activeTab === "matched" && (
            <div className="space-y-6">
              {resp.matched?.map((m) => (
                <article
                  key={m.ingredient_name}
                  className="bg-card ring-border hover:ring-primary rounded-lg p-5 shadow-lg ring transition hover:ring-2"
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-lg font-semibold capitalize">
                          {m.ingredient_name}
                        </h3>
                        {/* <Badge>High Confidence</Badge> */}
                      </div>
                      <div className="text-muted-foreground mt-1 flex gap-1 text-sm">
                        <BuildingStorefrontIcon className="size-5 capitalize" />{" "}
                        {m.supplier_name}
                      </div>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
                        {m.description}
                      </p>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <SectionTitle>
                            Matched INCI Names{" "}
                            {m.matched_count && (
                              <span className="text-muted-foreground text-sm">
                                ({m.matched_count})
                              </span>
                            )}
                          </SectionTitle>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {m.matched_inci?.map((i) => (
                              //   <Pill key={i}>{i}</Pill>
                              <Badge
                                variant={"outline"}
                                className="text-muted-foreground border-primary capitalize"
                                key={i}
                              >
                                {i}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {/* <div className="sm:text-right">
                          <SectionTitle>Match Count</SectionTitle>
                          <div className="mt-2 inline-flex items-center gap-4">
                            {m.matched_count}
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === "unmatched" && (
            <div>
              <SectionTitle>Unmatched INCI</SectionTitle>
              <p className="mt-2 text-sm text-gray-600">
                We couldn’t match these items to branded ingredients. Check
                spelling or upload a TDS.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {resp.unmatched?.map((u) => (
                  <Badge
                    variant={"outline"}
                    className="text-muted-foreground border-primary capitalize"
                    key={u}
                  >
                    {u}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* {activeTab === "conflicts" && (
            <EmptyState
              title="No conflicts found"
              description="If we detect ambiguous or conflicting INCI, they’ll show up here with resolution suggestions."
            />
          )} */}
        </div>
      )}
    </PageContent>
  );
}

/* ------------------------------- Small bits ------------------------------- */

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-inset",
        active
          ? "bg-primary ring-primary text-white"
          : "bg-white ring-gray-300 hover:bg-gray-50",
      ].join(" ")}
      aria-pressed={active}
    >
      {icon}
      <span>{label}</span>
      <span
        className={
          active
            ? "rounded bg-white/20 px-2 py-0.5 text-xs"
            : "rounded bg-gray-100 px-2 py-0.5 text-xs"
        }
      >
        {count}
      </span>
    </button>
  );
}

// function EmptyState({
//   title,
//   description,
// }: {
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="flex flex-col items-center rounded-md border border-dashed border-gray-300 p-10 text-center">
//       <div className="mb-3 rounded-full bg-gray-100 p-3">🟦</div>
//       <h3 className="text-base font-medium">{title}</h3>
//       <p className="mt-1 max-w-md text-sm text-gray-600">{description}</p>
//     </div>
//   );
// }

function textEnding(n: number) {
  return n === 1 ? "" : "s";
}

// export default function Page() {
//   return <IngredientAnalyzer />;
// }
const IngredientDetail = () => {
  return (
    <div>
      <IngredientAnalyzer />
    </div>
  );
};

export default IngredientDetail;
