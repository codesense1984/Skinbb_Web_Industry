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
  XMarkIcon,
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
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { FormulationReportViewer } from "./FormulationReportViewer";

// Types and Interfaces
interface AnalyzeRequest {
  inci_names: string[];
}

interface MatchedItem {
  ingredient_name: string;
  ingredient_id?: string | null;  // Ingredient ID for distributor mapping
  supplier_name: string | null;
  description: string | null;
  functionality_category_tree: string[][];
  chemical_class_category_tree: string[][];
  match_score: number;
  matched_inci: string[];
  matched_count: number;
  total_brand_inci: number;
  tag?: string; // 'B' for branded, 'G' for general
  match_method?: string; // 'exact', 'fuzzy', or 'synonym'
  category_decided?: string | null; // 'Active' or 'Excipient' from MongoDB (singular)
}

interface GroupItem {
  inci_list: string[];
  items: MatchedItem[];
  count: number;
}

interface AnalyzeResponse {
  grouped: GroupItem[]; // For backward compatibility
  branded_ingredients?: MatchedItem[]; // NEW: Branded ingredients only (tag='B') - flat list
  branded_grouped?: GroupItem[]; // NEW: Branded ingredients grouped by INCI - shows all options per INCI
  general_ingredients_list?: MatchedItem[]; // NEW: General INCI ingredients only (tag='G')
  unable_to_decode?: string[]; // NEW: Ingredients that couldn't be decoded
  unmatched: string[]; // DEPRECATED: Use unable_to_decode
  overall_confidence: number;
  processing_time: number;
  bis_cautions?: Record<string, string[]>; // BIS cautions from RAG
  ingredient_tags?: Record<string, string>; // Maps ingredient names to 'B' or 'G'
}

type ActiveTab = "matched" | "unableToDecode" | "analysis";
type MatchedSubTab = "all" | "actives" | "excipients";

interface ReportTableRow {
  cells: string[];
}

interface FormulationReportData {
  inci_list: string[];
  analysis_table: ReportTableRow[];
  compliance_panel: ReportTableRow[];
  preservative_efficacy: ReportTableRow[];
  risk_panel: ReportTableRow[];
  cumulative_benefit: ReportTableRow[];
  claim_panel: ReportTableRow[];
  recommended_ph_range: string | null;
  expected_benefits_analysis: ReportTableRow[];
  raw_text?: string;
}

interface ReportState {
  loading: boolean;
  data: string | FormulationReportData | null;
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
    ingredientId?: string | null,
  ): Promise<DistributorInfo[]> {
    try {
      // Build URL with optional ingredient_id query parameter
      let url = `${basePythonApiUrl}/api/distributor/by-ingredient/${encodeURIComponent(ingredientName)}`;
      if (ingredientId) {
        url += `?ingredient_id=${encodeURIComponent(ingredientId)}`;
      }
      
      const response = await axios.get(url);
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
    ingredientId?: string | null;  // Optional ingredient ID - if provided, use it directly
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
    expectedBenefits?: string,
  ): Promise<FormulationReportData> {
    const response = await axios.post(
      `${basePythonApiUrl}/api/formulation-report-json`,
      {
        inciList,
        brandedIngredients,
        notBrandedIngredients,
        bisCautions: bisCautions || null,
        expectedBenefits: expectedBenefits || null,
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

  async saveDecodeHistory(
    data: {
      name: string;
      tag?: string;
      input_type: string;
      input_data: string;
      analysis_result: AnalyzeResponse;
      report_data?: string | null;
      expected_benefits?: string | null;
    },
    userId: string | undefined
  ): Promise<{ success: boolean; id: string; message: string }> {
    if (!userId) {
      throw new Error("User ID is required to save history");
    }
    const response = await axios.post(
      `${basePythonApiUrl}/api/save-decode-history`,
      data,
      {
        headers: {
          "X-User-Id": userId,
        },
      }
    );
    return response.data;
  },

  async getDecodeHistory(
    params?: {
      search?: string;
      limit?: number;
      skip?: number;
    },
    userId?: string
  ): Promise<{ items: Array<{
    id: string;
    name: string;
    tag?: string;
    input_type: string;
    input_data: string;
    analysis_result: AnalyzeResponse;
    report_data?: string | null;
    expected_benefits?: string | null;
    created_at: string;
  }>; total: number }> {
    if (!userId) {
      throw new Error("User ID is required to fetch history");
    }
    const response = await axios.get(
      `${basePythonApiUrl}/api/decode-history`,
      {
        params,
        headers: {
          "X-User-Id": userId,
        },
      }
    );
    return response.data;
  },

  async updateDecodeHistory(
    historyId: string,
    data: { report_data?: string | null },
    userId: string | undefined
  ): Promise<{ success: boolean; message: string }> {
    if (!userId) {
      throw new Error("User ID is required to update history");
    }
    const response = await axios.patch(
      `${basePythonApiUrl}/api/decode-history/${historyId}`,
      data,
      {
        headers: {
          "X-User-Id": userId,
        },
      }
    );
    return response.data;
  },

  async deleteDecodeHistory(
    historyId: string,
    userId: string | undefined
  ): Promise<{ success: boolean; message: string }> {
    if (!userId) {
      throw new Error("User ID is required to delete history");
    }
    const response = await axios.delete(
      `${basePythonApiUrl}/api/decode-history/${historyId}`,
      {
        headers: {
          "X-User-Id": userId,
        },
      }
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

function IngredientAnalyzer({ 
  showHistory, 
  setShowHistory 
}: { 
  showHistory: boolean; 
  setShowHistory: (show: boolean) => void;
}) {
  // Get user ID for history
  const { userId } = useAuth();
  
  // State management
  const [inputMode, setInputMode] = useState<InputMode>("inci");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [expectedBenefits, setExpectedBenefits] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractUrlResponse | null>(null);
  const [resp, setResp] = useState<AnalyzeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("matched");
  const [matchedSubTab, setMatchedSubTab] = useState<MatchedSubTab>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [reportState, setReportState] = useState<ReportState>({
    loading: false,
    data: null,
    pdfLoading: false,
  });
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  
  // History sidebar state (now passed as props)
  const [historyItems, setHistoryItems] = useState<Array<{
    id: string;
    name: string;
    tag?: string;
    input_type: string;
    input_data: string;
    analysis_result: AnalyzeResponse;
    report_data?: string | null;
    expected_benefits?: string | null;
    created_at: string;
  }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  
  // Distributor claim state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDistributorForm, setShowDistributorForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [distributorInfo, setDistributorInfo] = useState<Record<string, DistributorInfo[]>>({});
  const [showDistributorDetails, setShowDistributorDetails] = useState<string | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null); // Track current history ID
  const [isLoadingFromHistory, setIsLoadingFromHistory] = useState(false); // Track if loading from history
  const hasLoadedFromHistoryRef = useRef(false); // Ref to track if we loaded from history (persists across renders)
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
  // Handle multiple separators: comma, semicolon, newline, pipe, dash, "and", "&"
  // IMPORTANT: Do NOT split on hyphens without spaces (e.g., "Crosspolymer-6" should stay together)
  const parsed = useMemo(() => {
    if (!text.trim()) return [];
    
    // First, normalize "and" and "&" to commas for easier splitting
    const normalized = text
      .replace(/\s+and\s+/gi, ",")  // Replace " and " with comma
      .replace(/\s+&\s+/g, ",")     // Replace " & " with comma
      .replace(/\s*&\s*/g, ",");    // Replace standalone & with comma
    
    // Split by multiple delimiters: comma, semicolon, pipe, newline, or dash WITH SPACES (not hyphens in ingredient names)
    // CRITICAL: Only split on hyphens that have spaces around them (e.g., "Water - Glycerin")
    // Do NOT split on hyphens without spaces (e.g., "Crosspolymer-6", "C10-30")
    let ingredients = normalized
      .split(/[,;\n|]+|\s+-\s+/)  // Split on comma, semicolon, newline, pipe, or dash WITH SPACES
      .map((ing) => ing.trim())
      .filter((ing) => ing.length > 0);  // Filter out empty strings
    
    // If still no split, return the whole text as single ingredient
    if (ingredients.length === 0) {
      ingredients = [text.trim()].filter(Boolean);
    }
    
    // Clean up: remove empty strings and trim whitespace
    return ingredients.map((ing) => ing.trim()).filter((ing) => ing.length > 0);
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
  const handleClaimClick = useCallback((ingredientName: string, ingredientId?: string | null) => {
    setSelectedIngredient(ingredientName);
    setSelectedIngredientId(ingredientId || null);
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
        ingredientId: selectedIngredientId,  // Pass ingredient ID if available
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
        setSelectedIngredientId(null);
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
  }, [formData, selectedIngredient, selectedIngredientId]);

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

  // Load history
  const loadHistory = useCallback(async () => {
    if (!userId) {
      console.warn("User ID not available, cannot load history");
      return;
    }
    setHistoryLoading(true);
    try {
      const result = await api.getDecodeHistory(
        {
          search: historySearch || undefined,
          limit: 50,
        },
        userId
      );
      setHistoryItems(result.items);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [historySearch, userId]);

  // Load history on mount and when search changes
  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory, historySearch, loadHistory]);

  // Load history item into form
  const loadHistoryItem = useCallback(async (item: {
    id: string;
    name: string;
    tag?: string;
    input_type: string;
    input_data: string;
    analysis_result: AnalyzeResponse;
    report_data?: string | null;
    expected_benefits?: string | null;
    created_at: string;
  }) => {
    // Set flags to prevent auto-generation
    setIsLoadingFromHistory(true);
    hasLoadedFromHistoryRef.current = true;
    
    // IMPORTANT: Restore report FIRST before setting other state
    // This ensures reportState.data is set before any effects run
    if (item.report_data) {
      console.log("Loading report from history:", item.report_data.substring(0, 100) + "...");
      setReportState({
        loading: false,
        data: item.report_data,
        pdfLoading: false,
      });
    } else {
      console.log("No report data in history item");
      setReportState({
        loading: false,
        data: null,
        pdfLoading: false,
      });
    }
    
    // Set input mode and data
    if (item.input_type === "inci") {
      setInputMode("inci");
      setText(item.input_data);
      setUrl("");
    } else {
      setInputMode("url");
      setUrl(item.input_data);
      setText("");
    }
    
    // Set name and tag
    setName(item.name);
    setTag(item.tag || "");
    
    // Restore expected benefits
    setExpectedBenefits(item.expected_benefits || "");
    
    // Restore analysis results
    setResp(item.analysis_result);
    
    // Set current history ID
    setCurrentHistoryId(item.id);
    
    // Set active tab to matched to show results
    setActiveTab("matched");
    
    // Close sidebar
    setShowHistory(false);
    
    // Reset flag after a longer delay to ensure all state updates are complete
    // If no report exists, we'll let the auto-generate effect handle it
    setTimeout(() => {
      setIsLoadingFromHistory(false);
      // If report doesn't exist, reset the ref so auto-generate can trigger
      if (!item.report_data) {
        hasLoadedFromHistoryRef.current = false;
        console.log("No report in history, auto-generate effect will handle it");
      }
    }, 500);
    
    // Fetch distributor info for all ingredients (same as after analysis)
    // Track both ingredient name and ID for mapping
    const ingredientMap = new Map<string, string | null>(); // name -> id
    const data = item.analysis_result;
    
    // Collect from branded ingredients (prefer grouped, fallback to flat list)
    if (data.branded_grouped) {
      data.branded_grouped.forEach((group: GroupItem) => {
        group.items.forEach((item: MatchedItem) => {
          ingredientMap.set(item.ingredient_name, item.ingredient_id || null);
        });
      });
    } else if (data.branded_ingredients) {
      data.branded_ingredients.forEach((item: MatchedItem) => {
        ingredientMap.set(item.ingredient_name, item.ingredient_id || null);
      });
    }
    
    // Collect from general ingredients (though they typically don't have distributors)
    if (data.general_ingredients_list) {
      data.general_ingredients_list.forEach((item: MatchedItem) => {
        ingredientMap.set(item.ingredient_name, item.ingredient_id || null);
      });
    }
    
    // Fallback to grouped for backward compatibility
    if (data.grouped && ingredientMap.size === 0) {
      data.grouped.forEach((group: GroupItem) => {
        group.items.forEach((item: MatchedItem) => {
          ingredientMap.set(item.ingredient_name, item.ingredient_id || null);
        });
      });
    }
    
    // Fetch distributor info for each ingredient (by both name and ID)
    if (ingredientMap.size > 0) {
      try {
        const distributorPromises = Array.from(ingredientMap.entries()).map(async ([ingredientName, ingredientId]) => {
          const distributors = await api.getDistributorsByIngredient(ingredientName, ingredientId);
          return { ingredientName, distributors };
        });
        
        const distributorResults = await Promise.all(distributorPromises);
        const distributorMap: Record<string, DistributorInfo[]> = {};
        distributorResults.forEach(({ ingredientName, distributors }) => {
          distributorMap[ingredientName] = distributors;
        });
        setDistributorInfo(distributorMap);
      } catch (error) {
        console.error("Error fetching distributor info:", error);
        // Don't block the user if distributor fetch fails
      }
    }
  }, [setShowHistory]);

  // Delete history item
  const deleteHistoryItem = useCallback(async (historyId: string) => {
    if (!userId) {
      window.alert("User ID not available");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this history item?")) {
      return;
    }
    try {
      await api.deleteDecodeHistory(historyId, userId);
      loadHistory();
    } catch (error) {
      console.error("Error deleting history:", error);
      window.alert("Failed to delete history item");
    }
  }, [loadHistory, userId]);

  // API callbacks
  const onAnalyze = useCallback(async () => {
    if (inputMode === "inci" && !parsed.length) return;
    if (inputMode === "url" && !extractedData?.ingredients.length) return;
    
    // Validate expected benefits is not empty
    if (!expectedBenefits.trim()) {
      window.alert("Please enter expected benefits before analyzing");
      return;
    }

    setLoading(true);
    try {
      let ingredientsToAnalyze = parsed;
      
      // If URL mode, use extracted ingredients
      if (inputMode === "url" && extractedData) {
        ingredientsToAnalyze = extractedData.ingredients;
      }

      const data = await api.analyzeIngredients({ inci_names: ingredientsToAnalyze });
      setResp(data);
      setActiveTab("matched");
      
      // Reset loading from history flags (in case it was set)
      setIsLoadingFromHistory(false);
      hasLoadedFromHistoryRef.current = false;
      
      // Save to history if name is provided and user is logged in
      // Note: Report will be saved later when it's generated
      if (name.trim() && userId) {
        try {
          const inputData = inputMode === "inci" ? text : url;
          const result = await api.saveDecodeHistory(
            {
              name: name.trim(),
              tag: tag.trim() || undefined,
              input_type: inputMode,
              input_data: inputData,
              analysis_result: data,
              report_data: null, // Will be updated when report is generated
              expected_benefits: expectedBenefits.trim() || null,
            },
            userId
          );
          // Store history ID so we can update it with report later
          setCurrentHistoryId(result.id);
          // Refresh history if sidebar is open
          if (showHistory) {
            loadHistory();
          }
        } catch (error) {
          console.error("Error saving history:", error);
          // Don't block the user if history save fails
        }
      }
      
      // Fetch distributor info for all ingredients
      // Track both ingredient name and ID for mapping
      const ingredientMap = new Map<string, string | null>(); // name -> id
      
      // Collect from branded ingredients (prefer grouped, fallback to flat list)
      if (data.branded_grouped) {
        data.branded_grouped.forEach((group: GroupItem) => {
          group.items.forEach((item: MatchedItem) => {
            ingredientMap.set(item.ingredient_name, item.ingredient_id || null);
          });
        });
      } else if (data.branded_ingredients) {
        data.branded_ingredients.forEach((item: MatchedItem) => {
          ingredientMap.set(item.ingredient_name, item.ingredient_id || null);
        });
      }
      
      // Collect from general ingredients (though they typically don't have distributors)
      if (data.general_ingredients_list) {
        data.general_ingredients_list.forEach((item: MatchedItem) => {
          ingredientMap.set(item.ingredient_name, item.ingredient_id || null);
        });
      }
      
      // Fallback to grouped for backward compatibility
      if (data.grouped && ingredientMap.size === 0) {
        data.grouped.forEach((group: GroupItem) => {
          group.items.forEach((item: MatchedItem) => {
            ingredientMap.set(item.ingredient_name, item.ingredient_id || null);
          });
        });
      }
      
      if (ingredientMap.size > 0) {
        
        // Fetch distributor info for each ingredient (by both name and ID)
        const distributorPromises = Array.from(ingredientMap.entries()).map(async ([ingredientName, ingredientId]) => {
          const distributors = await api.getDistributorsByIngredient(ingredientName, ingredientId);
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
  }, [parsed, inputMode, extractedData, name, tag, text, url, showHistory, loadHistory, userId, expectedBenefits]);

  const generateReport = useCallback(async () => {
    // Ensure we have analysis results before generating report
    if (!resp) {
      console.warn(
        "No analysis results available. Please analyze ingredients first.",
      );
      return;
    }

    // Extract all ingredients from analysis result if parsed is empty (e.g., when loading from history)
    let ingredientsList: string[] = parsed;
    if (!parsed.length) {
      // Build ingredient list from analysis result
      const allIngredients = new Set<string>();
      
      // Extract from branded ingredients
      if (resp.branded_ingredients) {
        resp.branded_ingredients.forEach((item) => {
          allIngredients.add(item.ingredient_name);
        });
      }
      
      // Extract from general ingredients
      if (resp.general_ingredients_list) {
        resp.general_ingredients_list.forEach((item) => {
          allIngredients.add(item.ingredient_name);
        });
      }
      
      // Extract from unable to decode
      if (resp.unable_to_decode) {
        resp.unable_to_decode.forEach((ingredient) => {
          allIngredients.add(ingredient);
        });
      }
      
      // Fallback to grouped structure
      if (allIngredients.size === 0 && resp.grouped) {
        resp.grouped.forEach((group) => {
          group.inci_list.forEach((inci) => {
            allIngredients.add(inci);
          });
        });
      }
      
      ingredientsList = Array.from(allIngredients);
      
      if (ingredientsList.length === 0) {
        console.warn("No ingredients found in analysis result");
        return;
      }
    }

    setReportState((prev) => ({ ...prev, loading: true }));
    try {
      // Extract branded and general ingredients from analyze_inci response
      const brandedIngredients: string[] = [];
      const notBrandedIngredients: string[] = [];

      // Extract branded ingredients (tag='B') - prefer grouped, fallback to flat list
      if (resp.branded_grouped) {
        resp.branded_grouped.forEach((group: GroupItem) => {
          group.inci_list.forEach((inci) => {
            if (!brandedIngredients.includes(inci)) {
              brandedIngredients.push(inci);
            }
          });
        });
      } else if (resp.branded_ingredients) {
        resp.branded_ingredients.forEach((item) => {
          item.matched_inci.forEach((inci) => {
            if (!brandedIngredients.includes(inci)) {
              brandedIngredients.push(inci);
            }
          });
        });
      }

      // Extract general ingredients (tag='G')
      if (resp.general_ingredients_list) {
        resp.general_ingredients_list.forEach((item) => {
          item.matched_inci.forEach((inci) => {
            if (!notBrandedIngredients.includes(inci)) {
              notBrandedIngredients.push(inci);
            }
          });
        });
      }

      // Fallback to old structure for backward compatibility
      if (brandedIngredients.length === 0 && resp.grouped) {
        resp.grouped.forEach((group) => {
          group.inci_list.forEach((inci) => {
            if (!brandedIngredients.includes(inci)) {
              brandedIngredients.push(inci);
            }
          });
        });
      }
      if (notBrandedIngredients.length === 0 && resp.unmatched) {
        notBrandedIngredients.push(...resp.unmatched);
      }

      // Extract BIS cautions from analyze_inci response
      const bisCautions = resp.bis_cautions || undefined;

      const data = await api.generateReport(
        ingredientsList,
        brandedIngredients,
        notBrandedIngredients,
        bisCautions,
        expectedBenefits.trim() || undefined,
      );
      setReportState((prev) => ({ ...prev, data, loading: false }));
      
      // Update history with report data if history ID exists
      // Convert JSON data to string for storage (backward compatibility)
      const reportDataString = typeof data === "object" ? JSON.stringify(data) : data;
      if (currentHistoryId && userId && reportDataString) {
        try {
          // Convert JSON data to string for storage (backward compatibility)
          const reportDataString = typeof data === "object" ? JSON.stringify(data) : data;
          await api.updateDecodeHistory(
            currentHistoryId,
            { report_data: reportDataString },
            userId
          );
        } catch (error) {
          console.error("Error updating history with report:", error);
          // Don't block the user if update fails
        }
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setReportState((prev) => ({
        ...prev,
        data: "Error generating report. Please try again.",
        loading: false,
      }));
    }
  }, [parsed, resp, currentHistoryId, userId, expectedBenefits]);

  // Auto-generate report when switching to analysis tab (only if report doesn't exist)
  useEffect(() => {
    // Don't auto-generate if:
    // 1. We're currently loading from history (to prevent regeneration during load)
    // 2. Report already exists (to prevent regeneration of stored reports)
    if (isLoadingFromHistory) {
      return; // Still loading, wait
    }
    
    // If report exists, reset the ref since we're done loading
    if (reportState.data) {
      hasLoadedFromHistoryRef.current = false;
      return; // Report exists, don't regenerate
    }
    
    // If we loaded from history but no report exists, allow auto-generation
    // The ref will be reset in loadHistoryItem if no report_data exists
    
    if (
      activeTab === "analysis" &&
      resp && // Ensure analysis results are available
      !reportState.loading // Don't generate if already generating
    ) {
      // Check if we have ingredients (either from parsed or can extract from resp)
      const hasIngredients = parsed.length > 0 || 
        (resp.branded_ingredients && resp.branded_ingredients.length > 0) ||
        (resp.general_ingredients_list && resp.general_ingredients_list.length > 0) ||
        (resp.grouped && resp.grouped.length > 0);
      
      if (hasIngredients) {
        generateReport();
      }
    }
  }, [
    activeTab,
    parsed.length,
    resp,
    reportState.data,
    reportState.loading,
    generateReport,
    isLoadingFromHistory,
    selectedIngredientId,
  ]);

  return (
    <div className="w-full px-4 py-6 relative">

      {/* History Sidebar - Slide in from left (ChatGPT style) */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-background border-r shadow-2xl z-40 transform transition-transform duration-300 ease-in-out",
          showHistory ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b flex items-center justify-between bg-muted/30">
            <h2 className="text-lg font-semibold">Decode History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Close sidebar"
              type="button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Unified Search */}
          <div className="p-4 border-b">
            <Input
              placeholder="Search by name or tag..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="h-9"
            />
          </div>
          
          {/* History List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {historyLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : historyItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No history found</p>
                  <p className="text-xs mt-1">Your decode history will appear here</p>
                </div>
              ) : (
                historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => loadHistoryItem(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            loadHistoryItem(item);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground mt-1.5">
                          {item.input_type === "inci" ? "INCI List" : "URL"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {(() => {
                            try {
                              const date = new Date(item.created_at);
                              if (isNaN(date.getTime())) {
                                return "";
                              }
                              // Show only date (no time)
                              return date.toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric"
                              });
                            } catch {
                              return "";
                            }
                          })()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded transition-opacity flex-shrink-0"
                        type="button"
                        aria-label="Delete history item"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setShowHistory(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Main Content */}
      <div className="w-full">
      {/* Top card */}
      <div className="bg-card border-border rounded-xl border p-6 shadow-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
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
          <div className="flex gap-2 border rounded-lg p-1 bg-muted/50 ml-4">
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

        {/* Name and Tag Inputs */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="decode-name" className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="decode-name"
              placeholder="e.g. Vitamin C Serum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <label htmlFor="decode-tag" className="block text-sm font-medium mb-1">
              Tag (optional)
            </label>
            <Input
              id="decode-tag"
              placeholder="e.g. skincare, serum"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="expected-benefits" className="block text-sm font-medium mb-1">
            Expected Benefits <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="expected-benefits"
            placeholder="e.g. Brightening, Anti-aging, Hydration, Acne control..."
            value={expectedBenefits}
            onChange={(e) => setExpectedBenefits(e.target.value)}
            className="h-20 resize-y"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the benefits you expect from this formulation. The report will analyze if these can be achieved.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {inputMode === "url" ? (
            <>
              {!extractedData && (
                <Button
                  variant={"contained"}
                  color={"primary"}
                  type="button"
                  onClick={onExtract}
                  disabled={extracting || loading || !url.trim()}
                >
                  <LinkIcon className="size-4" />
                  {extracting || loading ? "Analyzing…" : "Analyze"}
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
                disabled={loading || extracting || parsed?.length === 0}
              >
                <MagnifyingGlassIcon />
                {loading || extracting ? "Analyzing…" : "Analyze Ingredients"}
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
                  Your URL seems to contain these ingredients
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
              
              {/* Go Ahead Button - appears after ingredient list */}
              <div className="mt-4">
                <Button
                  variant={"contained"}
                  color={"primary"}
                  type="button"
                  onClick={onAnalyze}
                  disabled={loading || extracting}
                  className="w-full"
                >
                  <MagnifyingGlassIcon className="size-4" />
                  {loading || extracting ? "Analyzing…" : "Go Ahead"}
                </Button>
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
              active={activeTab === "matched"}
              onClick={() => setActiveTab("matched")}
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-600 text-[11px] font-bold text-white">
                  ⓘ
                </span>
              }
              label={"Matched Ingredients"}
              count={(resp.branded_grouped?.reduce((sum, group) => sum + group.count, 0) || resp.branded_ingredients?.length || 0) + (resp.general_ingredients_list?.length || 0)}
            />
            <TabButton
              active={activeTab === "unableToDecode"}
              onClick={() => setActiveTab("unableToDecode")}
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-red-600 text-[11px] text-white">
                  ⚠
                </span>
              }
              label="Unable to Analyze"
              count={resp.unable_to_decode?.length || resp.unmatched?.length || 0}
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

          {activeTab === "matched" && (
            <div className="space-y-6">
              {/* Sub-tabs for Actives/Excipients */}
              <div className="flex gap-2 border-b pb-2">
                <button
                  onClick={() => setMatchedSubTab("all")}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    matchedSubTab === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Ingredients
                </button>
                <button
                  onClick={() => setMatchedSubTab("actives")}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    matchedSubTab === "actives"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Actives
                </button>
                <button
                  onClick={() => setMatchedSubTab("excipients")}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    matchedSubTab === "excipients"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Excipients
                </button>
              </div>

              {/* Branded Ingredients Section - Grouped by INCI */}
              {resp.branded_grouped && resp.branded_grouped.length > 0 && (() => {
                // First, collect all unique ingredients across all groups to avoid duplicates
                const seenIngredients = new Set<string>(); // Track by ingredient_id or ingredient_name
                const allUniqueItems: MatchedItem[] = [];
                
                // Collect all items from all groups, deduplicating by ingredient_id or ingredient_name
                resp.branded_grouped.forEach((group: GroupItem) => {
                  group.items.forEach((item: MatchedItem) => {
                    // Use ingredient_id if available, otherwise use ingredient_name
                    const uniqueKey = item.ingredient_id || item.ingredient_name;
                    if (!seenIngredients.has(uniqueKey)) {
                      seenIngredients.add(uniqueKey);
                      allUniqueItems.push(item);
                    }
                  });
                });
                
                // Filter by category if sub-tab is selected
                const filteredItems = matchedSubTab === "all" 
                  ? allUniqueItems 
                  : allUniqueItems.filter((item: MatchedItem) => {
                      const category = item.category_decided?.toUpperCase();
                      // Only include items that have a category_decided value and it matches
                      if (!category) return false; // Exclude items without category
                      if (matchedSubTab === "actives") return category === "ACTIVE";
                      if (matchedSubTab === "excipients") return category === "EXCIPIENT";
                      return false; // Don't include items that don't match
                    });
                
                if (filteredItems.length === 0) {
                  return (
                    <div key="no-results" className="text-center py-8 text-gray-500">
                      No {matchedSubTab === "actives" ? "Actives" : matchedSubTab === "excipients" ? "Excipients" : ""} found in this category.
                    </div>
                  );
                }
                
                // Group filtered items by their matched INCI for display
                const itemsByInci = new Map<string, MatchedItem[]>();
                filteredItems.forEach((item: MatchedItem) => {
                  const inciKey = item.matched_inci?.sort().join(", ") || "Unknown";
                  if (!itemsByInci.has(inciKey)) {
                    itemsByInci.set(inciKey, []);
                  }
                  itemsByInci.get(inciKey)!.push(item);
                });
                
                return (
                  <div key="branded-ingredients" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <SectionTitle>Branded Ingredients</SectionTitle>
                      <span className="text-sm text-gray-600">({filteredItems.length} unique branded {filteredItems.length === 1 ? "ingredient" : "ingredients"})</span>
                    </div>
                    {Array.from(itemsByInci.entries()).map(([inciKey, items]) => {
                      // Use state to track "show more" for each INCI group
                      const showAll = expandedGroups.has(inciKey);
                      const displayItems = showAll ? items : items.slice(0, 3);
                      const hasMore = items.length > 3;
                      
                      const toggleShowAll = () => {
                        setExpandedGroups(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(inciKey)) {
                            newSet.delete(inciKey);
                          } else {
                            newSet.add(inciKey);
                          }
                          return newSet;
                        });
                      };
                      
                      return (
                      <div key={inciKey} className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {inciKey.split(", ").map((i) => (
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
                      >
                        {displayItems.map((item) => (
                          <AccordionItem
                            value={`${item.ingredient_id || item.ingredient_name}-${inciKey}`}
                            key={`${item.ingredient_id || item.ingredient_name}-${inciKey}`}
                            className="border-b last:border-b-0"
                          >
                            <AccordionTrigger className="px-5 py-4 hover:no-underline">
                              <div className="flex w-full items-center justify-between pr-4">
                                <div className="flex items-center gap-2">
                                  <h3 className="truncate text-lg font-medium capitalize">
                                    {item.ingredient_name}
                                  </h3>
                                </div>
                                <div className="text-muted-foreground flex items-center gap-2 shrink-0">
                                  {item.supplier_name && (
                                    <>
                                      <span className="text-sm">
                                        {item.supplier_name}
                                      </span>
                                      <BuildingStorefrontIcon className="size-5" />
                                    </>
                                  )}
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
                                {item.description && (
                                  <p className="text-sm leading-6 text-gray-700">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex justify-end pt-2 border-t">
                                  <div className="group relative">
                                    <Button
                                      variant="outlined"
                                      size="sm"
                                      onClick={() => handleClaimClick(item.ingredient_name, item.ingredient_id)}
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
                      {hasMore && (
                        <div className="flex justify-center pt-2">
                          <Button
                            variant="outlined"
                            size="sm"
                            onClick={toggleShowAll}
                            className="text-sm"
                          >
                            {showAll ? "Show Less" : `Show More (${items.length - 3} more)`}
                          </Button>
                        </div>
                      )}
                      </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Fallback to flat branded_ingredients if branded_grouped not available */}
              {(!resp.branded_grouped || resp.branded_grouped.length === 0) && resp.branded_ingredients && resp.branded_ingredients.length > 0 && (() => {
                // Deduplicate by ingredient_id or ingredient_name
                const seenIngredients = new Set<string>();
                const uniqueItems: MatchedItem[] = [];
                resp.branded_ingredients.forEach((item: MatchedItem) => {
                  const uniqueKey = item.ingredient_id || item.ingredient_name;
                  if (!seenIngredients.has(uniqueKey)) {
                    seenIngredients.add(uniqueKey);
                    uniqueItems.push(item);
                  }
                });
                
                // Filter by category if sub-tab is selected
                const filteredBrandedItems = matchedSubTab === "all" 
                  ? uniqueItems 
                  : uniqueItems.filter((item: MatchedItem) => {
                      const category = item.category_decided?.toUpperCase();
                      if (!category) return false; // Exclude items without category
                      if (matchedSubTab === "actives") return category === "ACTIVE";
                      if (matchedSubTab === "excipients") return category === "EXCIPIENT";
                      return false; // Don't include items that don't match
                    });
                
                if (filteredBrandedItems.length === 0 && matchedSubTab !== "all") {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      No {matchedSubTab === "actives" ? "Actives" : matchedSubTab === "excipients" ? "Excipients" : ""} found in this category.
                    </div>
                  );
                }
                
                // Group by matched INCI for better organization
                const itemsByInci = new Map<string, MatchedItem[]>();
                filteredBrandedItems.forEach((item: MatchedItem) => {
                  const inciKey = item.matched_inci?.sort().join(", ") || "Unknown";
                  if (!itemsByInci.has(inciKey)) {
                    itemsByInci.set(inciKey, []);
                  }
                  itemsByInci.get(inciKey)!.push(item);
                });
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <SectionTitle>Branded Ingredients</SectionTitle>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                        B
                      </Badge>
                      <span className="text-sm text-gray-600">({filteredBrandedItems.length} unique branded {filteredBrandedItems.length === 1 ? "ingredient" : "ingredients"})</span>
                    </div>
                    {Array.from(itemsByInci.entries()).map(([inciKey, items]) => {
                      const showAll = expandedGroups.has(inciKey);
                      const displayItems = showAll ? items : items.slice(0, 3);
                      const hasMore = items.length > 3;
                      
                      const toggleShowAll = () => {
                        setExpandedGroups(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(inciKey)) {
                            newSet.delete(inciKey);
                          } else {
                            newSet.add(inciKey);
                          }
                          return newSet;
                        });
                      };
                      
                      return (
                        <div key={inciKey} className="space-y-3">
                          <div className="flex flex-wrap gap-1.5">
                            {inciKey.split(", ").map((i) => (
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
                          >
                            {displayItems.map((item) => (
                              <AccordionItem
                                value={`${item.ingredient_id || item.ingredient_name}-${inciKey}`}
                                key={`${item.ingredient_id || item.ingredient_name}-${inciKey}`}
                                className="border-b last:border-b-0"
                              >
                                <AccordionTrigger className="px-5 py-4 hover:no-underline">
                                  <div className="flex w-full items-center justify-between pr-4">
                                    <div className="flex items-center gap-2">
                                      <h3 className="truncate text-lg font-medium capitalize">
                                        {item.ingredient_name}
                                      </h3>
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-2 shrink-0">
                                      {item.supplier_name && (
                                        <>
                                          <span className="text-sm">
                                            {item.supplier_name}
                                          </span>
                                          <BuildingStorefrontIcon className="size-5" />
                                        </>
                                      )}
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
                                    {item.description && (
                                      <p className="text-sm leading-6 text-gray-700">
                                        {item.description}
                                      </p>
                                    )}
                                    <div className="flex justify-end pt-2 border-t">
                                      <div className="group relative">
                                        <Button
                                          variant="outlined"
                                          size="sm"
                                          onClick={() => handleClaimClick(item.ingredient_name, item.ingredient_id)}
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
                          {hasMore && (
                            <div className="flex justify-center pt-2">
                              <Button
                                variant="outlined"
                                size="sm"
                                onClick={toggleShowAll}
                                className="text-sm"
                              >
                                {showAll ? "Show Less" : `Show More (${items.length - 3} more)`}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* General Ingredients Section */}
              {resp.general_ingredients_list && resp.general_ingredients_list.length > 0 && (() => {
                // Filter by category if sub-tab is selected (though general ingredients typically don't have category_decided)
                const filteredGeneralItems = matchedSubTab === "all" 
                  ? resp.general_ingredients_list 
                  : resp.general_ingredients_list.filter((item: MatchedItem) => {
                      const category = item.category_decided?.toUpperCase();
                      if (!category) return false; // Exclude items without category
                      if (matchedSubTab === "actives") return category === "ACTIVE";
                      if (matchedSubTab === "excipients") return category === "EXCIPIENT";
                      return false; // Don't include items that don't match
                    });
                
                if (filteredGeneralItems.length === 0 && matchedSubTab !== "all") {
                  return null; // Don't show section if no items match
                }
                
                return (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <SectionTitle>General INCI Ingredients</SectionTitle>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                      G
                    </Badge>
                    <span className="text-sm text-gray-600">({filteredGeneralItems.length})</span>
                  </div>
                  {filteredGeneralItems.map((item) => (
                    <div key={item.ingredient_name} className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {item.matched_inci?.map((i) => (
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
                      >
                        <AccordionItem
                          value={item.ingredient_name}
                          key={item.ingredient_name}
                          className="border-b last:border-b-0"
                        >
                          <AccordionTrigger className="px-5 py-4 hover:no-underline">
                            <div className="flex w-full items-center justify-between pr-4">
                              <div className="flex items-center gap-2">
                                <h3 className="truncate text-lg font-medium capitalize">
                                  {item.ingredient_name}
                                </h3>
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 text-xs">
                                  G
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-4">
                            <div className="space-y-4">
                              {item.description && (
                                <p className="text-sm leading-6 text-gray-700">
                                  {item.description}
                                </p>
                              )}
                              <p className="text-sm text-gray-500 italic">
                                This is a standard INCI ingredient (not branded).
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ))}
                </div>
                );
              })()}

              {/* Fallback to grouped if new fields not available (backward compatibility) */}
              {(!resp.branded_ingredients || resp.branded_ingredients.length === 0) && 
               (!resp.general_ingredients_list || resp.general_ingredients_list.length === 0) && 
               resp.grouped && resp.grouped.length > 0 && (
                <div className="space-y-4">
                  {resp.grouped.map((m: GroupItem) => {
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
                                        onClick={() => handleClaimClick(item.ingredient_name, item.ingredient_id)}
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
            </div>
          )}

          {activeTab === "unableToDecode" && (
            <div className="space-y-4">
              <SectionTitle>Unable to Analyze</SectionTitle>
              <p className="text-sm text-gray-600">
                These ingredients could not be found in our database even after:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Direct MongoDB query (exact match)</li>
                  <li>Fuzzy matching (spelling mistakes)</li>
                  <li>CAS API synonym lookup</li>
                  <li>General INCI collection check</li>
                </ul>
                They may be misspelled, proprietary names, or not yet in our database.
              </p>
              <div className="flex flex-wrap gap-2">
                {(resp.unable_to_decode || resp.unmatched || []).map((u) => (
                  <Badge
                    variant={"outline"}
                    className="text-muted-foreground border-red-300 capitalize bg-red-50 text-red-700"
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


                {reportState.data && typeof reportState.data === "object" && (
                  <div className="mt-6">
                    <div className="rounded-lg border bg-white p-6">
                      <FormulationReportViewer reportData={reportState.data} />
                    </div>
                  </div>
                )}
                {reportState.data && typeof reportState.data === "string" && (() => {
                  // Try to parse JSON string and display as formatted report
                  try {
                    const parsedData = JSON.parse(reportState.data);
                    // Check if it's a valid FormulationReportData object
                    if (parsedData && typeof parsedData === "object" && parsedData.inci_list && parsedData.analysis_table) {
                      return (
                        <div className="mt-6">
                          <div className="rounded-lg border bg-white p-6">
                            <FormulationReportViewer reportData={parsedData} />
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {
                    // Not valid JSON, check if it's HTML
                    if (reportState.data.includes("<html")) {
                      return (
                        <div className="mt-6">
                          <div className="rounded-lg border bg-white p-4">
                            <h3 className="mb-3 text-sm font-medium text-gray-900">
                              Report Preview
                            </h3>
                            <div className="max-h-96 overflow-y-auto rounded-lg border">
                              <iframe
                                srcDoc={reportState.data}
                                className="h-96 w-full border-0"
                                title="Formulation Report Preview"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }
                  }
                  
                  // Fallback: display as raw text (for error messages, etc.)
                  return (
                    <div className="mt-6">
                      <div className="rounded-lg border bg-white p-4">
                        <h3 className="mb-3 text-sm font-medium text-gray-900">
                          Report Preview
                        </h3>
                        <div className="max-h-96 overflow-y-auto rounded-lg border">
                          <pre className="p-4 font-mono text-xs whitespace-pre-wrap text-gray-700">
                            {reportState.data}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                

                {!parsed.length && !resp && !reportState.data && (
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
    </div>
  );
}

function textEnding(n: number) {
  return n === 1 ? "" : "s";
}

const DecodeFormulations = () => {
  const [showHistory, setShowHistory] = useState(false);
  
  return (
    <PageContent
      ariaLabel="decode-formulations"
      header={{
        title: "Decode Formulations",
        description: "Analyze and decode existing formulations with detailed ingredient breakdown",
        hasBack: true,
        animate: true,
        actions: (
          <Button
            variant="outlined"
            onClick={() => setShowHistory(!showHistory)}
            type="button"
          >
            {showHistory ? (
              <>
                <XMarkIcon className="h-4 w-4 mr-2" />
                Close
              </>
            ) : (
              "History"
            )}
          </Button>
        ),
      }}
    >
      <IngredientAnalyzer showHistory={showHistory} setShowHistory={setShowHistory} />
    </PageContent>
  );
};

export default DecodeFormulations;
