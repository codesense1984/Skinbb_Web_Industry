import { useState } from "react";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { Card } from "@/core/components/ui/card";
import { cn } from "@/core/utils";

// Sample formulation data
const formulationData = {
  name: "Brightening Vitamin C Serum",
  category: "Face Serum",
  batchSize: 1000,
  unit: "g",
  createdDate: "2024-11-20",
  version: "1.2",
  ingredients: [
    // Water Phase
    {
      id: 1,
      inci: "Aqua",
      tradeName: "Purified Water",
      cas: "7732-18-5",
      percentage: 72.85,
      phase: "Water Phase",
      function: "Solvent",
      supplier: "Local Water Treatment",
      pricePerKg: 2,
      compliance: "pass",
      restricted: false,
    },
    {
      id: 2,
      inci: "Sodium Hyaluronate",
      tradeName: "HA-LMW",
      cas: "9067-32-7",
      percentage: 1.0,
      phase: "Water Phase",
      function: "Humectant",
      supplier: "Bloomage Biotech",
      pricePerKg: 12500,
      compliance: "pass",
      restricted: false,
    },
    {
      id: 3,
      inci: "Glycerin",
      tradeName: "Glycerin USP",
      cas: "56-81-5",
      percentage: 5.0,
      phase: "Water Phase",
      function: "Humectant",
      supplier: "Godrej Industries",
      pricePerKg: 180,
      compliance: "pass",
      restricted: false,
    },
    {
      id: 4,
      inci: "Propanediol",
      tradeName: "Zemea Propanediol",
      cas: "504-63-2",
      percentage: 3.0,
      phase: "Water Phase",
      function: "Solvent/Humectant",
      supplier: "DuPont",
      pricePerKg: 420,
      compliance: "pass",
      restricted: false,
    },
    // Oil Phase
    {
      id: 5,
      inci: "Caprylic/Capric Triglyceride",
      tradeName: "MCT Oil",
      cas: "73398-61-5",
      percentage: 5.0,
      phase: "Oil Phase",
      function: "Emollient",
      supplier: "IOI Oleo",
      pricePerKg: 280,
      compliance: "pass",
      restricted: false,
    },
    {
      id: 6,
      inci: "Cetearyl Alcohol",
      tradeName: "Lanette O",
      cas: "67762-27-0",
      percentage: 2.0,
      phase: "Oil Phase",
      function: "Emulsifier/Thickener",
      supplier: "BASF",
      pricePerKg: 320,
      compliance: "pass",
      restricted: false,
    },
    {
      id: 7,
      inci: "Ceteareth-20",
      tradeName: "Eumulgin B2",
      cas: "68439-49-6",
      percentage: 1.5,
      phase: "Oil Phase",
      function: "Emulsifier",
      supplier: "BASF",
      pricePerKg: 380,
      compliance: "pass",
      restricted: false,
    },
    // Cool Down Phase
    {
      id: 8,
      inci: "Ascorbic Acid",
      tradeName: "Vitamin C (L-Ascorbic Acid)",
      cas: "50-81-7",
      percentage: 8.0,
      phase: "Cool Down",
      function: "Active/Antioxidant",
      supplier: "DSM Nutritional",
      pricePerKg: 950,
      compliance: "pass",
      restricted: false,
    },
    {
      id: 9,
      inci: "Niacinamide",
      tradeName: "Vitamin B3",
      cas: "98-92-0",
      percentage: 0.5,
      phase: "Cool Down",
      function: "Active",
      supplier: "Lonza",
      pricePerKg: 1200,
      compliance: "warning",
      restricted: false,
      warning:
        "May reduce stability when combined with Ascorbic Acid at high concentrations. Consider pH buffering.",
    },
    {
      id: 10,
      inci: "Phenoxyethanol, Ethylhexylglycerin",
      tradeName: "Euxyl PE 9010",
      cas: "122-99-6, 70445-33-9",
      percentage: 1.0,
      phase: "Cool Down",
      function: "Preservative",
      supplier: "Schulke",
      pricePerKg: 580,
      compliance: "pass",
      restricted: true,
      maxConc: 1.0,
      region: "India",
    },
    {
      id: 11,
      inci: "Citric Acid",
      tradeName: "Citric Acid",
      cas: "77-92-9",
      percentage: 0.15,
      phase: "Cool Down",
      function: "pH Adjuster",
      supplier: "Tate & Lyle",
      pricePerKg: 120,
      compliance: "pass",
      restricted: false,
    },
  ],
  targetpH: "3.2-3.8",
  stability: "6 months @ 25°C",
  notes:
    "Mix water phase ingredients and heat to 75°C. Mix oil phase separately and heat to 75°C. Combine phases with homogenization. Cool to 40°C before adding cool-down ingredients.",
};

type TabId = "formulation" | "compliance" | "suppliers" | "existing-formulations";

const CreateFormulations = () => {
  const [activeTab, setActiveTab] = useState<TabId>("formulation");
  const [formulation] = useState(formulationData);

  const totalPercentage = formulation.ingredients.reduce(
    (sum, ing) => sum + ing.percentage,
    0,
  );
  const totalCost = formulation.ingredients.reduce(
    (sum, ing) =>
      sum +
      (ing.percentage / 100) * formulation.batchSize * (ing.pricePerKg / 1000),
    0,
  );
  const costPerUnit = (totalCost / formulation.batchSize) * 100; // Cost per 100g

  const tabs = [
    { id: "formulation" as TabId, label: "Formulation Editor", icon: "fa-edit" },
    { id: "compliance" as TabId, label: "Compliance Check", icon: "fa-shield-check" },
    { id: "suppliers" as TabId, label: "Supplier Marketplace", icon: "fa-store" },
    { id: "existing-formulations" as TabId, label: "Existing Formulations", icon: "fa-list" },
  ];

  return (
    <PageContent
      ariaLabel="create-formulations"
      header={{
        title: "FormulationLooker",
        description: "India's First Cosmetic Formulation Platform",
        hasBack: true,
        animate: true,
      }}
    >
      {/* Navigation Tabs */}
      <div className="bg-background border-b mb-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-4 px-2 font-medium text-sm transition-colors relative",
                activeTab === tab.id
                  ? "font-semibold text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === "formulation" && (
        <FormulationEditor
          formulation={formulation}
          totalPercentage={totalPercentage}
          totalCost={totalCost}
          costPerUnit={costPerUnit}
        />
      )}
      {activeTab === "compliance" && <ComplianceChecker formulation={formulation} />}
      {activeTab === "suppliers" && <SupplierMarketplace formulation={formulation} />}
      {activeTab === "existing-formulations" && <ExistingFormulations />}
    </PageContent>
  );
};

// Formulation Editor Component
function FormulationEditor({
  formulation,
  totalPercentage,
  totalCost,
  costPerUnit,
}: {
  formulation: typeof formulationData;
  totalPercentage: number;
  totalCost: number;
  costPerUnit: number;
}) {
  return (
    <div className="space-y-6">
      {/* Formulation Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{formulation.name}</h2>
            <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                <i className="fas fa-tag mr-1"></i>
                {formulation.category}
              </span>
              <span>
                <i className="fas fa-calendar mr-1"></i>
                {formulation.createdDate}
              </span>
              <span>
                <i className="fas fa-code-branch mr-1"></i>v{formulation.version}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button>
              <i className="fas fa-save mr-2"></i>Save
            </Button>
            <Button variant="outlined">
              <i className="fas fa-download mr-2"></i>Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Percentage</div>
          <div
            className={cn(
              "text-2xl font-bold",
              totalPercentage === 100 ? "text-green-600" : "text-red-600",
            )}
          >
            {totalPercentage.toFixed(2)}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Batch Size</div>
          <div className="text-2xl font-bold">
            {formulation.batchSize} {formulation.unit}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
          <div className="text-2xl font-bold">₹{totalCost.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Cost per 100g</div>
          <div className="text-2xl font-bold">₹{costPerUnit.toFixed(2)}</div>
        </Card>
      </div>

      {/* Ingredient Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Formulation Composition</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phase</TableHead>
                <TableHead>INCI Name</TableHead>
                <TableHead>Trade Name</TableHead>
                <TableHead>Function</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Weight (g)</TableHead>
                <TableHead>Cost (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formulation.ingredients.map((ing) => {
                const weight = ((ing.percentage / 100) * formulation.batchSize).toFixed(2);
                const cost = (
                  (ing.percentage / 100) *
                  formulation.batchSize *
                  (ing.pricePerKg / 1000)
                ).toFixed(2);
                return (
                  <TableRow key={ing.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{ing.phase}</TableCell>
                    <TableCell>
                      {ing.inci}
                      {ing.restricted && (
                        <i
                          className="fas fa-exclamation-triangle text-yellow-600 ml-2"
                          title="Restricted ingredient"
                        ></i>
                      )}
                    </TableCell>
                    <TableCell>{ing.tradeName}</TableCell>
                    <TableCell>{ing.function}</TableCell>
                    <TableCell className="font-semibold">{ing.percentage}%</TableCell>
                    <TableCell>{weight}</TableCell>
                    <TableCell>₹{cost}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Manufacturing Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Manufacturing Instructions</h3>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <i className="fas fa-info-circle text-blue-400 mt-1"></i>
            <div className="ml-3">
              <p className="text-sm">{formulation.notes}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Target pH</label>
            <div className="mt-1 text-sm">{formulation.targetpH}</div>
          </div>
          <div>
            <label className="text-sm font-medium">Expected Stability</label>
            <div className="mt-1 text-sm">{formulation.stability}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Compliance Checker Component
function ComplianceChecker({
  formulation,
}: {
  formulation: typeof formulationData;
}) {
  const passCount = formulation.ingredients.filter(
    (ing) => ing.compliance === "pass",
  ).length;
  const warningCount = formulation.ingredients.filter(
    (ing) => ing.compliance === "warning",
  ).length;
  const failCount = formulation.ingredients.filter(
    (ing) => ing.compliance === "fail",
  ).length;

  return (
    <div className="space-y-6">
      {/* Compliance Summary */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Indian Regulatory Compliance Check</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700">Compliant</div>
                <div className="text-3xl font-bold text-green-900">{passCount}</div>
              </div>
              <i className="fas fa-check-circle text-4xl text-green-500"></i>
            </div>
          </Card>
          <Card className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-700">Warnings</div>
                <div className="text-3xl font-bold text-yellow-900">{warningCount}</div>
              </div>
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500"></i>
            </div>
          </Card>
          <Card className="p-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-700">Violations</div>
                <div className="text-3xl font-bold text-red-900">{failCount}</div>
              </div>
              <i className="fas fa-times-circle text-4xl text-red-500"></i>
            </div>
          </Card>
        </div>
      </Card>

      {/* Detailed Compliance Report */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Compliance Report</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <i className="fas fa-shield-check text-green-600 text-xl mt-1"></i>
                <div>
                  <h4 className="font-semibold">CDSCO Prohibited Ingredients</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    No prohibited ingredients from GNRAS list detected
                  </p>
                </div>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Pass
              </span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <i className="fas fa-shield-check text-green-600 text-xl mt-1"></i>
                <div>
                  <h4 className="font-semibold">BIS IS 4707 Compliance</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    All ingredients within permitted concentration limits
                  </p>
                </div>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Pass
              </span>
            </div>
          </div>

          {warningCount > 0 && (
            <div className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-exclamation-triangle text-yellow-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold">Ingredient Compatibility</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Potential stability concern detected
                    </p>
                    {formulation.ingredients
                      .filter((ing) => ing.compliance === "warning")
                      .map((ing) => (
                        <div key={ing.id} className="mt-2 text-sm bg-white rounded p-3">
                          <strong>{ing.inci}:</strong> {ing.warning}
                        </div>
                      ))}
                  </div>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Warning
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Supplier Marketplace Component
function SupplierMarketplace({
  formulation,
}: {
  formulation: typeof formulationData;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Supplier Marketplace</h2>
        <p className="text-muted-foreground">
          Find and compare suppliers for your formulation ingredients with live pricing and
          availability
        </p>
      </Card>
      <Card className="p-6">
        <p className="text-muted-foreground">Supplier marketplace functionality coming soon...</p>
      </Card>
    </div>
  );
}

// Existing Formulations Component
function ExistingFormulations() {
  // Sample existing formulations data
  const existingFormulations = [
    {
      id: 1,
      name: "Brightening Vitamin C Serum",
      brand: "GlowSkin",
      matchedIngredients: [
        "Ascorbic Acid",
        "Sodium Hyaluronate",
        "Glycerin",
        "Niacinamide",
      ],
      category: "Face Serum",
      createdAt: "2024-11-20",
    },
    {
      id: 2,
      name: "Hydrating Hyaluronic Acid Moisturizer",
      brand: "AquaBeauty",
      matchedIngredients: [
        "Sodium Hyaluronate",
        "Glycerin",
        "Caprylic/Capric Triglyceride",
        "Cetearyl Alcohol",
      ],
      category: "Moisturizer",
      createdAt: "2024-11-18",
    },
    {
      id: 3,
      name: "Gentle Cleansing Gel",
      brand: "PureSkin",
      matchedIngredients: [
        "Decyl Glucoside",
        "Glycerin",
        "Aqua",
        "Citric Acid",
      ],
      category: "Cleanser",
      createdAt: "2024-11-15",
    },
    {
      id: 4,
      name: "Antioxidant Day Cream",
      brand: "VitaGlow",
      matchedIngredients: [
        "Ascorbic Acid",
        "Tocopherol",
        "Glycerin",
        "Cetearyl Alcohol",
      ],
      category: "Moisturizer",
      createdAt: "2024-11-12",
    },
    {
      id: 5,
      name: "Soothing Aloe Vera Gel",
      brand: "NatureCare",
      matchedIngredients: [
        "Aloe Barbadensis Leaf Juice",
        "Glycerin",
        "Carbomer",
        "Phenoxyethanol",
      ],
      category: "Gel",
      createdAt: "2024-11-10",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Existing Formulations</h2>
        <p className="text-muted-foreground">
          Browse existing formulations and their matched ingredients
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {existingFormulations.map((formulation) => (
          <Card key={formulation.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{formulation.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{formulation.brand}</span>
                  <span>•</span>
                  <span>{formulation.category}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Matched Ingredients:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {formulation.matchedIngredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created: {formulation.createdAt}</span>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default CreateFormulations;
