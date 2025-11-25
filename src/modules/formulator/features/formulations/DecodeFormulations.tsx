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
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
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

const api = {
  async analyzeIngredients(req: AnalyzeRequest): Promise<AnalyzeResponse> {
    const response = await axios.post(
      `${basePythonApiUrl}/api/analyze-inci`,
      req,
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

function IngredientAnalyzer() {
  // State management
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AnalyzeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("grouped");
  const [reportState, setReportState] = useState<ReportState>({
    loading: false,
    data: null,
    pdfLoading: false,
  });
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

  // API callbacks
  const onAnalyze = useCallback(async () => {
    if (!parsed.length) return;

    setLoading(true);
    try {
      const data = await api.analyzeIngredients({ inci_names: parsed });
      setResp(data);
      setActiveTab("grouped");
    } catch (error) {
      console.error("Error analyzing ingredients:", error);
    } finally {
      setLoading(false);
    }
  }, [parsed]);

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
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-4">
                            <p className="text-sm leading-6 text-gray-700">
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
