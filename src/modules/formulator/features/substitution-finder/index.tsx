import { useState } from "react";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { cn } from "@/core/utils";
import { Search, RefreshCw, ArrowLeft, Download, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const SubstitutionFinder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [substitutionReason, setSubstitutionReason] = useState("");
  const [productContext, setProductContext] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const popularIngredients = [
    { name: "Dimethicone", category: "Silicone", searches: 1240 },
    { name: "Phenoxyethanol", category: "Preservative", searches: 980 },
    { name: "Cetearyl Alcohol", category: "Emulsifier", searches: 856 },
    { name: "Tocopherol", category: "Antioxidant", searches: 743 },
    { name: "Carbomer", category: "Thickener", searches: 621 },
    { name: "PEG-100 Stearate", category: "Emulsifier", searches: 589 },
  ];

  const substitutionReasons = [
    { id: "cant_source", label: "Can't source locally", icon: "🚫", desc: "Not available from Indian suppliers" },
    { id: "too_expensive", label: "Too expensive", icon: "💰", desc: "Looking for budget-friendly alternatives" },
    { id: "natural", label: "Need natural alternative", icon: "🌿", desc: "Moving to clean/natural formulation" },
    { id: "client", label: "Client restriction", icon: "📋", desc: "Client wants specific free-from claims" },
    { id: "formulation", label: "Formulation issue", icon: "⚗️", desc: "Causing stability or texture problems" },
    { id: "other", label: "Other reason", icon: "❓", desc: "Different requirement" },
  ];

  const productContextOptions = [
    "Serum (water-based)",
    "Serum (oil-based)",
    "Cream (O/W)",
    "Cream (W/O)",
    "Lotion",
    "Gel",
    "Toner",
    "Cleanser (gel)",
    "Cleanser (cream)",
    "Sunscreen",
    "Hair Care",
    "Other",
  ];

  // Sample results for Dimethicone
  const substitutionResults = {
    ingredient: {
      name: "Dimethicone",
      inci: "Dimethicone",
      function: "Emollient, skin conditioning, slip agent",
      typicalUsage: "1-5%",
      costPerKg: 450,
    },
    substitutes: [
      {
        id: 1,
        name: "Isoamyl Laurate",
        inci: "Isoamyl Laurate",
        type: "Plant-derived ester",
        matchScore: 92,
        natural: true,
        costComparison: "similar",
        costPerKg: 520,
        usageRange: "1-5%",
        adjustmentNeeded: "Direct 1:1 replacement",
        pros: [
          "Excellent slip and spreadability",
          "Light, non-greasy feel",
          "Derived from coconut",
          "Good for natural claims"
        ],
        cons: [
          "Slightly higher cost",
          "May not provide same level of occlusion"
        ],
        bestFor: ["Serums", "Light creams", "Face oils"],
        supplierAvailability: "High",
      },
      {
        id: 2,
        name: "Coco-Caprylate/Caprate",
        inci: "Coco-Caprylate/Caprate",
        type: "Plant-derived ester",
        matchScore: 88,
        natural: true,
        costComparison: "similar",
        costPerKg: 480,
        usageRange: "2-8%",
        adjustmentNeeded: "May need 1.2-1.5x amount",
        pros: [
          "Excellent emolliency",
          "Silky skin feel",
          "Natural origin (coconut)",
          "Good spreading"
        ],
        cons: [
          "Slightly greasier feel",
          "May need higher percentage"
        ],
        bestFor: ["Creams", "Lotions", "Body care"],
        supplierAvailability: "High",
      },
      {
        id: 3,
        name: "Hemisqualane",
        inci: "C13-15 Alkane",
        type: "Plant-derived hydrocarbon",
        matchScore: 85,
        natural: true,
        costComparison: "expensive",
        costPerKg: 890,
        usageRange: "1-5%",
        adjustmentNeeded: "Direct 1:1 replacement",
        pros: [
          "Most similar silicone-like feel",
          "Lightweight, volatile",
          "Sustainable sugarcane source",
          "Excellent sensory"
        ],
        cons: [
          "Higher cost",
          "Limited suppliers in India"
        ],
        bestFor: ["Premium serums", "Makeup primers", "Hair serums"],
        supplierAvailability: "Medium",
      },
    ],
    tips: [
      { icon: "💡", text: "For serums, Isoamyl Laurate or Hemisqualane provide the closest silicone-like feel" },
      { icon: "💰", text: "For budget formulations, CCT is your best bet - just adjust texture with other ingredients" },
      { icon: "🏷️", text: "All these alternatives qualify for 'silicone-free' claims" },
      { icon: "⚠️", text: "Test stability - some natural alternatives may affect emulsion stability differently" },
    ]
  };

  const handleSearch = () => {
    if (!searchQuery) {
      toast.error("Please enter an ingredient name");
      return;
    }
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
      toast.success("Substitutes found! (Backend integration pending)");
    }, 2000);
  };

  const resetSearch = () => {
    setSearchQuery("");
    setSubstitutionReason("");
    setProductContext("");
    setShowResults(false);
  };

  const handleExport = () => {
    toast.info("Exporting results... (Backend integration pending)");
  };

  const handleSave = () => {
    toast.success("Saved to project! (Backend integration pending)");
  };

  // Results View
  if (showResults) {
    return (
      <PageContent
        header={{
          title: `Substitutes for ${substitutionResults.ingredient.name}`,
          description: `Found ${substitutionResults.substitutes.length} alternatives ranked by match score`,
          actions: (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save to Project
              </Button>
            </div>
          ),
        }}
      >
        <div className="space-y-6">
          <Button variant="ghost" onClick={resetSearch} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Search
          </Button>

          {/* Original Ingredient Info */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Original Ingredient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold">{substitutionResults.ingredient.name}</p>
                  <p className="text-muted-foreground font-mono text-sm mt-1">{substitutionResults.ingredient.inci}</p>
                </div>
                <div className="grid grid-cols-3 gap-8 text-right">
                  <div>
                    <p className="text-sm text-muted-foreground">Function</p>
                    <p className="font-medium">{substitutionResults.ingredient.function}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Typical Usage</p>
                    <p className="font-medium">{substitutionResults.ingredient.typicalUsage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-medium">₹{substitutionResults.ingredient.costPerKg}/kg</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Substitutes Grid */}
          <div className="space-y-4">
            {substitutionResults.substitutes.map((sub, index) => (
              <Card key={sub.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Rank Badge */}
                    <div className={cn(
                      "w-24 flex flex-col items-center justify-center p-4 rounded-lg",
                      index === 0 ? "bg-amber-500 text-white" :
                      index === 1 ? "bg-slate-400 text-white" :
                      index === 2 ? "bg-amber-600 text-white" :
                      "bg-muted"
                    )}>
                      <span className="text-3xl font-bold">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </span>
                      <div className={cn(
                        "mt-2 px-3 py-1 rounded-full text-sm font-bold",
                        index < 3 ? "bg-white/20" : "bg-background"
                      )}>
                        {sub.matchScore}%
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold">{sub.name}</h3>
                            {sub.natural && <Badge variant="secondary">Natural ✓</Badge>}
                            <Badge variant={
                              sub.costComparison === "cheaper" ? "default" :
                              sub.costComparison === "similar" ? "outline" : "secondary"
                            }>
                              {sub.costComparison === "cheaper" ? "💰 Cheaper" :
                               sub.costComparison === "similar" ? "≈ Similar cost" : "💎 Premium"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground font-mono text-sm">{sub.inci}</p>
                          <Badge variant="outline" className="mt-2">{sub.type}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Cost</p>
                          <p className="text-xl font-bold">₹{sub.costPerKg}/kg</p>
                          <p className="text-xs text-muted-foreground">Usage: {sub.usageRange}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pros */}
                        <div>
                          <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Advantages
                          </p>
                          <ul className="space-y-1">
                            {sub.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cons */}
                        <div>
                          <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            Considerations
                          </p>
                          <ul className="space-y-1">
                            {sub.cons.map((con, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Best For & Adjustment */}
                        <div>
                          <p className="text-sm font-semibold mb-2">Best For</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {sub.bestFor.map((use, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{use}</Badge>
                            ))}
                          </div>
                          <p className="text-sm font-semibold mb-1">Adjustment</p>
                          <p className="text-sm text-muted-foreground">{sub.adjustmentNeeded}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Supplier Availability:</span>
                          <Badge variant={
                            sub.supplierAvailability === "Very High" || sub.supplierAvailability === "High" ? "default" :
                            sub.supplierAvailability === "Medium" ? "outline" : "secondary"
                          }>
                            {sub.supplierAvailability}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Find Suppliers</Button>
                          <Button variant="secondary" size="sm">Add to Formula</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💡</span>
                Formulation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {substitutionResults.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                    <span className="text-xl">{tip.icon}</span>
                    <p className="text-sm">{tip.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    );
  }

  // Search View
  return (
    <PageContent
      header={{
        title: "Substitution Finder",
        description: "Find alternative ingredients for your formulations",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Search Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What ingredient do you want to replace?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search ingredient by name or INCI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 h-12 text-lg"
                />
              </div>

              {/* Quick Select */}
              <div>
                <Label className="mb-3 block">Or select from common searches:</Label>
                <div className="flex flex-wrap gap-2">
                  {popularIngredients.map((ing) => (
                    <Button
                      key={ing.name}
                      variant={searchQuery === ing.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSearchQuery(ing.name)}
                    >
                      {ing.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reason Selection */}
              <div>
                <Label className="mb-4 block">Why do you need a substitute?</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {substitutionReasons.map((reason) => (
                    <Button
                      key={reason.id}
                      variant={substitutionReason === reason.id ? "default" : "outline"}
                      className={cn(
                        "h-auto p-4 flex flex-col items-start",
                        substitutionReason === reason.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSubstitutionReason(reason.id)}
                    >
                      <span className="text-2xl mb-2">{reason.icon}</span>
                      <p className="font-medium">{reason.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{reason.desc}</p>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Product Context */}
              <div>
                <Label className="mb-4 block">What type of product? (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {productContextOptions.map((ctx) => (
                    <Button
                      key={ctx}
                      variant={productContext === ctx ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProductContext(ctx)}
                    >
                      {ctx}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleSearch}
                disabled={!searchQuery || isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding substitutes...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Substitutes
                    <Badge variant="secondary" className="ml-2">20◆</Badge>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💡</span>
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: 1, text: "Enter the ingredient you want to replace" },
                { step: 2, text: "Tell us why (helps narrow recommendations)" },
                { step: 3, text: "Optionally specify product type for context" },
                { step: 4, text: "Get ranked alternatives with usage guidance" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🕒</span>
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { ingredient: "Dimethicone", date: "2 hours ago", reason: "Natural alternative" },
                { ingredient: "Phenoxyethanol", date: "Yesterday", reason: "Client restriction" },
                { ingredient: "Carbomer 940", date: "3 days ago", reason: "Can't source" },
              ].map((search, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setSearchQuery(search.ingredient)}
                >
                  <div className="text-left">
                    <p className="font-medium">{search.ingredient}</p>
                    <p className="text-xs text-muted-foreground">{search.date} • {search.reason}</p>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Silicone Alternatives", count: 12 },
                { name: "Natural Preservatives", count: 8 },
                { name: "PEG-free Emulsifiers", count: 15 },
                { name: "Synthetic-free Actives", count: 23 },
              ].map((cat) => (
                <Button
                  key={cat.name}
                  variant="ghost"
                  className="w-full justify-between"
                >
                  <span className="font-medium">{cat.name}</span>
                  <Badge variant="secondary">{cat.count}</Badge>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContent>
  );
};

export default SubstitutionFinder;

