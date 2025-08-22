import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { PageContent } from "@components/ui/structure";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import { Textarea } from "@components/ui/textarea";
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";
import { basePythonApiUrl } from "@/core/config/baseUrls";

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

type GroupItem = {
  inci_list: string[];
  items: MatchedItem[];
  count: number;
};

type AnalyzeResponse = {
  grouped: GroupItem[];
  unmatched: string[];
  overall_confidence: number; // 0..1
  processing_time: number; // 0..1
};
// const MOCK_RESPONSE: AnalyzeResponse = {
//   grouped: [
//     {
//       inci_list: ["carmine", "iron oxides", "mica", "titanium dioxide"],
//       items: [
//         {
//           ingredient_name: "Cloisonne® Nu-Antique Red",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Nu-Antique Red is composed of platelets of mica, titanium dioxide, iron oxides, and carmine. It is supplied as a grayish-red free-flowing powder. This product is recommended for use in color pigments for color cosmetic and personal care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "carmine", "mica"],
//           matched_count: 4,
//           total_brand_inci: 4,
//         },
//         {
//           ingredient_name: "Gemtone® Ruby",
//           supplier_name: "Sun Chemical",
//           description:
//             "Gemtone® Ruby is a precious jewel-like, rich earth tone pigment that produces a ruby color of liveliness and intensity. It is a mineral makeup that is ideally used where luster, dimensionality, and complex colors are desired, specifically eye shadow, facial makeup, liquid soaps, and lipstick applications. This product can be used alone or in conjunction with other effect pigments to create a myriad of color possibilities.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "carmine", "mica"],
//           matched_count: 4,
//           total_brand_inci: 4,
//         },
//         {
//           ingredient_name: "Gemtone® Garnet",
//           supplier_name: "Sun Chemical",
//           description:
//             "Gemtone® Garnet is a precious jewel, earth tone pigment that produces a garnet color of liveliness and intensity. It is a mineral makeup that is ideally used where luster, dimensionality, and complex colors are desired, specifically eye shadow, facial makeup, liquid soaps, and lipstick applications.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "carmine", "mica"],
//           matched_count: 4,
//           total_brand_inci: 4,
//         },
//         {
//           ingredient_name: "Gemtone® Sunstone",
//           supplier_name: "Sun Chemical",
//           description:
//             "Gemtone® Sunstone is an inorganic lustrous orange-yellow free flowing powder. It is ideal for use as a color pigment for color cosmetics and personal care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "carmine", "mica"],
//           matched_count: 4,
//           total_brand_inci: 4,
//         },
//       ],
//       count: 4,
//     },
//     {
//       inci_list: ["iron oxides", "mica", "titanium dioxide"],
//       items: [
//         {
//           ingredient_name: "Cloisonne® Rouge Flambé",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Rouge Flambé contains an absorption colorant deposited on either a mica substrate or an interference pearl base. It is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Gold is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Monarch Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Monarch Gold is a lustrous yellow free-flowing powder. It is used in color pigments for color cosmetics and personal care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Sparkle Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Sparkle Gold is an intense and lustrous pigment that adds a high degree of shimmer to a broad range of cosmetics and personal care products. Its large particle size makes it particularly well suited for dynamic, sparkly effects.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Super Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Super Gold is an intermediate particle size interference pigment with superior chromaticity and metallic effects. It imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Nu-Antique Bronze",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Nu-Antique Bronze contains an absorption colorant deposited on either a mica substrate or an interference pearl base. It is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Copper",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Copper is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle. In grades that use an interference base, the colorant is selected to reinforce the reflection color of the interference pigment. The result is a single dramatic reflection/transmission color.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Nu-Antique Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Nu-Antique Gold contains an absorption colorant deposited on either a mica substrate or an interference pearl base. It is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Nu-Antique Copper",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Nu-Antique Copper contains an absorption colorant deposited on either a mica substrate or an interference pearl base. It is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Golden Bronze",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Golden Bronze is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Nu-Antique Rouge Flambé",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Nu-Antique Rouge Flambé contains an absorption colorant deposited on either a mica substrate or an interference pearl base. It is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Orange",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Orange contains an absorption colorant deposited on either a mica substrate or an interference pearl base. It is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Chromatique Silver Gray / MCM-4407",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Chromatique Silver Gray / MCM-4407 is a gray lustrous powder that is composed of Mica, Titanium Dioxide, and Iron Oxides. It is part of Impact Colors' Chromatique Colors Line of Products that provide intense and dramatic colors and a variety of pearlescent effects to many types of cosmetic and personal care products. Chromatique Pigments contain an absorption colorant deposited on either a mica substrate or an interference pearl base, providing a much more intense and rich color effect. In grades using an interference base, the colorant is selected to reinforce the reflection color of the interference pigment. The result is a single color dramatically enhanced through the reflection color complimenting the transition color.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Chromatique Starlight Golden Brown / MCM-4383",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Chromatique Starlight Golden Brown / MCM-4383 is a mica based pearl pigment with a low micron size. This golden brown powder forms an intense and lustrous pearl pigment that is very smooth and attractive and gives an ideal look to eye shadows. This product has a particle size of 10-60μm.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Chromatique Starlight Chestnut Brown / MCM-4389",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Chromatique Starlight Chestnut Brown / MCM-4389 is a tan lustrous powder that is composed of Mica, Titanium Dioxide, and Iron Oxides. It provides intense and dramatic colors and a variety of pearlescent effects to many types of cosmetic and personal care products. Chromatique Pigments contain an absorption colorant deposited on either a mica substrate or an interference pearl base, providing a much more intense and rich color effect. In grades using an interference base, the colorant is selected to reinforce the reflection color of the interference pigment. The result is a single color dramatically enhanced through the reflection color complimenting the transition color.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Chromatique Luster Black / MCM-4402",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Chromatique Luster Black / MCM-4402 is a mica based pearl pigment with a low micron size. This grey black powder forms an intense and lustrous pearl pigment that is very smooth and attractive and gives an ideal look to eye shadows. This product has a particle size of 10-60μm.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Eldorado Gold Shimmer / MGL-351",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Gold Shimmer / MGL-351 is a gold lustrous powder that is composed of Mica, Titanium Dioxide, and Iron Oxides. Eldorado Gold pigments are composed of mica coated with titanium dioxide and iron oxide. A wide array of gold shades is obtained by differing particle sizes and the ratio of iron oxide to titanium dioxide. Eldorado Gold pearls are useful for a wide variety of decorative cosmetic and personal care products where a golden luster or sparkle effect is desired. They can also be used in all types of gels or emulsions, either to provide a golden glitter effect in the product itself or a golden sheen when applied to the skin.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Eldorado Gold Satin / MGF-302",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Gold Satin / MGF-302 is a gold lustrous powder that is composed of Mica, Titanium Dioxide, and Iron Oxides. Eldorado Gold pigments are composed of mica coated with titanium dioxide and iron oxide. A wide array of gold shades is obtained by differing particle sizes and the ratio of iron oxide to titanium dioxide. Eldorado Gold pearls are useful for a wide variety of decorative cosmetic and personal care products where a golden luster or sparkle effect is desired. They can also be used in all types of gels or emulsions, either to provide a golden glitter effect in the product itself or a golden sheen when applied to the skin.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Eldorado Sparkly Deep Gold / MGL-4315",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Sparkly Deep Gold / MGL-4315 is a gold lustrous powder that is composed of Mica, Titanium Dioxide, and Iron Oxides. Eldorado Gold pigments are composed of mica coated with titanium dioxide and iron oxide. A wide array of gold shades is obtained by differing particle sizes and the ratio of iron oxide to titanium dioxide. Eldorado Gold pearls are useful for a wide variety of decorative cosmetic and personal care products where a golden luster or sparkle effect is desired. They can also be used in all types of gels or emulsions, either to provide a golden glitter effect in the product itself or a golden sheen when applied to the skin.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Gemtone® Moonstone",
//           supplier_name: "Sun Chemical",
//           description:
//             "Gemtone® Moonstone is a precious jewel-like, rich earth tone pigment that produces a moonstone color of liveliness and intensity. It is a mineral makeup that is ideally used where luster, dimensionality, and complex colors are desired, specifically eye shadow, facial makeup, liquid soaps, and lipstick applications. This product can be used alone or in conjunction with other effect pigments to create a myriad of color possibilities.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Gemtone® Amber",
//           supplier_name: "Sun Chemical",
//           description:
//             "Gemtone® Amber is a precious jewel pigment that produces an amber color of liveliness and intensity. It is ideally used where luster, dimensionality, and complex colors are desired, specifically eye shadow, facial makeup, liquid soaps, and lipstick applications.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Gemtone® Tan Opal",
//           supplier_name: "Sun Chemical",
//           description:
//             "Gemtone® Tan Opal is a precious jewel-like, rich earth tone pigment that produces a tan opal color of liveliness and intensity. It is a mineral makeup that is ideally used where luster, dimensionality, and complex colors are desired, specifically eye shadow, facial makeup, liquid soaps, and lipstick applications. This product can be used alone or in conjunction with other effect pigments to create a myriad of color possibilities.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Flamenco® Silk Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Silk Gold has a fine particle size, and provides subtle luster for matte-type and low luster cosmetics and personal care formulations. It has the smallest particle size of any cosmetic grade interference colors, and provides excellent coverage and a fine, satin appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Flamenco® Silk Red",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Silk Red has a fine particle size, and provides subtle luster for matte-type and low luster cosmetics and personal care formulations. It has the smallest particle size of any cosmetic grade interference colors, and provides excellent coverage and a fine, satin appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Flamenco® Silk Green",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Silk Green has a fine particle size, and provides subtle luster for matte-type and low luster cosmetics and personal care formulations. It has the smallest particle size of any cosmetic grade interference colors, and provides excellent coverage and a fine, satin appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "DP Classy Satin Gold / M3186",
//           supplier_name: "Sandream Specialties",
//           description:
//             "DP Classy Satin Gold / M3186 is a mica based pearl pigment with a low micron size. This bright gold powder forms an intense and lustrous pearl pigment that is very smooth and attractive and gives an ideal look to eye shadows.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Duocrome® YG",
//           supplier_name: "Sun Chemical",
//           description:
//             "Duocrome® YG is a two-toned make-up formula that offers an interplay of background and highlight colors, producing a distinctive two-toned look, that creates effects from sweet and playful to a pleasantly striking appearance. It is ideally used in color cosmetics and personal care products, delivering a jewel-like, antiqued-look,infusing finished formulation with  fashionable flare.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Duocrome® YR",
//           supplier_name: "Sun Chemical",
//           description:
//             "Duocrome® YR is a two-toned make-up formula that offers an interplay of background and highlight colors, producing a distinctive two-toned look, that creates effects from sweet and playful to a pleasantly striking appearance. It is ideally used in color cosmetics and personal care products, delivering a jewel-like, antiqued-look,infusing finished formulation with fashionable flare.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Patina Silver",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Patina Silver is a pearlescent pigment with a graphite like silver luster. It is applicable in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Karat Gold MP-24",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Karat Gold MP-24 is a pearlescent effect pigment with a deep golden sparkle. It is applicable in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Ochre",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Ochre is a pastel hue of shimmering coral red. It is suitable for use in color cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Sun Gold Sparkle MP-29",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Sun Gold Sparkle MP-29 is a pearlescent pigment with a deep golden sparkle. It is applicable in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Beige",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Beige emanates a silky shade of subtly lustrous beige that lends itself perfectly to match skin complexions.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Transgold MP-28",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Transgold MP-28 is a shade of bright, gold sparkle. It has a golden, powdery appearance that is suitable for use in color cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Amber",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Amber is a shimmery tawny hue reminding us of the glistening surface of molten caramel.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Gold Plus MP-25",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Gold Plus MP-25 is a pearlescent effect pigment with a bright-golden sparkle. It is applicable in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Patina Gold",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Patina Gold is a pearlescent pigment with a rustic golden luster. It is applicable in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Red Gold",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Red Gold is a pearlescent effect pigment with a red-golden shimmer. It fits well in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Mica Black",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Mica Black is an effect pigment with a discreet shiny black appearance. It is applicable in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "titanium dioxide", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//       ],
//       count: 39,
//     },
//     {
//       inci_list: ["carmine", "mica", "titanium dioxide"],
//       items: [
//         {
//           ingredient_name: "Cloisonne® Super Red",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Super Red is an intermediate particle size interference pigment with superior chromaticity and metallic effects. It imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Sparkle Red",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Sparkle Red is an intense and lustrous pigment that adds a high degree of shimmer to a broad range of cosmetics and personal care products. Its large particle size makes it particularly well suited for dynamic, sparkly effects.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Cloisonne® Red",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Red is composed of platelets of mica coated with titanium dioxide and a small amount of carmine. It is a lustrous red-pink, free flowing powder designed for colored pigments for color cosmetic and personal care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Duocrome® RV",
//           supplier_name: "Sun Chemical",
//           description:
//             "Duocrome® RV is a two-toned make-up formula that offers an interplay of background and highlight colors, producing a distinctive two-toned look, that creates effects from sweet and playful to a pleasantly striking appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Duocrome® RB",
//           supplier_name: "Sun Chemical",
//           description:
//             "Duocrome® RB is a two-toned make-up formula that offers an interplay of background and highlight colors, producing a distinctive two-toned look, that creates effects from sweet and playful to pleasantly striking appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Duocrome® RY",
//           supplier_name: "Sun Chemical",
//           description:
//             "Duocrome® RY is a two-toned make-up formula that offers an interplay of background and highlight colors, producing a distinctive two-toned look, that creates effects from sweet and playful to a pleasantly striking appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Duocrome® RO",
//           supplier_name: "Sun Chemical",
//           description:
//             "Duocrome® RO is a two-toned make-up formula that offers an interplay of background and highlight colors, producing a distinctive two-toned look, that creates effects from sweet and playful to pleasantly striking appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Duocrome® Sparkle RY",
//           supplier_name: "Sun Chemical",
//           description:
//             "Duocrome® Sparkle RY is a two-toned sparkling effect make-up formula that offers an interplay of background and highlight colors, producing a distinctive two-toned look, that creates effects from sweet and playful to a pleasantly striking appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® RY",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® RY is a two-tone pearlescent pigment with a pink-red and golden shimmer. It is applicable in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//         {
//           ingredient_name: "Colorona® Magenta",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Magenta is a pearlescent pigment with a violet-bluish shimmer. It is applicable in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "carmine", "mica"],
//           matched_count: 3,
//           total_brand_inci: 3,
//         },
//       ],
//       count: 10,
//     },
//     {
//       inci_list: ["iron oxides", "mica"],
//       items: [
//         {
//           ingredient_name: "Cloisonne® Sparkle Rouge",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Sparkle Rouge is an intense and lustrous pigment that adds a high degree of shimmer to a broad range of cosmetics and personal care products. Its large particle size makes it particularly well suited for dynamic, sparkly effects.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cloisonne® Sparkle Copper",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Sparkle Copper is an intense and lustrous pigment that adds a high degree of shimmer to a broad range of cosmetics and personal care products. Its large particle size makes it particularly well suited for dynamic, sparkly effects.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cloisonne® Super Rouge",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Super Rouge is composed of platelets of mica coated with iron oxides. It is supplied as a lustrous red free-flowing powder. This product is recommended for use in color pigments for color cosmetic and personal care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cloisonne® Super Bronze",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Super Bronze is an intermediate particle size interference pigment with superior chromaticity and metallic effects. It imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cloisonne® Sparkle Bronze",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Sparkle Bronze is platelets of mica and iron oxides. This powder is ideal for use in color pigments for color cosmetics and personal care products.",
//           functionality_category_tree: [
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//           ],
//           chemical_class_category_tree: [["Inorganics"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cloisonne® Satin Rouge",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Satin Rouge contains an absorption colorant deposited on either a mica substrate or an interference pearl base. It is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cloisonne® Cerise Flambé",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Cerise Flambé is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cloisonne® Blue Flambé",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Blue Flambé is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cloisonne® Satin Bronze",
//           supplier_name: "Sun Chemical",
//           description:
//             "Cloisonne® Satin Bronze contains an absorption colorant deposited on either a mica substrate or an interference pearl base. It is an enhancing pigment that imparts dramatic color and varied pearlescent effects to many types of cosmetics and personal care products. It is available in a variety of grades that provide different degrees of luster, ranging from a soft, satiny look to high sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Chromatique Starlight Red Brown / MCF-4513",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Chromatique Starlight Red Brown / MCF-4513 is a copper lustrous powder that is composed of Mica and Iron Oxides. Chromatique Colors provide intense and dramatic colors and a variety of pearlescent effects to many types of cosmetic and personal care products. Chromatique Pigments contain an absorption colorant deposited on either a mica substrate or an interference pearl base, providing a much more intense and rich color effect. In grades using an interference base, the colorant is selected to reinforce the reflection color of the interference pigment. The result is a single color dramatically enhanced through the reflection color complimenting the transition color.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Eldorado Breen / MMM-509",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Breen / MMM-509 is a green/brown lustrous powder that is composed of Mica and Iron Oxides. Eldorado Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. Many Eldorado Pigments are perfect for sun care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Eldorado Bronze Shimmer / MML-530",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Bronze Shimmer / MML-530 is a tan lustrous powder that is composed of Mica and Iron Oxides. Eldorado Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. Many Eldorado Pigments are perfect for sun care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Eldorado Satin Bronze / MMF-520",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Satin Bronze / MMF-520 is a copper lustrous powder that is composed of mica coated with titanium dioxide and iron oxide. Eldorado Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. Many Eldorado Pigments are perfect for sun care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Eldorado Satin Wine Red / MMF-524",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Satin Wine Red / MMF-524 is a red lustrous powder that is composed of Mica and Iron Oxides. Eldorado Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. Many Eldorado Pigments are perfect for sun care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Eldorado Red-Brown / MMM-502",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Red-Brown / MMM-502 is a red/gold lustrous powder that is composed of Mica and Iron Oxides and along with earth tone colors, offers deep warm tones. Eldorado Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. Many Eldorado Pigments are perfect for sun care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Eldorado Satin Mauve / MMF-525",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Satin Mauve / MMF-525 is a red lustrous powder that is composed of Mica and Iron Oxides. Eldorado Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. Many Eldorado Pigments are perfect for sun care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Eldorado Wine Red Glitter / MML-534",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Wine Red Glitter / MML-534 is a red lustrous powder that is composed of Mica and Iron Oxides and along with earth tone colors, offers deep warm tones. Eldorado Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. Many Eldorado Pigments are perfect for sun care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Eldorado Mauve / MMM-505",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Mauve / MMM-505 is a red lustrous powder that is composed of Mica and Iron Oxides. Eldorado Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. Many Eldorado Pigments are perfect for sun care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Eldorado Reddish Brown / MMM-510",
//           supplier_name: "Sandream Specialties",
//           description:
//             "Eldorado Reddish Brown / MMM-510 is a red/brown lustrous powder that is composed of Mica and Iron Oxides. Eldorado Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. Many Eldorado Pigments are perfect for sun care products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "DP Bronze M5000",
//           supplier_name: "Sandream Specialties",
//           description:
//             "DP Bronze / M5000 is a tan lustrous powder that is composed of Mica and Iron Oxides. Metallic Pigments can be used alone, blended together, or added as accents to other colors. They add metallic depth and highlights to eye shadow, eyeliners, lipsticks, nail enamels, shampoos, soaps, and many other personal care formulations. They are perfect for sun care products.",
//           functionality_category_tree: [
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//           ],
//           chemical_class_category_tree: [["Color Additives"], ["Inorganics"]],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Colorona® Bronze Sparkle",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Bronze Sparkle is a pearlescent pigment with a golden-brown sparkle effect. It fits well in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//       ],
//       count: 21,
//     },
//     {
//       inci_list: ["mica", "titanium dioxide"],
//       items: [
//         {
//           ingredient_name: "Cosmetica® Shimmering White N-8000E",
//           supplier_name: "DKSH",
//           description:
//             "Cosmetica® Shimmering White N-8000E is a fine silk white, free-flowing powder.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cosmetica® Fine White N-8000D",
//           supplier_name: "DKSH",
//           description:
//             "Cosmetica® Fine White N-8000D is a fine silk white, free-flowing powder.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cosmetica® Super White N-8000S",
//           supplier_name: "DKSH",
//           description:
//             "Cosmetica® Super White N-8000S is a brilliant silver white, free-flowing powder.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cosmetica® Velvet White N-8000F",
//           supplier_name: "DKSH",
//           description:
//             "Cosmetica® Velvet White N-8000F is a fine silk white, free-flowing powder.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Geopearl® C Bright Silver",
//           supplier_name: "Geotech International B.V.",
//           description:
//             "Geopearl® C Bright Silver is a silver/white natural mica based pearlescent pigment for cosmetic products. Resulting from reflected, refracted and transmitted light patterns developed at the multiple interfaces between layers, Geopearl® C pearlescent pigments provide unsurpassed performance in brightness and colour play. Geopearl® C pearlescent pigments create an infinite range of visual effects that capture your eyes and give unrivaled elegance to cosmetic products.",
//           functionality_category_tree: [
//             ["Bulking Agents"],
//             ["Anti", "Caking Agents"],
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//             ["Slip Modifiers"],
//             ["Stabilizers", "Light Stabilizers"],
//             ["Sunscreen Agents"],
//           ],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Blue",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Blue is a pearlescent and iridescent pigment for color cosmetics and personal care products, and can be used to create lustrous or opalescent effects. This product uses thin, precisely controlled films of titanium dioxide on mica to separate white light into its component parts and produce dual colors, one by reflection one by transmission, that then appear as iridescence.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Pearl",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Pearl is a pearlescent and iridescent pigment for color cosmetics and personal care products, and can be used to create lustrous or opalescent effects. This product uses thin, precisely controlled films of titanium dioxide on mica to separate white light into its component parts and produce dual colors, one by reflection one by transmission, that then appear as iridescence.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Gold is a pearlescent and iridescent pigment for color cosmetics and personal care products, and can be used to create lustrous or opalescent effects. This product uses thin, precisely controlled films of titanium dioxide on mica to separate white light into its component parts and produce dual colors, one by reflection one by transmission, that then appear as iridescence.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Geopearl® C Sparkling Silver",
//           supplier_name: "Geotech International B.V.",
//           description:
//             "Geopearl® C Sparkling Silver is a silver/white natural mica based pearlescent pigment for cosmetic products. Resulting from reflected, refracted and transmitted light patterns developed at the multiple interfaces between layers, Geopearl® C pearlescent pigments provide unsurpassed performance in brightness and colour play. Geopearl® C pearlescent pigments create an infinite range of visual effects that capture your eyes and give unrivaled elegance to cosmetic products.",
//           functionality_category_tree: [
//             ["Bulking Agents"],
//             ["Anti", "Caking Agents"],
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//             ["Slip Modifiers"],
//             ["Stabilizers", "Light Stabilizers"],
//             ["Sunscreen Agents"],
//           ],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Green",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Green is a pearlescent and iridescent pigment for color cosmetics and personal care products, and can be used to create lustrous or opalescent effects. This product uses thin, precisely controlled films of titanium dioxide on mica to separate white light into its component parts and produce dual colors, one by reflection one by transmission, that then appear as iridescence.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Geopearl® C Silk Silver",
//           supplier_name: "Geotech International B.V.",
//           description:
//             "Geopearl® C Silk Silver is a silver/white natural mica based pearlescent pigment for cosmetic products. Resulting from reflected, refracted and transmitted light patterns developed at the multiple interfaces between layers, Geopearl® C pearlescent pigments provide unsurpassed performance in brightness and colour play. Geopearl® C pearlescent pigments create an infinite range of visual effects that capture your eyes and give unrivaled elegance to cosmetic products.",
//           functionality_category_tree: [
//             ["Bulking Agents"],
//             ["Anti", "Caking Agents"],
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//             ["Slip Modifiers"],
//             ["Stabilizers", "Light Stabilizers"],
//             ["Sunscreen Agents"],
//           ],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Orange",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Orange is a pearlescent and iridescent pigment for color cosmetics and personal care products, and can be used to create lustrous or opalescent effects. This product uses thin, precisely controlled films of titanium dioxide on mica to separate white light into its component parts and produce dual colors, one by reflection one by transmission, that then appear as iridescence.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Geopearl® C Twinkling Silver",
//           supplier_name: "Geotech International B.V.",
//           description:
//             "Geopearl® C Twinkling Silver is a silver/white natural mica-based pearlescent pigment for cosmetic products. Resulting from reflected, refracted and transmitted light patterns developed at the multiple interfaces between layers, Geopearl® C pearlescent pigments provide unsurpassed performance in brightness and colour play. Geopearl® C pearlescent pigments create an infinite range of visual effects that capture your eyes and give unrivaled elegance to cosmetic products.",
//           functionality_category_tree: [
//             ["Bulking Agents"],
//             ["Anti", "Caking Agents"],
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//             ["Slip Modifiers"],
//             ["Stabilizers", "Light Stabilizers"],
//             ["Sunscreen Agents"],
//           ],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Satina",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Satina is a pearlescent and iridescent pigment for color cosmetics and personal care products, and can be used to create lustrous or opalescent effects. This product uses thin, precisely controlled films of titanium dioxide on mica to separate white light into its component parts and produce dual colors, one by reflection one by transmission, that then appear as iridescence. Flamenco® Satina offers increased levels of luster, creating a smooth, silky effect while offering great coverage and superior whiteness.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Geopearl® C Soft Silver",
//           supplier_name: "Geotech International B.V.",
//           description:
//             "Geopearl® C Soft Silver is a silver/white natural mica based pearlescent pigment for cosmetic products. Resulting from reflected, refracted and transmitted light patterns developed at the multiple interfaces between layers, Geopearl® C pearlescent pigments provide unsurpassed performance in brightness and colour play. Geopearl® C pearlescent pigments create an infinite range of visual effects that capture your eyes and give unrivaled elegance to cosmetic products.",
//           functionality_category_tree: [
//             ["Bulking Agents"],
//             ["Anti", "Caking Agents"],
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//             ["Slip Modifiers"],
//             ["Stabilizers", "Light Stabilizers"],
//             ["Sunscreen Agents"],
//           ],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Geopearl® C Silver",
//           supplier_name: "Geotech International B.V.",
//           description:
//             "Geopearl® C Silver is an off-white free flowing powder with a pearly reflection. It consists of platelets of mica coated with titanium dioxide and iron oxide, and is ideal for use in the cosmetics industry. Geopearl® C pearlescent pigments disperse well without grinding. They can be added to the powder system while stirring after milling of the organic/inorganic pigments and before the binder is added.",
//           functionality_category_tree: [
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//             ["Stabilizers", "Light Stabilizers"],
//             ["Sunscreen Agents"],
//           ],
//           chemical_class_category_tree: [["Color Additives"], ["Inorganics"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Sparkle Red",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Sparkle Red is a large particle size effect pigment that adds shimmer and glitter to all types of cosmetics and personal care products. This dispersible powder retains high color intensity, making it ideal for formulations that call for complex color interplay and a glittery appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Red",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Red is a pearlescent and iridescent pigment for color cosmetics and personal care products, and can be used to create lustrous or opalescent effects. This product uses thin, precisely controlled films of titanium dioxide on mica to separate white light into its component parts and produce dual colors, one by reflection one by transmission, that then appear as iridescence.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Silk Orange",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Silk Orange has a fine particle size, and provides subtle luster for matte-type and low luster cosmetics and personal care formulations. It has the smallest particle size of any cosmetic grade interference colors, and provides excellent coverage and a fine, satin appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Summit Blue",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Summit Blue is an intermediate particle size interference effect pigment that features increased chromaticity at the reflection angle as well as high color purity and clarity. Flamenco® Summit Blue creates dramatic visual effects in all types of cosmetic and personal care products. This products possess attributes that create cleaner shades, more saturated color and stronger angle-dependent interference effects.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Summit Green",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Summit Green is an intermediate particle size interference effect pigment that features increased chromaticity at the reflection angle as well as high color purity and clarity. It creates dramatic visual effects in all types of cosmetic and personal care products. This products possess attributes that create cleaner shades, more saturated color and stronger angle-dependent interference effects.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Sparkle Violet",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Sparkle Violet is a large particle size effect pigment that adds shimmer and glitter to all types of cosmetics and personal care products. This dispersible powder retains high color intensity, making it ideal for formulations that call for complex color interplay and a glittery appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Sparkle Orange",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Sparkle Orange is a large particle size effect pigment that adds shimmer and glitter to all types of cosmetics and personal care products. This dispersible powder retains high color intensity, making it ideal for formulations that call for complex color interplay and a glittery appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Silk Violet",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Silk Violet has a fine particle size, and provides subtle luster for matte-type and low luster cosmetics and personal care formulations. It has the smallest particle size of any cosmetic grade interference colors, and provides excellent coverage and a fine, satin appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Sparkle Green",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Sparkle Green is a large particle size effect pigment that adds shimmer and glitter to all types of cosmetics and personal care products. This dispersible powder retains high color intensity, making it ideal for formulations that call for complex color interplay and a glittery appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Summit Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Summit Gold is an intermediate particle size interference effect pigment that features increased chromaticity at the reflection angle as well as high color purity and clarity. Flamenco® Summit Gold creates dramatic visual effects in all types of cosmetic and personal care products. This products possess attributes that create cleaner shades, more saturated color and stronger angle-dependent interference effects.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Sparkle Blue",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Sparkle Blue is a large particle size effect pigment that adds shimmer and glitter to all types of cosmetics and personal care products. This dispersible powder retains high color intensity, making it ideal for formulations that call for complex color interplay and a glittery appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Satin Pearl",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Satin Pearl is a pearlescent and iridescent pigment for color cosmetics and personal care products, and can be used to create lustrous or opalescent effects. This product uses thin, precisely controlled films of titanium dioxide on mica to separate white light into its component parts and produce dual colors, one by reflection one by transmission, that then appear as iridescence.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Sparkle Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Sparkle Gold is a large particle size effect pigment that adds shimmer and glitter to all types of cosmetics and personal care products. This dispersible powder retains high color intensity, making it ideal for formulations that call for complex color interplay and a glittery appearance.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Super Blue",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Super Blue is an intermediate particle size interference pigment that can be used alone or combined with other colorants to create novel effects in all types of cosmetics and personal care products. The effects possible with this pigment cannot be matched by conventional pigments and dyes.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Violet",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Violet is a pigment that uses thin, precisely controlled films of titanium dioxide on mica to separate white light into its component parts and produce dual colors, one by reflection one by transmission, that then appear as iridescence. It has a small particle size that produces more subtle luminous effects, including shimmer and sparkle.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Ultra Sparkle",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Ultra Sparkle is a white effect enhancing pigment of titanium dioxide-coated mica platelets. It is used to create lustrous or opalescent effects in all types of cosmetics and personal products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Super Violet",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Super Violet is an intermediate particle size interference pigment that can be used alone or combined with other colorants to create novel effects in all types of cosmetics and personal care products. The effects possible with this pigment cannot be matched by conventional pigments and dyes.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Velvet",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Velvet is a white effect enhancing pigment of titanium dioxide-coated mica platelets. It is used to create lustrous or opalescent effects in all types of cosmetics and personal products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Ultra Silk",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Ultra Silk is a white effect enhancing pigment of titanium dioxide-coated mica platelets. It is used to create lustrous or opalescent effects in all types of cosmetics and personal products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Super Pearl",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Super Pearl is a white effect enhancing pigment of titanium dioxide-coated mica platelets. It is used to create lustrous or opalescent effects in all types of cosmetics and personal products.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Summit Turquoise",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Summit Turquoise is an intermediate particle size interference effect pigment that features increased chromaticity at the reflection angle as well as high color purity and clarity. It creates dramatic visual effects in all types of cosmetic and personal care products. This products possess attributes that create cleaner shades, more saturated color and stronger angle-dependent interference effects.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Geopearl® C Blue",
//           supplier_name: "Geotech International B.V.",
//           description:
//             "Geopearl® C Blue is an off-white free flowing powder with a blue reflection. It consists of platelets of mica coated with titanium dioxide, and is ideal for use in the cosmetics industry. Geopearl® C pearlescent pigments disperse well without grinding. They can be added to the powder system while stirring after milling of the organic/inorganic pigments and before the binder is added.",
//           functionality_category_tree: [
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//             ["Stabilizers", "Light Stabilizers"],
//             ["Sunscreen Agents"],
//           ],
//           chemical_class_category_tree: [["Color Additives"], ["Inorganics"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Geopearl® C Glittering Silver",
//           supplier_name: "Geotech International B.V.",
//           description:
//             "Geopearl® C Glittering Silver is a silver/white natural mica based pearlescent pigment for cosmetic products. Resulting from reflected, refracted and transmitted light patterns developed at the multiple interfaces between layers, Geopearl® C pearlescent pigments provide unsurpassed performance in brightness and colour play. Geopearl® C pearlescent pigments create an infinite range of visual effects that capture your eyes and give unrivaled elegance to cosmetic products.",
//           functionality_category_tree: [
//             ["Bulking Agents"],
//             ["Anti", "Caking Agents"],
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//             ["Slip Modifiers"],
//             ["Stabilizers", "Light Stabilizers"],
//             ["Sunscreen Agents"],
//           ],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Super Gold",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Super Gold is an intermediate particle size interference pigment that can be used alone or combined with other colorants to create novel effects in all types of cosmetics and personal care products. The effects possible with this pigment cannot be matched by conventional pigments and dyes.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Geopearl® C Gold",
//           supplier_name: "Geotech International B.V.",
//           description:
//             "Geopearl® C Gold is an off-white free flowing powder with a gold reflection. It consists of platelets of mica coated with titanium dioxide, and is ideal for use in the cosmetics industry. Geopearl® C pearlescent pigments disperse well without grinding. They can be added to the powder system while stirring after milling of the organic/inorganic pigments and before the binder is added.",
//           functionality_category_tree: [
//             ["Colorants"],
//             ["Opacifying", "Pearlizing Agents"],
//             ["Stabilizers", "Light Stabilizers"],
//             ["Sunscreen Agents"],
//           ],
//           chemical_class_category_tree: [["Color Additives"], ["Inorganics"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Summit Red",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Summit Red is an intermediate particle size interference effect pigment that features increased chromaticity at the reflection angle as well as high color purity and clarity. It creates dramatic visual effects in all types of cosmetic and personal care products. This products possess attributes that create cleaner shades, more saturated color and stronger angle-dependent interference effects.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Flamenco® Super Red",
//           supplier_name: "Sun Chemical",
//           description:
//             "Flamenco® Super Red is an intermediate particle size interference pigment that can be used alone or combined with other colorants to create novel effects in all types of cosmetics and personal care products. The effects possible with this pigment cannot be matched by conventional pigments and dyes.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Color Additives"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "DP Silver White / M1041",
//           supplier_name: "Sandream Specialties",
//           description:
//             "DP Silver White / M1041 is a mica based pearl pigment with a low micron size. This silvery white powder forms an intense and lustrous pearl pigment that is very smooth and attractive and gives an ideal look to eye shadows.",
//           functionality_category_tree: [["Colorants"]],
//           chemical_class_category_tree: [["Mixtures"]],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cosmetica Velvet White N-8000F",
//           supplier_name: "DKSH",
//           description:
//             "Cosmetica Velvet White N-8000F is a natural mica based pearl pigment. It offers more whiteness and an excellent brilliant reflection and sparkling effect. It is care free from heavy metal regulation has high luster, excellent chroma and high transparency and purity. Cosmetica Velvet White N-8000F has cosmetic applications for lipstick eye shadow and blush, nail arts and bath and body products.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cosmetica Shimmering White N-8000E",
//           supplier_name: "DKSH",
//           description:
//             "Cosmetica Shimmering White N-8000E is a natural mica based pearl pigment. It offers more whiteness and an excellent brilliant reflection and sparkling effect. It is care free from heavy metal regulation has high luster, excellent chroma and high transparency and purity. Cosmetica Shimmering White N-8000E has cosmetic applications for lipstick eye shadow and blush, nail arts and bath and body products.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cosmetica Fine White N-8000D",
//           supplier_name: "DKSH",
//           description:
//             "Cosmetica Fine White N-8000D is a natural mica based pearl pigment. It offers more whiteness and an excellent brilliant reflection and sparkling effect. It is care free from heavy metal regulation has high luster, excellent chroma and high transparency and purity. Cosmetica Fine White N-8000D has cosmetic applications for lipstick eye shadow and blush, nail arts and bath and body products.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Colorona® Fine Gold MP-20",
//           supplier_name: "Merck KGaA",
//           description:
//             "Colorona® Fine Gold MP-20 is a pearlescent effect pigment with a satiny golden shine. It is applicable in all kinds of color and care cosmetics.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//         {
//           ingredient_name: "Cosmetica Super White N-8000S",
//           supplier_name: "DKSH",
//           description:
//             "Cosmetica Super White N-8000S is a natural mica based pearl pigment. It offers more whiteness and an excellent brilliant reflection and sparkling effect. It is care free from heavy metal regulation has high luster, excellent chroma and high transparency and purity. Cosmetica Super White N-8000S has cosmetic applications for lipstick eye shadow and blush, nail arts and bath and body products.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["titanium dioxide", "mica"],
//           matched_count: 2,
//           total_brand_inci: 2,
//         },
//       ],
//       count: 49,
//     },
//     {
//       inci_list: ["iron oxides"],
//       items: [
//         {
//           ingredient_name: "CreaYellow®",
//           supplier_name: "The Innovation Company®",
//           description:
//             "CreaYellow® incorporates iron oxides. It has a yellow, powder appearance and a characteristic odor that is suitable for use in many personal care applications.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides"],
//           matched_count: 1,
//           total_brand_inci: 1,
//         },
//         {
//           ingredient_name: "Creablack® Super",
//           supplier_name: "The Innovation Company®",
//           description:
//             "Creablack® Super incorporates iron oxides. It has a black, powder appearance with a characteristic odor that is suitable for use in many personal care applications.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides"],
//           matched_count: 1,
//           total_brand_inci: 1,
//         },
//         {
//           ingredient_name: "Creablack®",
//           supplier_name: "The Innovation Company®",
//           description:
//             "Creablack® incorporates iron oxides. It has a black, powder appearance with a characteristic odor that is suitable for use in many personal care applications.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["iron oxides"],
//           matched_count: 1,
//           total_brand_inci: 1,
//         },
//       ],
//       count: 3,
//     },
//     {
//       inci_list: ["titanium dioxide"],
//       items: [
//         {
//           ingredient_name: "CreaWhite® R",
//           supplier_name: "The Innovation Company®",
//           description:
//             "CreaWhite® R incorporates titanium dioxide. It has a white, powder appearance and a characteristic odor that is suitable for use in many personal care applications.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["titanium dioxide"],
//           matched_count: 1,
//           total_brand_inci: 1,
//         },
//       ],
//       count: 1,
//     },
//     {
//       inci_list: ["carmine"],
//       items: [
//         {
//           ingredient_name: "CreaCarmine® 9350",
//           supplier_name: "The Innovation Company®",
//           description:
//             "CreaCarmine® 9350 incorporates carmine. It has a red, powder appearance with a characteristic odor that is suitable for use in many personal care applications.",
//           functionality_category_tree: [],
//           chemical_class_category_tree: [],
//           match_score: 1,
//           matched_inci: ["carmine"],
//           matched_count: 1,
//           total_brand_inci: 1,
//         },
//       ],
//       count: 1,
//     },
//   ],
//   unmatched: [],
//   overall_confidence: 1,
//   processing_time: 7.91,
// };

async function fetchIngredientAnalysis(
  req: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  // simulate an API call (kept synchronous-fast for now)
  //   console.log("Analyze payload", req);
  // return Promise.resolve(MOCK_RESPONSE);
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
  const [activeTab, setActiveTab] = useState<"grouped" | "unmatched">(
    "grouped",
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
      setActiveTab("grouped");
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
              active={activeTab === "grouped"}
              onClick={() => setActiveTab("grouped")}
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-600 text-[11px] font-bold text-white">
                  ⓘ
                </span>
              }
              label={"Branded Ingredients"}
              count={resp.grouped?.length}
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

          {activeTab === "grouped" && (
            <div className="space-y-6">
              {resp.grouped?.map((m: GroupItem) => {
                return (
                  <div key={m.inci_list.join("-")}>
                    {/* {m.inci_list.join("-")} */}

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.inci_list?.map((i) => (
                        <Badge
                          variant={"outline"}
                          className="text-muted-foreground border-primary capitalize"
                          key={i}
                        >
                          {i}
                        </Badge>
                      ))}
                    </div>

                    <Accordion
                      type="single"
                      collapsible
                      className="mt-5 w-full rounded-2xl border px-5 py-2"
                      defaultValue="item-1"
                    >
                      {m.items.map((item) => (
                        <AccordionItem
                          value={item.ingredient_name}
                          key={item.ingredient_name}
                        >
                          <AccordionTrigger>
                            <div className="flex w-full justify-between">
                              <h3 className="truncate text-lg capitalize">
                                {item.ingredient_name}
                              </h3>
                              <div className="text-muted-foreground flex items-center gap-1">
                                <span className="!no-underline">
                                  {item.supplier_name}
                                </span>
                                <BuildingStorefrontIcon className="size-5 capitalize" />{" "}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="flex w-full flex-col gap-4 text-balance">
                            <p className="text-un w-full leading-6">
                              {item.description}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                );
              })}
            </div>
          )}

          {/* */}

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
