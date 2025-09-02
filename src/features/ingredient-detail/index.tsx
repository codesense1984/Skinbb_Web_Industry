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

  async generateReport(inciList: string[]): Promise<string> {
    const response = await axios.post(
      `${basePythonApiUrl}/api/formulation-report`,
      { inciList },
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

    setReportState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await api.generateReport(parsed);
      setReportState((prev) => ({ ...prev, data, loading: false }));
    } catch (error) {
      console.error("Error generating report:", error);
      setReportState((prev) => ({
        ...prev,
        data: "Error generating report. Please try again.",
        loading: false,
      }));
    }
  }, [parsed]);

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
      alert("Error downloading PDF. Please try again.");
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
      !reportState.data &&
      !reportState.loading
    ) {
      generateReport();
    }
  }, [
    activeTab,
    parsed.length,
    reportState.data,
    reportState.loading,
    generateReport,
  ]);

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
                We couldn't match these items to branded ingredients. Check
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
