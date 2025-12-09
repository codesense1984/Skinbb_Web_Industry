import { useState } from "react";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { cn } from "@/core/utils";
import { Calculator, TrendingUp, DollarSign, Package, FileText, Download, Save, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { basePythonApiUrl } from "@/core/config/baseUrls";
import { IngredientAutocomplete } from "../../components/IngredientAutocomplete";

// Types
interface Ingredient {
  id: string;
  name: string;
  inci: string;
  percent: number;
  costPerKg: number;
  function?: string;
  isHero?: boolean;
}

interface Phase {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

interface CostAnalysisResult {
  formula_name?: string;
  batch_size: number;
  unit_size: number;
  batch_grams: number;
  phases: Array<{
    id: string;
    name: string;
    total_cost: number;
    total_percent: number;
    ingredients: Array<{
      id: string;
      name: string;
      inci: string;
      percent: number;
      cost_per_kg: number;
      grams_needed: number;
      cost_for_batch: number;
      cost_per_unit: number;
      function?: string;
      is_hero?: boolean;
      contribution_percent: number;
    }>;
  }>;
  all_ingredients: Array<{
    id: string;
    name: string;
    inci: string;
    percent: number;
    cost_per_kg: number;
    grams_needed: number;
    cost_for_batch: number;
    cost_per_unit: number;
    function?: string;
    is_hero?: boolean;
    contribution_percent: number;
  }>;
  raw_material_cost: number;
  raw_material_cost_per_unit: number;
  packaging_cost_total: number;
  labeling_cost_total: number;
  manufacturing_cost: number;
  total_batch_cost: number;
  cost_per_unit: number;
  total_percentage: number;
  top_cost_contributors: Array<any>;
  cost_by_category: Record<string, number>;
}

const CostCalculator = () => {
  // Input state
  const [formulaName, setFormulaName] = useState("");
  const [batchSize, setBatchSize] = useState(1000);
  const [unitSize, setUnitSize] = useState(30);
  const [packagingCost, setPackagingCost] = useState(18);
  const [labelingCost, setLabelingCost] = useState(3);
  const [manufacturingOverhead, setManufacturingOverhead] = useState(15);
  
  // Phases and ingredients
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: "A",
      name: "Water Phase",
      ingredients: []
    }
  ]);
  
  // Results state
  const [isCalculated, setIsCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("analysis");

  // Add new phase
  const addPhase = () => {
    const phaseIds = phases.map(p => p.id);
    const nextId = String.fromCharCode(Math.max(...phaseIds.map(id => id.charCodeAt(0))) + 1);
    setPhases([...phases, { id: nextId, name: "", ingredients: [] }]);
  };

  // Remove phase
  const removePhase = (phaseId: string) => {
    if (phases.length > 1) {
      setPhases(phases.filter(p => p.id !== phaseId));
    }
  };

  // Update phase name
  const updatePhaseName = (phaseId: string, name: string) => {
    setPhases(phases.map(p => p.id === phaseId ? { ...p, name } : p));
  };

  // Add ingredient to phase
  const addIngredient = (phaseId: string) => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: "",
      inci: "",
      percent: 0,
      costPerKg: 0,
      function: "",
      isHero: false
    };
    setPhases(phases.map(p => 
      p.id === phaseId 
        ? { ...p, ingredients: [...p.ingredients, newIngredient] }
        : p
    ));
  };

  // Remove ingredient
  const removeIngredient = (phaseId: string, ingredientId: string) => {
    setPhases(phases.map(p => 
      p.id === phaseId 
        ? { ...p, ingredients: p.ingredients.filter(ing => ing.id !== ingredientId) }
        : p
    ));
  };

  // Update ingredient
  const updateIngredient = (phaseId: string, ingredientId: string, field: keyof Ingredient, value: any) => {
    setPhases(phases.map(p => 
      p.id === phaseId 
        ? { 
            ...p, 
            ingredients: p.ingredients.map(ing => 
              ing.id === ingredientId ? { ...ing, [field]: value } : ing
            )
          }
        : p
    ));
  };

  // Handle ingredient selection from autocomplete
  const handleIngredientSelect = async (
    phaseId: string, 
    ingredientId: string, 
    ingredient: { id: string; name: string; inci: string; category?: string; cost_per_kg?: number }
  ) => {
    // Use data from autocomplete first (it's already fetched)
    if (ingredient.inci && ingredient.cost_per_kg) {
      setPhases(phases.map(p => 
        p.id === phaseId 
          ? { 
              ...p, 
              ingredients: p.ingredients.map(ing => 
                ing.id === ingredientId 
                  ? { 
                      ...ing, 
                      name: ingredient.name,
                      inci: ingredient.inci,
                      costPerKg: ingredient.cost_per_kg || 0,
                      function: ingredient.category || "Other"
                    } 
                  : ing
              )
            }
          : p
      ));
      
      toast.success(`✓ Auto-filled: INCI: ${ingredient.inci}, Cost: ₹${ingredient.cost_per_kg?.toLocaleString()}/kg`);
      return;
    }
    
    // If autocomplete data incomplete, fetch full details
    try {
      const response = await axios.get(
        `${basePythonApiUrl}/api/ingredients/by-name/${encodeURIComponent(ingredient.name)}`,
        { timeout: 10000 }
      );
      
      if (response.data.found) {
        const data = response.data;
        setPhases(phases.map(p => 
          p.id === phaseId 
            ? { 
                ...p, 
                ingredients: p.ingredients.map(ing => 
                  ing.id === ingredientId 
                    ? { 
                        ...ing, 
                        name: data.name,
                        inci: data.inci || "",
                        costPerKg: data.cost_per_kg || 0,
                        function: data.function || data.category || "Other"
                      } 
                    : ing
                )
              }
            : p
        ));
        
        if (data.inci) {
          toast.success(`✓ Auto-filled: INCI: ${data.inci}, Cost: ₹${data.cost_per_kg?.toLocaleString()}/kg`);
        } else {
          toast.warning("⚠️ INCI not found in database. Please enter manually.");
        }
      } else {
        // Fallback to autocomplete data
        setPhases(phases.map(p => 
          p.id === phaseId 
            ? { 
                ...p, 
                ingredients: p.ingredients.map(ing => 
                  ing.id === ingredientId 
                    ? { 
                        ...ing, 
                        name: ingredient.name,
                        inci: ingredient.inci || "",
                        costPerKg: ingredient.cost_per_kg || 0,
                        function: ingredient.category || "Other"
                      } 
                    : ing
                )
              }
            : p
        ));
        
        if (!ingredient.inci) {
          toast.warning("⚠️ INCI not found. Please enter manually.");
        }
      }
    } catch (error: any) {
      console.error("Error fetching ingredient details:", error);
      // Fallback to autocomplete data
      setPhases(phases.map(p => 
        p.id === phaseId 
          ? { 
              ...p, 
              ingredients: p.ingredients.map(ing => 
                ing.id === ingredientId 
                  ? { 
                      ...ing, 
                      name: ingredient.name,
                      inci: ingredient.inci || "",
                      costPerKg: ingredient.cost_per_kg || 0,
                      function: ingredient.category || "Other"
                    } 
                  : ing
              )
            }
          : p
      ));
      
      if (!ingredient.inci) {
        toast.error("❌ Could not fetch ingredient details. Please enter INCI and cost manually.");
      } else {
        toast.warning("⚠️ Using cached data. Please verify INCI and cost.");
      }
    }
  };

  // Calculate costs
  const handleCalculate = async () => {
    // Validate inputs
    if (phases.length === 0) {
      toast.error("Please add at least one phase");
      return;
    }

    const allIngredients = phases.flatMap(p => p.ingredients);
    if (allIngredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    // Check if all required fields are filled
    for (const phase of phases) {
      if (!phase.name.trim()) {
        toast.error(`Please enter a name for phase ${phase.id}`);
        return;
      }
      for (const ing of phase.ingredients) {
        if (!ing.name.trim() || !ing.inci.trim()) {
          toast.error("Please fill in all ingredient names and INCI names");
          return;
        }
        if (ing.percent <= 0) {
          toast.error("Please enter valid percentages (greater than 0)");
          return;
        }
        // Cost will be auto-filled, but check if it's 0 (might not have been looked up)
        if (ing.costPerKg <= 0) {
          toast.warning(`Cost not found for ${ing.inci}. Using default value.`);
        }
      }
    }

    setIsCalculating(true);
    
    try {
      // Prepare request data
      const requestData = {
        batch_settings: {
          batch_size: batchSize,
          unit_size: unitSize,
          packaging_cost_per_unit: packagingCost,
          labeling_cost_per_unit: labelingCost,
          manufacturing_overhead_percent: manufacturingOverhead
        },
        phases: phases.map(phase => ({
          id: phase.id,
          name: phase.name,
          ingredients: phase.ingredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            inci: ing.inci,
            percent: ing.percent,
            cost_per_kg: ing.costPerKg,
            function: ing.function || "",
            phase_id: phase.id,
            is_hero: ing.isHero || false
          }))
        })),
        formula_name: formulaName || undefined
      };

      // Call backend API
      const response = await axios.post(
        `${basePythonApiUrl}/api/cost-calculator/analyze`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setCostAnalysis(response.data);
      setIsCalculated(true);
      setActiveTab("analysis");
      toast.success("Cost analysis calculated successfully!");
    } catch (error: any) {
      console.error("Error calculating cost:", error);
      toast.error(error.response?.data?.detail || "Failed to calculate cost. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Reset to input form
  const handleReset = () => {
    setIsCalculated(false);
    setCostAnalysis(null);
    setActiveTab("analysis");
  };

  // If not calculated, show input form
  if (!isCalculated) {
    return (
      <PageContent
        header={{
          title: "Cost Calculator",
          description: "Enter batch settings and formulation details to calculate costs",
        }}
      >
        <div className="space-y-6">
          {/* Formula Name */}
          <Card>
            <CardHeader>
              <CardTitle>Formula Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="formula-name">Formula Name (Optional)</Label>
                <Input
                  id="formula-name"
                  placeholder="e.g., Brightening Vitamin C Gel Serum"
                  value={formulaName}
                  onChange={(e) => setFormulaName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Batch Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size (units)</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-size">Unit Size (ml/g)</Label>
                  <Input
                    id="unit-size"
                    type="number"
                    value={unitSize}
                    onChange={(e) => setUnitSize(parseFloat(e.target.value) || 1)}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packaging">Packaging (₹/unit)</Label>
                  <Input
                    id="packaging"
                    type="number"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labeling">Labeling (₹/unit)</Label>
                  <Input
                    id="labeling"
                    type="number"
                    value={labelingCost}
                    onChange={(e) => setLabelingCost(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overhead">Mfg Overhead (%)</Label>
                  <Input
                    id="overhead"
                    type="number"
                    value={manufacturingOverhead}
                    onChange={(e) => setManufacturingOverhead(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phases and Ingredients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Formulation Phases</CardTitle>
                <Button variant="outline" size="sm" onClick={addPhase}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Phase
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {phases.map((phase, phaseIdx) => (
                <div key={phase.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="font-bold w-12 text-center">{phase.id}</Badge>
                    <Input
                      placeholder="Phase name (e.g., Water Phase)"
                      value={phase.name}
                      onChange={(e) => updatePhaseName(phase.id, e.target.value)}
                      className="flex-1"
                    />
                    {phases.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhase(phase.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Ingredients</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addIngredient(phase.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Ingredient
                      </Button>
                    </div>

                    {phase.ingredients.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No ingredients added. Click "Add Ingredient" to add one.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {phase.ingredients.map((ingredient) => (
                          <div key={ingredient.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-md bg-muted/30">
                            <div className="col-span-5">
                              <IngredientAutocomplete
                                label="Ingredient Name"
                                value={ingredient.name}
                                onChange={(value) => updateIngredient(phase.id, ingredient.id, "name", value)}
                                onSelect={(selected) => handleIngredientSelect(phase.id, ingredient.id, selected)}
                                placeholder="Type to search branded ingredients..."
                              />
                            </div>
                            <div className="col-span-3">
                              <Label className="text-xs">INCI Name</Label>
                              <Input
                                placeholder={ingredient.inci ? ingredient.inci : "Enter manually if not auto-filled"}
                                value={ingredient.inci}
                                onChange={(e) => updateIngredient(phase.id, ingredient.id, "inci", e.target.value)}
                                className={!ingredient.inci ? "border-amber-300" : ""}
                              />
                              {!ingredient.inci && ingredient.name && (
                                <p className="text-xs text-amber-600 mt-1">⚠️ Please enter INCI manually</p>
                              )}
                            </div>
                            <div className="col-span-3">
                              <Label className="text-xs">Percentage (%)</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={ingredient.percent || ""}
                                onChange={(e) => updateIngredient(phase.id, ingredient.id, "percent", parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                step="0.01"
                              />
                            </div>
                            <div className="col-span-1 flex items-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIngredient(phase.id, ingredient.id)}
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                            {/* Show auto-filled values (read-only) */}
                            {(ingredient.costPerKg > 0 || ingredient.function) && (
                              <div className="col-span-12 text-xs text-muted-foreground mt-1 flex gap-4">
                                {ingredient.costPerKg > 0 && (
                                  <span>Cost: ₹{ingredient.costPerKg.toLocaleString()}/kg</span>
                                )}
                                {ingredient.function && (
                                  <span>Function: {ingredient.function}</span>
                                )}
                                {ingredient.inci && (
                                  <span className="text-green-600">✓ INCI: {ingredient.inci}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Calculate Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setPhases([{ id: "A", name: "Water Phase", ingredients: [] }]);
                setFormulaName("");
              }}
            >
              Reset
            </Button>
            <Button
              onClick={handleCalculate}
              disabled={isCalculating}
              size="lg"
              className="min-w-[150px]"
            >
              {isCalculating ? (
                <>
                  <Calculator className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </>
              )}
            </Button>
          </div>
        </div>
      </PageContent>
    );
  }

  // Show results after calculation
  if (!costAnalysis) return null;

  const batchGrams = costAnalysis.batch_grams;
  const allIngredients = costAnalysis.all_ingredients;
  const topContributors = costAnalysis.top_cost_contributors.slice(0, 5);

  // Pricing scenarios
  const pricingScenarios = [
    { multiplier: 2.0, label: "2x", mrp: (costAnalysis.cost_per_unit * 2).toFixed(0), profit: (costAnalysis.cost_per_unit * 2 - costAnalysis.cost_per_unit).toFixed(2), margin: 50 },
    { multiplier: 2.5, label: "2.5x", mrp: (costAnalysis.cost_per_unit * 2.5).toFixed(0), profit: (costAnalysis.cost_per_unit * 2.5 - costAnalysis.cost_per_unit).toFixed(2), margin: 60 },
    { multiplier: 3.0, label: "3x", mrp: (costAnalysis.cost_per_unit * 3).toFixed(0), profit: (costAnalysis.cost_per_unit * 3 - costAnalysis.cost_per_unit).toFixed(2), margin: 67 },
    { multiplier: 4.0, label: "4x", mrp: (costAnalysis.cost_per_unit * 4).toFixed(0), profit: (costAnalysis.cost_per_unit * 4 - costAnalysis.cost_per_unit).toFixed(2), margin: 75 },
  ];

  const handleExport = (format: "pdf" | "excel") => {
    toast.info(`Exporting to ${format.toUpperCase()}... (Backend integration pending)`);
  };

  const handleSave = () => {
    toast.success("Analysis saved! (Backend integration pending)");
  };

  return (
    <PageContent
      header={{
        title: "Cost Calculator",
        description: `Detailed cost analysis for ${costAnalysis.formula_name || "Formula"}`,
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <X className="w-4 h-4 mr-2" />
              Edit Input
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
              <FileText className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
          </div>
        ),
      }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="analysis">
            <TrendingUp className="w-4 h-4 mr-2" />
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger value="optimize">
            <Calculator className="w-4 h-4 mr-2" />
            Optimize
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="export">
            <Package className="w-4 h-4 mr-2" />
            Cost Sheet
          </TabsTrigger>
        </TabsList>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cost Per Unit</p>
                    <p className="text-3xl font-bold text-primary">₹{costAnalysis.cost_per_unit.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">for {costAnalysis.unit_size}ml</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Raw Materials</p>
                    <p className="text-3xl font-bold">₹{costAnalysis.raw_material_cost_per_unit.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{((costAnalysis.raw_material_cost_per_unit / costAnalysis.cost_per_unit) * 100).toFixed(0)}% of total</p>
                  </div>
                  <Package className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Batch Cost</p>
                    <p className="text-3xl font-bold">₹{costAnalysis.total_batch_cost.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{costAnalysis.batch_size} units</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ingredients</p>
                    <p className="text-3xl font-bold">{allIngredients.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">{costAnalysis.phases.length} phases</p>
                  </div>
                  <FileText className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batch Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Batch Size (units)</Label>
                  <Input value={costAnalysis.batch_size} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Unit Size (ml/g)</Label>
                  <Input value={costAnalysis.unit_size} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Packaging (₹/unit)</Label>
                  <Input value={packagingCost} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Labeling (₹/unit)</Label>
                  <Input value={labelingCost} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Mfg Overhead (%)</Label>
                  <Input value={manufacturingOverhead} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ingredient Costs Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Ingredient Cost Breakdown</CardTitle>
                    <Badge>{batchGrams.toLocaleString()}g batch</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costAnalysis.phases.map((phase) => (
                      <div key={phase.id}>
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="font-bold">{phase.id}</Badge>
                          <span className="font-medium">{phase.name}</span>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ingredient</TableHead>
                              <TableHead className="text-right">%</TableHead>
                              <TableHead className="text-right">Grams</TableHead>
                              <TableHead className="text-right">₹/kg</TableHead>
                              <TableHead className="text-right">Cost (₹)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {phase.ingredients.map((ing) => (
                              <TableRow key={ing.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{ing.name}</span>
                                    {ing.is_hero && <Badge variant="secondary" className="text-xs">⭐</Badge>}
                                    {topContributors.some(t => t.id === ing.id) && (
                                      <Badge variant="outline" className="text-xs">Top cost</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{ing.percent.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{ing.grams_needed.toLocaleString()}</TableCell>
                                <TableCell className="text-right">₹{ing.cost_per_kg.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-semibold">₹{ing.cost_for_batch.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Raw Materials Subtotal</span>
                      <span className="font-bold">₹{costAnalysis.raw_material_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Packaging ({costAnalysis.batch_size} × ₹{packagingCost})</span>
                      <span className="font-bold">₹{costAnalysis.packaging_cost_total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Labeling ({costAnalysis.batch_size} × ₹{labelingCost})</span>
                      <span className="font-bold">₹{costAnalysis.labeling_cost_total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Manufacturing ({manufacturingOverhead}%)</span>
                      <span className="font-bold">₹{costAnalysis.manufacturing_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold text-lg">TOTAL BATCH COST</span>
                      <span className="font-bold text-lg text-primary">₹{costAnalysis.total_batch_cost.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Cost Per Unit Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Per Unit ({costAnalysis.unit_size}ml)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Raw materials</span>
                    <span className="font-medium">₹{costAnalysis.raw_material_cost_per_unit.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Packaging</span>
                    <span className="font-medium">₹{packagingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Labeling</span>
                    <span className="font-medium">₹{labelingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Manufacturing</span>
                    <span className="font-medium">₹{(costAnalysis.manufacturing_cost / costAnalysis.batch_size).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-xl text-primary">₹{costAnalysis.cost_per_unit.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Top Cost Ingredients */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Cost Drivers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topContributors.slice(0, 4).map((ing, i) => (
                    <div key={ing.id} className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                        i === 0 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ing.name}</p>
                        <p className="text-xs text-muted-foreground">{ing.percent}% @ ₹{ing.cost_per_kg}/kg</p>
                      </div>
                      <span className="font-bold">₹{ing.cost_for_batch.toFixed(0)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Optimize Tab */}
        <TabsContent value="optimize" className="space-y-6">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💡</span>
                Cost Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use linear programming to optimize formulation cost while maintaining quality.
              </p>
              <Button onClick={() => toast.info("Optimization feature coming soon!")}>
                <Calculator className="w-4 h-4 mr-2" />
                Optimize Cost
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {pricingScenarios.map((scenario) => (
              <Card key={scenario.label} className="text-center">
                <CardContent className="pt-6">
                  <Badge variant="outline" className="mb-3">{scenario.label} Markup</Badge>
                  <p className="text-4xl font-bold mb-1">₹{scenario.mrp}</p>
                  <p className="text-sm text-muted-foreground mb-3">Suggested MRP</p>
                  <div className="pt-3 border-t space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Profit</span>
                      <span className="font-medium text-primary">₹{scenario.profit}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Margin</span>
                      <span className="font-medium">{scenario.margin}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Export cost sheet for sharing with clients or suppliers.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleExport("pdf")}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={() => handleExport("excel")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContent>
  );
};

export default CostCalculator;
