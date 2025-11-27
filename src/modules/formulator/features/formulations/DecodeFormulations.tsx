import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { Textarea } from "@/core/components/ui/textarea";
import { Input } from "@/core/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import {
  SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import type { ServerTableFetcher } from "@/core/components/ui/pagination-combo-box";
import { cn } from "@/core/utils";
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import { basePythonApiUrl } from "@/core/config/baseUrls";

// Types and Interfaces
interface AnalyzeRequest {
  inci_names: string[];
}

interface MatchedItem {
  ingredient_name: string;
  supplier_name: string;
  description: string;
  functionality_category_tree: string[][];
  chemical_class_category_tree: string[][];
  match_score: number;
  matched_inci: string[];
  matched_count: number;
  total_brand_inci: number;
}

interface GroupItem {
  inci_list: string[];
  items: MatchedItem[];
  count: number;
}

interface AnalyzeResponse {
  grouped: GroupItem[];
  unmatched: string[];
  overall_confidence: number;
  processing_time: number;
  bis_cautions?: Record<string, string[]>; // BIS cautions from RAG
}

type ActiveTab = "grouped" | "unmatched" | "analysis";

interface ReportState {
  loading: boolean;
  data: string | null;
  pdfLoading: boolean;
}

interface ExtractUrlRequest {
  url: string;
}

interface ExtractUrlResponse {
  ingredients: string[];
  extracted_text: string;
  platform: string;
  url: string;
  processing_time: number;
  is_estimated?: boolean;
  source?: string;
  product_name?: string;
  message?: string;
}

interface DistributorInfo {
  _id: string;
  firmName: string;
  category: string;
  registeredAddress: string;
  contactPersons?: Array<{
    name: string;
    number: string;
    email: string;
    zones: string[];
  }>;
  contactPerson?: {  // Legacy support for old data
    name: string;
    number: string;
    email: string;
    zone: string;
  };
  ingredientName: string;
  principlesSuppliers: string[];
  yourInfo: {
    name: string;
    email: string;
    designation: string;
    contactNo: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

const api = {
  async extractIngredientsFromUrl(
    req: ExtractUrlRequest,
  ): Promise<ExtractUrlResponse> {
    const response = await axios.post(
      `${basePythonApiUrl}/api/extract-ingredients-from-url`,
      req,
    );
    return response.data;
  },

  async analyzeIngredients(req: AnalyzeRequest): Promise<AnalyzeResponse> {
    const response = await axios.post(
      `${basePythonApiUrl}/api/analyze-inci`,
      req,
    );
    return response.data;
  },

  async getSuppliers(): Promise<{ suppliers: string[] }> {
    const response = await axios.get(`${basePythonApiUrl}/api/suppliers`);
    return response.data;
  },

  async getDistributorsByIngredient(
    ingredientName: string,
  ): Promise<DistributorInfo[]> {
    try {
      const response = await axios.get(
        `${basePythonApiUrl}/api/distributor/by-ingredient/${encodeURIComponent(ingredientName)}`
      );
      return Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status === 404) {
          return [];
        }
      }
      console.error("Error fetching distributors:", error);
      return [];
    }
  },

  async registerDistributor(data: {
    firmName: string;
    category: string;
    registeredAddress: string;
    contactPersons: Array<{
      name: string;
      number: string;
      email: string;
      zones: string[];
    }>;
    ingredientName: string;
    principlesSuppliers: string[];
    yourInfo: {
      name: string;
      email: string;
      designation: string;
      contactNo: string;
    };
    acceptTerms: boolean;
  }): Promise<{ success: boolean; message: string; distributorId?: string }> {
    const response = await axios.post(
      `${basePythonApiUrl}/api/distributor/register`,
      data
    );
    return response.data;
  },

  async generateReport(
    inciList: string[],
    brandedIngredients: string[],
    notBrandedIngredients: string[],
    bisCautions?: Record<string, string[]>,
  ): Promise<string> {
    const response = await axios.post(
      `${basePythonApiUrl}/api/formulation-report`,
      {
        inciList,
        brandedIngredients,
        notBrandedIngredients,
        bisCautions: bisCautions || null,
      },
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  },

  async downloadPDF(): Promise<Blob> {
    const response = await axios.get(
      `${basePythonApiUrl}/api/formulation-report/pdf`,
      { responseType: "blob" },
    );
    return response.data;
  },
};

// UI Components
const SectionTitle = React.memo(
  ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
  ),
);
SectionTitle.displayName = "SectionTitle";

const TabButton = React.memo(
  ({
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
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium ${
            active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  ),
);
TabButton.displayName = "TabButton";

const LoadingSpinner = React.memo(
  ({
    size = "sm",
    className = "",
  }: {
    size?: "sm" | "md" | "lg";
    className?: string;
  }) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    };

    return (
      <div
        className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]} ${className}`}
      />
    );
  },
);
LoadingSpinner.displayName = "LoadingSpinner";

const EmptyState = React.memo(
  ({ title, description }: { title: string; description: string }) => (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
      <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
        <MagnifyingGlassIcon />
      </div>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

type InputMode = "inci" | "url";

interface ContactPerson {
  name: string;
  number: string;
  email: string;
  zones: string[]; // Multiple zones
}

interface DistributorFormData {
  firmName: string;
  category: string;
  registeredAddress: string;
  contactPersons: ContactPerson[]; // Multiple contact persons
  principlesSuppliers: string[]; // Multiple selected suppliers
  yourInfo: {
    name: string;
    email: string;
    designation: string;
    contactNo: string;
  };
  acceptTerms: boolean;
}

function IngredientAnalyzer() {
  // State management
  const [inputMode, setInputMode] = useState<InputMode>("inci");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractUrlResponse | null>(null);
  const [resp, setResp] = useState<AnalyzeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("grouped");
  const [reportState, setReportState] = useState<ReportState>({
    loading: false,
    data: null,
    pdfLoading: false,
  });
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Distributor claim state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDistributorForm, setShowDistributorForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [distributorInfo, setDistributorInfo] = useState<Record<string, DistributorInfo[]>>({});
  const [showDistributorDetails, setShowDistributorDetails] = useState<string | null>(null);
  const [formData, setFormData] = useState<DistributorFormData>({
    firmName: "",
    category: "",
    registeredAddress: "",
    contactPersons: [
      {
        name: "",
        number: "",
        email: "",
        zones: [],
      },
    ],
    principlesSuppliers: [],
    yourInfo: {
      name: "",
      email: "",
      designation: "",
      contactNo: "",
    },
    acceptTerms: false,
  });

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

  // Create supplier fetcher for PaginationComboBox
  const supplierFetcher: ServerTableFetcher<{ supplierName: string }> = useCallback(
    async ({ pageIndex, pageSize, globalFilter, signal }) => {
      try {
        const response = await axios.get(`${basePythonApiUrl}/api/suppliers/paginated`, {
          params: {
            skip: pageIndex * pageSize,
            limit: pageSize,
            search: globalFilter || undefined,
          },
          signal,
        });
        const data = response.data;
        
        return {
          rows: data.suppliers.map((name: string) => ({ supplierName: name })),
          total: data.total,
        };
      } catch (err: unknown) {
        if (err && typeof err === "object" && "name" in err && err.name === "CanceledError") {
          // Request was cancelled, return empty result
          return { rows: [], total: 0 };
        }
        throw err;
      }
    },
    []
  );

  // Handle claim button click
  const handleClaimClick = useCallback((ingredientName: string) => {
    setSelectedIngredient(ingredientName);
    setShowRegistrationModal(true);
  }, []);

  // Handle proceed to form
  const handleProceedToForm = useCallback(() => {
    setShowRegistrationModal(false);
    setShowDistributorForm(true);
  }, []);


  // Update your info field
  const updateYourInfo = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      yourInfo: {
        ...prev.yourInfo,
        [field]: value,
      },
    }));
  }, []);

  // Add contact person
  const addContactPerson = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: [
        ...prev.contactPersons,
        {
          name: "",
          number: "",
          email: "",
          zones: [],
        },
      ],
    }));
  }, []);

  // Remove contact person
  const removeContactPerson = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.filter((_, i) => i !== index),
    }));
  }, []);

  // Update contact person field
  const updateContactPerson = useCallback((index: number, field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.map((cp, i) =>
        i === index ? { ...cp, [field]: value } : cp
      ),
    }));
  }, []);

  // Handle form submission
  const handleFormSubmit = useCallback(async () => {
    if (!selectedIngredient) {
      window.alert("No ingredient selected");
      return;
    }

    if (!formData.acceptTerms) {
      window.alert("Please accept the terms and conditions");
      return;
    }

    // Validate all required fields
    if (!formData.firmName || !formData.category || !formData.registeredAddress) {
      window.alert("Please fill in all required fields");
      return;
    }

    // Validate contact persons
    if (formData.contactPersons.length === 0) {
      window.alert("Please add at least one contact person");
      return;
    }
    
    for (let i = 0; i < formData.contactPersons.length; i++) {
      const cp = formData.contactPersons[i];
      if (!cp.name || !cp.number || !cp.email || cp.zones.length === 0) {
        window.alert(`Please fill in all fields for Contact Person ${i + 1}`);
        return;
      }
    }

    // Validate principles suppliers
    if (formData.principlesSuppliers.length === 0) {
      window.alert("Please select at least one supplier in Principles You Represent");
      return;
    }

    // Validate your info
    if (!formData.yourInfo.name || !formData.yourInfo.email || 
        !formData.yourInfo.designation || !formData.yourInfo.contactNo) {
      window.alert("Please fill in all Your Info fields");
      return;
    }

    setSubmittingForm(true);
    try {
      const result = await api.registerDistributor({
        ...formData,
        ingredientName: selectedIngredient,
      });

      if (result.success) {
        window.alert("Distributor registration submitted successfully!");
        
        // Refresh distributor info for the ingredient
        if (selectedIngredient) {
          const distributors = await api.getDistributorsByIngredient(selectedIngredient);
          setDistributorInfo(prev => ({
            ...prev,
            [selectedIngredient]: distributors,
          }));
        }
        
        // Reset form and close modal
        setFormData({
          firmName: "",
          category: "",
          registeredAddress: "",
          contactPersons: [
            {
              name: "",
              number: "",
              email: "",
              zones: [],
            },
          ],
          principlesSuppliers: [],
          yourInfo: {
            name: "",
            email: "",
            designation: "",
            contactNo: "",
          },
          acceptTerms: false,
        });
        setShowDistributorForm(false);
        setSelectedIngredient(null);
      }
    } catch (error: unknown) {
      console.error("Error submitting distributor registration:", error);
      let errorMessage = "Failed to submit registration";
      if (error && typeof error === "object" && "response" in error) {
        const httpError = error as { response?: { data?: { detail?: string } }; message?: string };
        errorMessage = httpError.response?.data?.detail || httpError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      window.alert(`Error: ${errorMessage}`);
    } finally {
      setSubmittingForm(false);
    }
  }, [formData, selectedIngredient]);

  // Extract ingredients from URL
  const onExtract = useCallback(async () => {
    if (!url.trim()) return;

    setExtracting(true);
    setExtractedData(null);
    try {
      const data = await api.extractIngredientsFromUrl({ url: url.trim() });
      setExtractedData(data);
      // Auto-populate the INCI textarea with extracted ingredients
      setText(data.ingredients.join(", "));
    } catch (error) {
      console.error("Error extracting ingredients from URL:", error);
      window.alert("Error extracting ingredients from URL. Please try again.");
    } finally {
      setExtracting(false);
    }
  }, [url]);

  // API callbacks
  const onAnalyze = useCallback(async () => {
    if (inputMode === "inci" && !parsed.length) return;
    if (inputMode === "url" && !extractedData?.ingredients.length) return;

    setLoading(true);
    try {
      let ingredientsToAnalyze = parsed;
      
      // If URL mode, use extracted ingredients
      if (inputMode === "url" && extractedData) {
        ingredientsToAnalyze = extractedData.ingredients;
      }

      const data = await api.analyzeIngredients({ inci_names: ingredientsToAnalyze });
      setResp(data);
      setActiveTab("grouped");
      
      // Fetch distributor info for all ingredients
      if (data.grouped) {
        const ingredientNames = new Set<string>();
        data.grouped.forEach((group: GroupItem) => {
          group.items.forEach((item: MatchedItem) => {
            ingredientNames.add(item.ingredient_name);
          });
        });
        
        // Fetch distributor info for each ingredient
        const distributorPromises = Array.from(ingredientNames).map(async (ingredientName) => {
          const distributors = await api.getDistributorsByIngredient(ingredientName);
          return { ingredientName, distributors };
        });
        
        const distributorResults = await Promise.all(distributorPromises);
        const distributorMap: Record<string, DistributorInfo[]> = {};
        distributorResults.forEach(({ ingredientName, distributors }) => {
          distributorMap[ingredientName] = distributors;
        });
        setDistributorInfo(distributorMap);
      }
    } catch (error) {
      console.error("Error analyzing ingredients:", error);
    } finally {
      setLoading(false);
    }
  }, [parsed, inputMode, extractedData]);

  const generateReport = useCallback(async () => {
    if (!parsed.length) return;

    // Ensure we have analysis results before generating report
    if (!resp) {
      console.warn(
        "No analysis results available. Please analyze ingredients first.",
      );
      return;
    }

    setReportState((prev) => ({ ...prev, loading: true }));
    try {
      // Extract branded and not branded ingredients from analyze_inci response
      const brandedIngredients: string[] = [];
      const notBrandedIngredients: string[] = resp.unmatched || [];

      // Extract all INCI names from grouped (branded) ingredients
      if (resp.grouped) {
        resp.grouped.forEach((group) => {
          group.inci_list.forEach((inci) => {
            if (!brandedIngredients.includes(inci)) {
              brandedIngredients.push(inci);
            }
          });
        });
      }

      // Extract BIS cautions from analyze_inci response
      const bisCautions = resp.bis_cautions || undefined;

      const data = await api.generateReport(
        parsed,
        brandedIngredients,
        notBrandedIngredients,
        bisCautions,
      );
      setReportState((prev) => ({ ...prev, data, loading: false }));
    } catch (error) {
      console.error("Error generating report:", error);
      setReportState((prev) => ({
        ...prev,
        data: "Error generating report. Please try again.",
        loading: false,
      }));
    }
  }, [parsed, resp]);

  const downloadPDF = useCallback(async () => {
    setReportState((prev) => ({ ...prev, pdfLoading: true }));
    try {
      const blob = await api.downloadPDF();

      // Create blob link to download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "formulation_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      window.alert("Error downloading PDF. Please try again.");
    } finally {
      setReportState((prev) => ({ ...prev, pdfLoading: false }));
    }
  }, []);

  const openReportInNewTab = useCallback(() => {
    if (!reportState.data) return;

    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(reportState.data);
      newWindow.document.close();
    }
  }, [reportState.data]);

  // Auto-generate report when switching to analysis tab
  useEffect(() => {
    if (
      activeTab === "analysis" &&
      parsed.length > 0 &&
      resp && // Ensure analysis results are available
      !reportState.data &&
      !reportState.loading
    ) {
      generateReport();
    }
  }, [
    activeTab,
    parsed.length,
    resp,
    reportState.data,
    reportState.loading,
    generateReport,
  ]);

  return (
    <div className="w-full px-4 py-6">
      {/* Top card */}
      <div className="bg-card border-border rounded-xl border p-6 shadow-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">
              {inputMode === "inci"
                ? "Paste your product's INCI list"
                : "Enter product URL"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {inputMode === "inci"
                ? "Enter ingredients separated by commas, as they appear on your product label"
                : "Paste the product page URL to automatically extract ingredients"}
            </p>
          </div>
          
          {/* Input Mode Toggle */}
          <div className="flex gap-2 border rounded-lg p-1 bg-muted/50">
            <button
              type="button"
              onClick={() => setInputMode("inci")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                inputMode === "inci"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              INCI List
            </button>
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                inputMode === "url"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Product URL
            </button>
          </div>
        </div>

        <div className="relative mt-4">
          {inputMode === "inci" ? (
            <>
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
            </>
          ) : (
            <>
              <label htmlFor="url" className="sr-only">
                Product URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  id="url"
                  type="url"
                  className="pl-10 h-12"
                  placeholder="https://example.com/product/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  aria-describedby="url-help"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Supported: Amazon, Nykaa, Flipkart, and other e-commerce product pages
              </p>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {inputMode === "url" ? (
            <>
              <Button
                variant={"contained"}
                color={"primary"}
                type="button"
                onClick={onExtract}
                disabled={extracting || !url.trim()}
              >
                <LinkIcon className="size-4" />
                {extracting ? "Extracting…" : "Extract Ingredients"}
              </Button>
              {extractedData && (
                <Button
                  variant={"contained"}
                  color={"primary"}
                  type="button"
                  onClick={onAnalyze}
                  disabled={loading}
                >
                  <MagnifyingGlassIcon />
                  {loading ? "Analyzing…" : "Analyze Ingredients"}
                </Button>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Extracted Data Display */}
        {extractedData && inputMode === "url" && (
          <div className="mt-6 space-y-4">
            {/* Estimated Ingredients Warning */}
            {extractedData.is_estimated && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      Estimated Ingredients
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {extractedData.message ||
                        "Unable to extract ingredients directly from the URL. These are estimated ingredients found via AI search. Please verify these ingredients match the actual product formulation."}
                    </p>
                    {extractedData.product_name && (
                      <p className="text-xs text-amber-700 mt-1">
                        Product detected: <span className="font-medium">{extractedData.product_name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900">
                  Extraction Results
                </h3>
                <span className="text-xs text-blue-700">
                  Platform: {extractedData.platform} • {extractedData.ingredients.length} ingredients found
                  {extractedData.is_estimated && (
                    <span className="ml-1 text-amber-600">(Estimated)</span>
                  )}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {extractedData.ingredients.map((ing, idx) => (
                  <Badge
                    key={idx}
                    variant={"outline"}
                    className="text-xs bg-white border-blue-300 text-blue-800"
                  >
                    {ing}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-600">
                Processing time: {extractedData.processing_time.toFixed(2)}s
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {resp && (
        <div className="mt-6 w-full">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Analysis Results</h2>
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
              label="Not Branded Ingredients"
              count={resp.unmatched?.length}
            />
            <TabButton
              active={activeTab === "analysis"}
              onClick={() => setActiveTab("analysis")}
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-green-600 text-[11px] text-white">
                  📊
                </span>
              }
              label="Analysis Report"
              count={0}
            />
          </div>

          {activeTab === "grouped" && (
            <div className="space-y-4">
              {resp.grouped?.map((m: GroupItem) => {
                return (
                  <div key={m.inci_list.join("-")} className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
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
                      className="w-full rounded-lg border bg-white shadow-sm"
                      defaultValue="item-1"
                    >
                      {m.items.map((item) => (
                        <AccordionItem
                          value={item.ingredient_name}
                          key={item.ingredient_name}
                          className="border-b last:border-b-0"
                        >
                          <AccordionTrigger className="px-5 py-4 hover:no-underline">
                            <div className="flex w-full items-center justify-between pr-4">
                              <h3 className="truncate text-lg font-medium capitalize">
                                {item.ingredient_name}
                              </h3>
                              <div className="text-muted-foreground flex items-center gap-2 shrink-0">
                                <span className="text-sm">
                                  {item.supplier_name}
                                </span>
                                <BuildingStorefrontIcon className="size-5" />
                                {distributorInfo[item.ingredient_name] && distributorInfo[item.ingredient_name].length > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-700 border-green-300 cursor-pointer hover:bg-green-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDistributorDetails(item.ingredient_name);
                                    }}
                                  >
                                    India Distributor{distributorInfo[item.ingredient_name].length > 1 ? ` (${distributorInfo[item.ingredient_name].length})` : ""}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-4">
                            <div className="space-y-4">
                              <p className="text-sm leading-6 text-gray-700">
                                {item.description}
                              </p>
                              <div className="flex justify-end pt-2 border-t">
                                <div className="group relative">
                                  <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => handleClaimClick(item.ingredient_name)}
                                    className="flex items-center gap-2"
                                  >
                                    <BuildingStorefrontIcon className="size-4" />
                                    Claim this as India distributor
                                  </Button>
                                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
                                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg max-w-xs">
                                      Claim this ingredient as your India distributor territory. You need to register as a distributor on SkinBB Metaverse.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "unmatched" && (
            <div className="space-y-4">
              <SectionTitle>Not Branded Ingredients</SectionTitle>
              <p className="text-sm text-gray-600">
                These are standard INCI ingredients that are not part of
                proprietary branded ingredient systems. They are common cosmetic
                ingredients.
              </p>
              <div className="flex flex-wrap gap-2">
                {resp.unmatched?.map((u) => (
                  <Badge
                    variant={"outline"}
                    className="text-muted-foreground border-primary capitalize bg-white"
                    key={u}
                  >
                    {u}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analysis" && (
            <div>
              <SectionTitle>Analysis Report</SectionTitle>

              <div className="mt-4 space-y-4">
                {reportState.loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3">
                      <LoadingSpinner size="md" className="text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Generating comprehensive report...
                      </span>
                    </div>
                  </div>
                )}

                {reportState.data && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={openReportInNewTab}
                      variant="outlined"
                      className="flex items-center gap-2"
                    >
                      🔗 Open in New Tab
                    </Button>

                    <Button
                      onClick={downloadPDF}
                      disabled={reportState.pdfLoading}
                      variant="outlined"
                      className="flex items-center gap-2"
                    >
                      {reportState.pdfLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="text-gray-600" />
                          Downloading...
                        </>
                      ) : (
                        <>📄 Download PDF</>
                      )}
                    </Button>
                  </div>
                )}

                {reportState.data && (
                  <div className="mt-6">
                    <div className="rounded-lg border bg-white p-4">
                      <h3 className="mb-3 text-sm font-medium text-gray-900">
                        Report Preview
                      </h3>
                      <div className="max-h-96 overflow-y-auto rounded-lg border">
                        {reportState.data.includes("<html") ? (
                          <iframe
                            srcDoc={reportState.data}
                            className="h-96 w-full border-0"
                            title="Formulation Report Preview"
                          />
                        ) : (
                          <pre className="p-4 font-mono text-xs whitespace-pre-wrap text-gray-700">
                            {reportState.data}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!parsed.length && (
                  <EmptyState
                    title="No ingredients to analyze"
                    description="Please analyze some ingredients first to view the report."
                  />
                )}

                {parsed.length > 0 &&
                  !reportState.data &&
                  !reportState.loading && (
                    <EmptyState
                      title="Report ready to generate"
                      description="Report will be generated automatically when you switch to this tab."
                    />
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Registration Modal */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Distributor Registration Required</DialogTitle>
            <DialogDescription>
              You need to register as a distributor on SkinBB Metaverse to be able to claim this ingredient as your India distributor territory.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Ingredient: <span className="font-semibold">{selectedIngredient}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setShowRegistrationModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleProceedToForm}>
              Go Ahead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Distributor Onboarding Form Modal */}
      <Dialog open={showDistributorForm} onOpenChange={setShowDistributorForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Distributor Onboarding Form</DialogTitle>
            <DialogDescription>
              Please fill in all the required information to register as a distributor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Firm Name */}
            <div>
              <label htmlFor="firmName" className="text-sm font-medium mb-1 block">
                Name of the firm: <span className="text-red-500">*</span>
              </label>
              <Input
                id="firmName"
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                placeholder="Enter firm name"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="text-sm font-medium mb-1 block">
                Category: <span className="text-red-500">*</span>
              </label>
              <SelectRoot
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Pvt Ltd">Pvt Ltd</SelectItem>
                  <SelectItem value="LLP">LLP</SelectItem>
                  <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>

            {/* Registered Address */}
            <div>
              <label htmlFor="registeredAddress" className="text-sm font-medium mb-1 block">
                Registered Address: <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="registeredAddress"
                value={formData.registeredAddress}
                onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
                placeholder="Enter registered address"
                rows={3}
              />
            </div>

            {/* Contact Persons */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Contact Person(s): <span className="text-red-500">*</span>
                </h3>
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  onClick={addContactPerson}
                >
                  + Add Contact Person
                </Button>
              </div>
              
              {formData.contactPersons.map((contactPerson, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  {formData.contactPersons.length > 1 && (
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      onClick={() => removeContactPerson(index)}
                      className="absolute top-2 right-2"
                    >
                      Remove
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`cp-name-${index}`} className="text-xs font-medium mb-1 block">
                        Name: <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id={`cp-name-${index}`}
                        value={contactPerson.name}
                        onChange={(e) => updateContactPerson(index, "name", e.target.value)}
                        placeholder="Enter contact person name"
                      />
                    </div>

                    <div>
                      <label htmlFor={`cp-number-${index}`} className="text-xs font-medium mb-1 block">
                        Number: <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id={`cp-number-${index}`}
                        type="tel"
                        value={contactPerson.number}
                        onChange={(e) => updateContactPerson(index, "number", e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label htmlFor={`cp-email-${index}`} className="text-xs font-medium mb-1 block">
                        Email: <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id={`cp-email-${index}`}
                        type="email"
                        value={contactPerson.email}
                        onChange={(e) => updateContactPerson(index, "email", e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label htmlFor={`cp-zones-${index}`} className="text-xs font-medium mb-1 block">
                        Zone(s): <span className="text-red-500">*</span>
                      </label>
                      <PaginationComboBox<{ zone: string }>
                        apiFunction={async () => {
                          const zones = ["India", "North Zone", "West Zone", "East Zone", "South Zone"];
                          return {
                            rows: zones.map(zone => ({ zone })),
                            total: zones.length,
                          };
                        }}
                        transform={(item) => ({
                          label: item.zone,
                          value: item.zone,
                        })}
                        placeholder="Select zone(s)..."
                        value={contactPerson.zones}
                        onChange={(value) => {
                          if (Array.isArray(value)) {
                            updateContactPerson(index, "zones", value);
                          }
                        }}
                        className="w-full"
                        multi={true}
                        searchable={true}
                        clearable={true}
                        pageSize={10}
                        enableInfiniteScroll={false}
                        minSearchLength={0}
                        queryKey={["zones", index.toString()]}
                        enabled={true}
                        fetchOnMount={true}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Principles You Represent Section */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">
                Principles You Represent: <span className="text-red-500">*</span>
              </h3>
              
              <PaginationComboBox<{ supplierName: string }>
                apiFunction={supplierFetcher}
                transform={(supplier) => ({
                  label: supplier.supplierName,
                  value: supplier.supplierName,
                })}
                placeholder="Search and select suppliers..."
                value={formData.principlesSuppliers}
                onChange={(value, _options) => {
                  if (Array.isArray(value)) {
                    setFormData((prev) => ({
                      ...prev,
                      principlesSuppliers: value,
                    }));
                  }
                }}
                className="w-full"
                multi={true}
                searchable={true}
                clearable={true}
                pageSize={50}
                enableInfiniteScroll={true}
                minSearchLength={0}
                queryKey={["distributor-suppliers"]}
                enabled={showDistributorForm}
                fetchOnMount={true}
              />
              
              {formData.principlesSuppliers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.principlesSuppliers.map((supplier) => (
                    <Badge key={supplier} variant="outline" className="text-xs">
                      {supplier}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Your Info Section */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">
                Your Info: <span className="text-red-500">*</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="yourName" className="text-xs font-medium mb-1 block">
                    Your Name: <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="yourName"
                    value={formData.yourInfo.name}
                    onChange={(e) => updateYourInfo("name", e.target.value)}
                    placeholder="Enter name"
                    size="sm"
                  />
                </div>

                <div>
                  <label htmlFor="yourEmail" className="text-xs font-medium mb-1 block">
                    Your Off Email ID: <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="yourEmail"
                    type="email"
                    value={formData.yourInfo.email}
                    onChange={(e) => updateYourInfo("email", e.target.value)}
                    placeholder="Enter email"
                    size="sm"
                  />
                </div>

                <div>
                  <label htmlFor="yourDesignation" className="text-xs font-medium mb-1 block">
                    Your Designation: <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="yourDesignation"
                    value={formData.yourInfo.designation}
                    onChange={(e) => updateYourInfo("designation", e.target.value)}
                    placeholder="Enter designation"
                    size="sm"
                  />
                </div>

                <div>
                  <label htmlFor="yourContactNo" className="text-xs font-medium mb-1 block">
                    Your Contact No: <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="yourContactNo"
                    type="tel"
                    value={formData.yourInfo.contactNo}
                    onChange={(e) => updateYourInfo("contactNo", e.target.value)}
                    placeholder="Enter contact number"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-1"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                I accept terms and conditions <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outlined" 
              onClick={() => setShowDistributorForm(false)}
              disabled={submittingForm}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFormSubmit}
              disabled={!formData.acceptTerms || submittingForm}
            >
              {submittingForm ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Distributor Details Modal */}
      <Dialog open={!!showDistributorDetails} onOpenChange={(open) => !open && setShowDistributorDetails(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>India Distributor Details</DialogTitle>
            <DialogDescription>
              Distributor information for {showDistributorDetails}
              {showDistributorDetails && distributorInfo[showDistributorDetails]?.length > 1 && (
                <span> ({distributorInfo[showDistributorDetails].length} distributors)</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {showDistributorDetails && distributorInfo[showDistributorDetails] && distributorInfo[showDistributorDetails].length > 0 && (
            <div className="space-y-6 py-4">
              {distributorInfo[showDistributorDetails].map((distributor, index) => (
                <div key={distributor._id || index} className="border rounded-lg p-4 space-y-4">
                  {distributorInfo[showDistributorDetails].length > 1 && (
                    <div className="text-sm font-semibold text-gray-600 border-b pb-2">
                      Distributor {index + 1} of {distributorInfo[showDistributorDetails].length}
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge
                      variant="outline"
                      className={
                        distributor.status === "approved"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : distributor.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-300"
                          : "bg-yellow-50 text-yellow-700 border-yellow-300"
                      }
                    >
                      {distributor.status || "Under Review"}
                    </Badge>
                  </div>

                  {/* Firm Information */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Firm Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Firm Name:</span>{" "}
                        {distributor.firmName}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>{" "}
                        {distributor.category}
                      </div>
                      <div>
                        <span className="font-medium">Registered Address:</span>{" "}
                        {distributor.registeredAddress}
                      </div>
                    </div>
                  </div>

                  {/* Contact Persons */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">
                      Contact Person{(distributor.contactPersons?.length ?? 0) > 1 ? "s" : ""}
                    </h4>
                    <div className="space-y-4">
                      {(distributor.contactPersons || (distributor.contactPerson ? [distributor.contactPerson] : [])).map((cp: { name: string; number: string; email: string; zones?: string[]; zone?: string }, cpIndex: number) => (
                        <div key={cpIndex} className="border rounded-lg p-3 space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {cp.name}
                          </div>
                          <div>
                            <span className="font-medium">Number:</span> {cp.number}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {cp.email}
                          </div>
                          <div>
                            <span className="font-medium">Zone{(cp.zones?.length ?? 0) > 1 ? "s" : ""}:</span>{" "}
                            {(cp.zones?.length ?? 0) > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(cp.zones ?? []).map((zone: string, zIndex: number) => (
                                  <Badge key={zIndex} variant="outline" className="text-xs">
                                    {zone}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              cp.zone || "N/A"
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Principles Suppliers */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Principles They Represent</h4>
                    <div className="flex flex-wrap gap-2">
                      {distributor.principlesSuppliers.map((supplier) => (
                        <Badge key={supplier} variant="outline" className="text-xs">
                          {supplier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outlined" onClick={() => setShowDistributorDetails(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function textEnding(n: number) {
  return n === 1 ? "" : "s";
}

const DecodeFormulations = () => {
  return (
    <PageContent
      ariaLabel="decode-formulations"
      header={{
        title: "Decode Formulations",
        description: "Analyze and decode existing formulations with detailed ingredient breakdown",
        hasBack: true,
        animate: true,
      }}
    >
      <IngredientAnalyzer />
    </PageContent>
  );
};

export default DecodeFormulations;
