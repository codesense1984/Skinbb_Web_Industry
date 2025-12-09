import { useState, useEffect } from "react";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { cn } from "@/core/utils";
import { Sparkles, ArrowRight, ArrowLeft, Save, Wand2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { basePythonApiUrl } from "@/core/config/baseUrls";

// Types
interface WishData {
  productType: string;
  benefits: string[];
  exclusions: string[];
  heroIngredients: string[];
  costMin: string;
  costMax: string;
  texture: string;
  fragrance: string;
  notes: string;
  name: string;
}

interface ProductType {
  id: string;
  icon: string;
  label: string;
  desc: string;
}

interface BenefitCategory {
  name: string;
  icon: string;
  items: string[];
}

interface ExclusionCategory {
  name: string;
  icon: string;
  items: string[];
}

interface GeneratedFormula {
  name: string;
  version: string;
  cost: number;
  costTarget: { min: number; max: number };
  ph: { min: number; max: number };
  texture: string;
  shelfLife: string;
  phases: FormulaPhase[];
  insights: FormulaInsight[];
  warnings: FormulaWarning[];
  compliance: {
    silicone: boolean;
    paraben: boolean;
    vegan: boolean;
  };
}

interface FormulaPhase {
  id: string;
  name: string;
  temp: string;
  color: string;
  ingredients: FormulaIngredient[];
}

interface FormulaIngredient {
  name: string;
  inci: string;
  percent: number | string;
  cost: number;
  function: string;
  hero?: boolean;
}

interface FormulaInsight {
  icon: string;
  title: string;
  text: string;
}

interface FormulaWarning {
  type: "critical" | "info";
  text: string;
}

const CreateAWish = () => {
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [wishData, setWishData] = useState<WishData>({
    productType: "",
    benefits: [],
    exclusions: [],
    heroIngredients: [],
    costMin: "",
    costMax: "",
    texture: "",
    fragrance: "",
    notes: "",
    name: "",
  });
  const [heroInput, setHeroInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFormula, setGeneratedFormula] = useState<GeneratedFormula | null>(null);
  const [credits] = useState(247);

  useEffect(() => {
    setMounted(true);
  }, []);

  const productTypes: ProductType[] = [
    { id: "serum", icon: "💧", label: "Serum", desc: "Concentrated treatment" },
    { id: "cream", icon: "🧴", label: "Cream", desc: "Rich moisturizer" },
    { id: "lotion", icon: "🥛", label: "Lotion", desc: "Light moisturizer" },
    { id: "toner", icon: "💆", label: "Toner", desc: "Prep & hydrate" },
    { id: "cleanser", icon: "🧼", label: "Cleanser", desc: "Face wash" },
    { id: "mask", icon: "😷", label: "Face Mask", desc: "Treatment mask" },
    { id: "essence", icon: "✨", label: "Essence", desc: "Hydrating treatment" },
    { id: "oil", icon: "🫒", label: "Face Oil", desc: "Oil-based care" },
    { id: "mist", icon: "💨", label: "Face Mist", desc: "Spray treatment" },
  ];

  const benefitCategories: BenefitCategory[] = [
    {
      name: "Brightening & Tone",
      icon: "☀️",
      items: [
        "Brightening",
        "Even skin tone",
        "Dark spot fading",
        "Glow-enhancing",
        "Dullness relief",
        "Radiance boost",
      ],
    },
    {
      name: "Anti-aging",
      icon: "⏳",
      items: [
        "Anti-wrinkle",
        "Firming",
        "Elasticity boost",
        "Collagen support",
        "Fine line reduction",
        "Skin renewal",
      ],
    },
    {
      name: "Hydration",
      icon: "💧",
      items: [
        "Deep hydration",
        "Barrier repair",
        "Moisture lock",
        "Plumping",
        "Nourishing",
        "Dewy finish",
      ],
    },
    {
      name: "Problem Skin",
      icon: "🎯",
      items: [
        "Acne control",
        "Oil control",
        "Pore minimizing",
        "Blackhead removal",
        "Blemish treatment",
        "Mattifying",
      ],
    },
    {
      name: "Soothing",
      icon: "🌿",
      items: [
        "Calming",
        "Anti-redness",
        "Sensitive skin",
        "Anti-inflammatory",
        "Irritation relief",
        "Skin comfort",
      ],
    },
  ];

  const exclusionCategories: ExclusionCategory[] = [
    {
      name: "Common Free-From",
      icon: "🚫",
      items: [
        "Silicone-free",
        "Paraben-free",
        "Fragrance-free",
        "Sulfate-free",
        "Alcohol-free",
        "Essential oil-free",
      ],
    },
    {
      name: "Clean Beauty",
      icon: "🌱",
      items: [
        "PEG-free",
        "Mineral oil-free",
        "Petroleum-free",
        "Synthetic dye-free",
        "Phthalate-free",
        "Formaldehyde-free",
      ],
    },
    {
      name: "Lifestyle",
      icon: "💚",
      items: [
        "Vegan",
        "Cruelty-free",
        "Halal",
        "Natural-only",
        "Organic-certified",
        "Reef-safe",
      ],
    },
  ];

  const textures = [
    { id: "water", label: "Water-light", icon: "💧" },
    { id: "gel", label: "Gel", icon: "🫧" },
    { id: "serum", label: "Serum-like", icon: "✨" },
    { id: "lotion", label: "Lotion", icon: "🥛" },
    { id: "cream", label: "Cream", icon: "🧴" },
    { id: "balm", label: "Balm/Rich", icon: "🍯" },
  ];

  const fragranceOptions = [
    { id: "none", label: "Fragrance-free", icon: "🚫" },
    { id: "light", label: "Light/Subtle", icon: "🌸" },
    { id: "moderate", label: "Moderate", icon: "💐" },
    { id: "any", label: "Any/Flexible", icon: "✨" },
  ];

  const toggleSelection = (arr: string[], item: string, max?: number): string[] => {
    if (arr.includes(item)) {
      return arr.filter((i) => i !== item);
    }
    if (max && arr.length >= max) {
      return arr;
    }
    return [...arr, item];
  };

  const addHeroIngredient = () => {
    if (heroInput.trim() && !wishData.heroIngredients.includes(heroInput.trim())) {
      setWishData({
        ...wishData,
        heroIngredients: [...wishData.heroIngredients, heroInput.trim()],
      });
      setHeroInput("");
    }
  };

  const handleSaveWish = () => {
    toast.success("Wish saved! 5◆ used");
    // TODO: Implement save to backend
  };

  const handleDesignFormula = async () => {
    // Validate cost range if both are provided
    if (wishData.costMin && wishData.costMax) {
      const min = Number(wishData.costMin);
      const max = Number(wishData.costMax);
      if (min >= max) {
        toast.error('Maximum cost must be greater than minimum cost');
        return;
      }
      if (min < 0 || max < 0) {
        toast.error('Cost values must be positive');
        return;
      }
    }

    setIsGenerating(true);
    
    try {
      // Prepare request payload with proper validation
      const costMin = wishData.costMin && wishData.costMin.trim() !== '' 
        ? Number(wishData.costMin) 
        : undefined;
      const costMax = wishData.costMax && wishData.costMax.trim() !== '' 
        ? Number(wishData.costMax) 
        : undefined;

      // Call the actual API
      const response = await axios.post(
        `${basePythonApiUrl}/api/formula/generate`,
        {
          productType: wishData.productType,
          benefits: wishData.benefits,
          exclusions: wishData.exclusions,
          heroIngredients: wishData.heroIngredients,
          costMin: costMin,
          costMax: costMax,
          texture: wishData.texture || undefined,
          fragrance: wishData.fragrance || undefined,
          notes: wishData.notes || undefined,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minute timeout for formula generation
        }
      );

      const formulaData = response.data;
      
      // Validate response structure
      if (!formulaData || !formulaData.phases || !Array.isArray(formulaData.phases)) {
        throw new Error('Invalid response structure from server');
      }
      
      // Transform API response to match frontend format
      setGeneratedFormula({
        name: formulaData.name || `${wishData.productType} Formula`,
        version: formulaData.version || "v1",
        cost: formulaData.cost || 0,
        costTarget: formulaData.costTarget || { min: costMin || 30, max: costMax || 60 },
        ph: formulaData.ph || { min: 5.0, max: 6.5 },
        texture: formulaData.texture || "Custom texture",
        shelfLife: formulaData.shelfLife || "12 months",
        phases: formulaData.phases.map((phase: any) => ({
          id: phase.id || "A",
          name: phase.name || "Phase",
          temp: phase.temp || "room",
          color: phase.color || "from-slate-500 to-slate-600",
          ingredients: (phase.ingredients || []).map((ing: any) => ({
            name: ing.name || "Unknown",
            inci: ing.inci || ing.name || "Unknown",
            percent: ing.percent ?? 0,
            cost: ing.cost ?? 0,
            function: ing.function || "Other",
            hero: ing.hero || false,
          })),
        })),
        insights: formulaData.insights || [],
        warnings: formulaData.warnings || [],
        compliance: formulaData.compliance || {
          silicone: !wishData.exclusions.includes("Silicone-free"),
          paraben: !wishData.exclusions.includes("Paraben-free"),
          vegan: wishData.exclusions.includes("Vegan"),
        },
      });
      
      setIsGenerating(false);
      toast.success("Formula generated! 35◆ used");
    } catch (error: any) {
      console.error('Error generating formula:', error);
      setIsGenerating(false);
      
      // Provide specific error messages
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
        toast.error(`Failed to generate formula: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response
        toast.error('No response from server. Please check your connection and try again.');
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        toast.error('Request timed out. The formula generation is taking longer than expected. Please try again.');
      } else {
        // Other error
        toast.error('Failed to generate formula. Please try again.');
      }
    }
  };

  const resetWish = () => {
    setWishData({
      productType: "",
      benefits: [],
      exclusions: [],
      heroIngredients: [],
      costMin: "",
      costMax: "",
      texture: "",
      fragrance: "",
      notes: "",
      name: "",
    });
    setStep(1);
    setGeneratedFormula(null);
    setIsGenerating(false);
    setHeroInput("");
  };

  // Step Progress Component
  const StepProgress = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <button
            type="button"
            onClick={() => s < step && setStep(s)}
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all duration-500",
              s === step
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 scale-110"
                : s < step
                  ? "bg-teal-100 text-teal-600 cursor-pointer hover:bg-teal-200"
                  : "bg-slate-100 text-slate-400"
            )}
          >
            {s < step ? <Check className="w-5 h-5" /> : s}
          </button>
            {s < 4 && (
            <div
              className={cn(
                "w-12 h-1 rounded-full transition-all duration-500",
                s < step ? "bg-teal-400" : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  // If formula is generated, show results
  if (generatedFormula) {
    return (
      <PageContent>
        <div className="flex-1 p-8 overflow-auto">
          {/* Success Header */}
          <div
            className={cn(
              "mb-8 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25 animate-bounce">
                🪄
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-800">Formula Generated!</h1>
                  <Badge variant="outline" className="bg-teal-100 text-teal-700 border-teal-300">
                    35◆ used
                  </Badge>
                </div>
                <p className="text-slate-500">Based on your wish brief</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 mb-8">
            <Button variant="outlined" color="default">
              <span className="mr-2">📝</span>
              Edit Formula
            </Button>
            <Button variant="contained" color="success">
              <Save className="w-4 h-4 mr-2" />
              Save to Project
            </Button>
            <Button variant="outlined" color="default">
              <span className="mr-2">📤</span>
              Export PDF
            </Button>
            <Button variant="ghost" color="default" onClick={resetWish}>
              Start New Wish
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Estimated Cost",
                value: `₹${generatedFormula.cost}`,
                sub: "/100g",
                status: generatedFormula.cost <= generatedFormula.costTarget.max ? "success" : "warning",
                icon: "💰",
              },
              {
                label: "pH Target",
                value: `${generatedFormula.ph.min}-${generatedFormula.ph.max}`,
                sub: "optimal",
                status: "info",
                icon: "⚗️",
              },
              {
                label: "Texture",
                value: generatedFormula.texture,
                sub: "",
                status: "default",
                icon: "✨",
              },
              {
                label: "Shelf Life",
                value: generatedFormula.shelfLife,
                sub: "estimated",
                status: "default",
                icon: "📅",
              },
            ].map((stat, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  {stat.status === "success" && (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                      Within target ✓
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {stat.value}
                  <span className="text-sm font-normal text-slate-400">{stat.sub}</span>
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Formula Phases */}
          <Card className="overflow-hidden mb-6">
            <CardHeader className="border-b border-slate-100 flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  {generatedFormula.name}
                </CardTitle>
                <p className="text-slate-500">
                  {generatedFormula.version} •{" "}
                  {generatedFormula.phases.reduce((acc, p) => acc + p.ingredients.length, 0)}{" "}
                  ingredients
                </p>
              </div>
              <div className="flex items-center gap-2">
                {generatedFormula.compliance.vegan && (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    Vegan ✓
                  </Badge>
                )}
                {!generatedFormula.compliance.silicone && (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    Silicone-free ✓
                  </Badge>
                )}
                {!generatedFormula.compliance.paraben && (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    Paraben-free ✓
                  </Badge>
                )}
              </div>
            </CardHeader>
            {generatedFormula.phases.map((phase, pi) => (
              <div key={phase.id} className={pi > 0 ? "border-t border-slate-100" : ""}>
                <div
                  className={cn(
                    "px-6 py-4 bg-gradient-to-r bg-opacity-10",
                    phase.color.includes("blue")
                      ? "bg-blue-50"
                      : phase.color.includes("amber")
                        ? "bg-amber-50"
                        : phase.color.includes("green")
                          ? "bg-green-50"
                          : "bg-purple-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center text-white font-bold shadow-lg",
                        phase.color
                      )}
                    >
                      {phase.id}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{phase.name}</h3>
                      <p className="text-sm text-slate-500">Temperature: {phase.temp}</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-500 border-b border-slate-100">
                        <th className="px-6 py-3 font-medium">Ingredient</th>
                        <th className="px-6 py-3 font-medium">INCI Name</th>
                        <th className="px-6 py-3 font-medium">Function</th>
                        <th className="px-6 py-3 font-medium text-right">%</th>
                        <th className="px-6 py-3 font-medium text-right">Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phase.ingredients.map((ing, ii) => (
                        <tr
                          key={ii}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">{ing.name}</span>
                              {ing.hero && <span className="text-amber-500">⭐</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm font-mono">
                            {ing.inci}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="text-xs">
                              {ing.function}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            {typeof ing.percent === "number"
                              ? ing.percent.toFixed(2)
                              : ing.percent}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600">
                            {ing.cost.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {/* Total */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-t border-teal-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-800">Total</span>
                <div className="flex items-center gap-16 font-bold text-teal-800">
                  <span>100.00%</span>
                  <span>₹{generatedFormula.cost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Insights */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span> Why These Choices
              </h3>
              <div className="space-y-4">
                {generatedFormula.insights.map((insight, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xl">{insight.icon}</span>
                    <div>
                      <p className="font-medium text-slate-800">{insight.title}</p>
                      <p className="text-sm text-slate-500">{insight.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚠️</span> Important Notes
              </h3>
              <div className="space-y-3">
                {generatedFormula.warnings.map((warning, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-xl",
                      warning.type === "critical" ? "bg-red-100/50" : "bg-white/50"
                    )}
                  >
                    <span className={warning.type === "critical" ? "text-red-500" : "text-amber-500"}>
                      {warning.type === "critical" ? "🔴" : "ℹ️"}
                    </span>
                    <p
                      className={cn(
                        "text-sm",
                        warning.type === "critical"
                          ? "text-red-700 font-medium"
                          : "text-amber-700"
                      )}
                    >
                      {warning.text}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </PageContent>
    );
  }

  // Generating state
  if (isGenerating) {
    return (
      <PageContent>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl animate-pulse" />
              <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-4xl animate-bounce">🪄</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Designing Your Formula...</h2>
            <p className="text-slate-500 mb-6">
              Our AI is crafting the perfect formulation based on your wish
            </p>
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div
          className={cn(
            "mb-8 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-amber-500/25">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Create A Wish</h1>
              <p className="text-slate-500">Describe your dream product and let AI design the formula</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl">
          <Card className="p-8">
            <StepProgress />

            {/* Step 1: Product Type */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">What type of product?</h2>
                  <p className="text-slate-500">Select the product category you want to create</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {productTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setWishData({ ...wishData, productType: type.id })}
                      className={cn(
                        "p-6 rounded-2xl border-2 text-center transition-all duration-300 group",
                        wishData.productType === type.id
                          ? "border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-xl shadow-teal-500/10"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-lg bg-white"
                      )}
                    >
                      <div
                        className={cn(
                          "text-5xl mb-3 transition-transform duration-300",
                          wishData.productType === type.id ? "scale-110" : "group-hover:scale-110"
                        )}
                      >
                        {type.icon}
                      </div>
                      <p className="font-semibold text-slate-800 mb-1">{type.label}</p>
                      <p className="text-sm text-slate-500">{type.desc}</p>
                      {wishData.productType === type.id && (
                        <div className="mt-3 text-teal-600 font-medium text-sm flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!wishData.productType}
                    size="lg"
                    color="primary"
                  >
                    Next: Benefits
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Benefits */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">What should it do?</h2>
                  <p className="text-slate-500">
                    Select up to 5 benefits you want •{" "}
                    <span className="font-medium text-teal-600">
                      {wishData.benefits.length}/5 selected
                    </span>
                  </p>
                </div>
                <div className="space-y-6">
                  {benefitCategories.map((category) => (
                    <div key={category.name}>
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>{category.icon}</span> {category.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((benefit) => {
                          const isSelected = wishData.benefits.includes(benefit);
                          const isDisabled = !isSelected && wishData.benefits.length >= 5;
                          return (
                            <button
                              key={benefit}
                              type="button"
                              onClick={() =>
                                setWishData({
                                  ...wishData,
                                  benefits: toggleSelection(wishData.benefits, benefit, 5),
                                })
                              }
                              disabled={isDisabled}
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                                isSelected
                                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-105"
                                  : isDisabled
                                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md"
                              )}
                            >
                              {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                              {benefit}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" color="default" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={wishData.benefits.length === 0}
                    size="lg"
                    color="primary"
                  >
                    Next: Exclusions
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Exclusions */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    What should it NOT contain?
                  </h2>
                  <p className="text-slate-500">Select any ingredient exclusions (optional)</p>
                </div>
                <div className="space-y-6">
                  {exclusionCategories.map((category) => (
                    <div key={category.name}>
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>{category.icon}</span> {category.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((exclusion) => {
                          const isSelected = wishData.exclusions.includes(exclusion);
                          return (
                            <button
                              key={exclusion}
                              type="button"
                              onClick={() =>
                                setWishData({
                                  ...wishData,
                                  exclusions: toggleSelection(wishData.exclusions, exclusion),
                                })
                              }
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                                isSelected
                                  ? "bg-red-100 text-red-700 ring-2 ring-red-300 shadow-lg"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              )}
                            >
                              {isSelected ? <X className="w-4 h-4 inline mr-1" /> : ""}
                              {exclusion}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {wishData.exclusions.includes("Natural-only") && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-medium text-amber-800">Heads up!</p>
                      <p className="text-sm text-amber-700">
                        "Natural-only" significantly limits ingredient options and may affect product
                        efficacy. Consider "Naturally-derived" alternatives for better results.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" color="default" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} size="lg" color="primary">
                    Next: Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Final Details */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Final Details</h2>
                  <p className="text-slate-500">Add your preferences and any additional requirements</p>
                </div>

                {/* Hero Ingredients */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Hero Ingredients (optional)
                  </label>
                  <p className="text-sm text-slate-500">Add specific ingredients you want included</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="e.g., Vitamin C, Hyaluronic Acid..."
                      value={heroInput}
                      onChange={(e) => setHeroInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHeroIngredient())}
                      className="flex-1"
                    />
                    <Button variant="outlined" color="default" onClick={addHeroIngredient}>
                      + Add
                    </Button>
                  </div>
                  {wishData.heroIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {wishData.heroIngredients.map((ing) => (
                        <span
                          key={ing}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 rounded-xl text-sm font-medium"
                        >
                          ⭐ {ing}
                          <button
                            type="button"
                            onClick={() =>
                              setWishData({
                                ...wishData,
                                heroIngredients: wishData.heroIngredients.filter((i) => i !== ing),
                              })
                            }
                            className="hover:text-teal-900 text-lg leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cost Target */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Target Cost (per 100g)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center flex-1">
                      <span className="px-4 py-3 bg-slate-100 border-2 border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-medium">
                        ₹
                      </span>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={wishData.costMin}
                        onChange={(e) => setWishData({ ...wishData, costMin: e.target.value })}
                        className="flex-1 rounded-l-none"
                      />
                    </div>
                    <span className="text-slate-400 font-medium">to</span>
                    <div className="flex items-center flex-1">
                      <span className="px-4 py-3 bg-slate-100 border-2 border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-medium">
                        ₹
                      </span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={wishData.costMax}
                        onChange={(e) => setWishData({ ...wishData, costMax: e.target.value })}
                        className="flex-1 rounded-l-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded">💡 Budget: ₹20-40</span>
                    <span className="px-2 py-1 bg-slate-100 rounded">Mid-range: ₹40-80</span>
                    <span className="px-2 py-1 bg-slate-100 rounded">Premium: ₹80-150+</span>
                  </div>
                </div>

                {/* Texture */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Texture Preference</label>
                  <div className="grid grid-cols-6 gap-3">
                    {textures.map((tex) => (
                      <button
                        key={tex.id}
                        type="button"
                        onClick={() => setWishData({ ...wishData, texture: tex.id })}
                        className={cn(
                          "p-4 rounded-xl text-center transition-all duration-300",
                          wishData.texture === tex.id
                            ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        <span className="text-2xl block mb-1">{tex.icon}</span>
                        <span className="text-xs font-medium">{tex.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fragrance */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Fragrance Preference
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {fragranceOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setWishData({ ...wishData, fragrance: opt.id })}
                        className={cn(
                          "p-4 rounded-xl text-center transition-all duration-300",
                          wishData.fragrance === opt.id
                            ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        <span className="text-2xl block mb-1">{opt.icon}</span>
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Additional Notes</label>
                  <Textarea
                    placeholder="Any other requirements, inspirations, or context..."
                    value={wishData.notes}
                    onChange={(e) => setWishData({ ...wishData, notes: e.target.value })}
                    rows={3}
                    className="w-full"
                  />
                </div>

                {/* Summary */}
                <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span>📋</span> Your Wish Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Product Type</p>
                      <p className="font-medium text-slate-800">
                        {productTypes.find((t) => t.id === wishData.productType)?.label || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Benefits ({wishData.benefits.length})</p>
                      <p className="font-medium text-slate-800">
                        {wishData.benefits.slice(0, 3).join(", ")}
                        {wishData.benefits.length > 3 ? "..." : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Exclusions ({wishData.exclusions.length})</p>
                      <p className="font-medium text-slate-800">
                        {wishData.exclusions.slice(0, 2).join(", ") || "None"}
                        {wishData.exclusions.length > 2 ? "..." : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Cost Target</p>
                      <p className="font-medium text-slate-800">
                        {wishData.costMin && wishData.costMax
                          ? `₹${wishData.costMin} - ₹${wishData.costMax}/100g`
                          : "Flexible"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" color="default" onClick={() => setStep(3)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outlined" color="default" onClick={handleSaveWish}>
                      <Save className="w-4 h-4 mr-2" />
                      Save as Brief
                      <Badge variant="outline" className="ml-2 bg-slate-100 text-slate-600">
                        5◆
                      </Badge>
                    </Button>
                    <Button onClick={handleDesignFormula} size="lg" color="primary">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Design Formula
                      <Badge variant="outline" className="ml-2 bg-teal-100 text-teal-700 border-teal-300">
                        35◆
                      </Badge>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContent>
  );
};

export default CreateAWish;

