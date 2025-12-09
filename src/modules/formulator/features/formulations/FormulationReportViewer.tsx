import React, { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { FileText } from "lucide-react";

// Types
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

interface FormulationReportViewerProps {
  reportData: FormulationReportData;
  onDownloadPPT?: () => void;
  onGeneratePPT?: () => void;
  isGeneratingPPT?: boolean;
}

export function FormulationReportViewer({
  reportData,
  onDownloadPPT,
  onGeneratePPT,
  isGeneratingPPT: externalIsGeneratingPPT,
}: FormulationReportViewerProps) {
  const [internalIsGeneratingPPT, setInternalIsGeneratingPPT] = useState(false);
  const isGeneratingPPT = externalIsGeneratingPPT !== undefined ? externalIsGeneratingPPT : internalIsGeneratingPPT;

  const renderTable = (rows: ReportTableRow[], title: string) => {
    if (rows.length === 0) return null;

    // Backend now always includes headers as the first row
    // Use first row as headers, rest as data
    const headers = rows[0]?.cells || [];
    const dataRows = rows.slice(1);
    
    // If no headers found, use defaults based on table type
    if (headers.length === 0) {
      if (title === "2) Analysis") {
        headers.push("Ingredient", "Category", "Functions/Notes", "BIS Cautions");
      } else if (title === "3) Compliance Panel") {
        headers.push("Regulation", "Status", "Requirements");
      } else if (title === "4) Preservative Efficacy Check") {
        headers.push("Preservative", "Efficacy", "pH Range", "Stability");
      } else if (title === "5) Risk Panel") {
        headers.push("Risk Factor", "Level", "Mitigation");
      } else if (title === "6) Cumulative Benefit Panel") {
        headers.push("Benefit", "Mechanism", "Evidence Level");
      } else if (title === "7) Claim Panel") {
        headers.push("Claim", "Support Level", "Evidence");
      } else if (title === "9) Expected Benefits Analysis") {
        headers.push("Expected Benefit", "Can Be Achieved?", "Supporting Ingredients", "Evidence/Mechanism", "Limitations");
      }
    }

    return (
      <div className="mb-8 bg-white rounded-lg border-2 border-gray-200 shadow-sm p-6">
        <h3 className="mb-4 text-xl font-bold text-indigo-700 border-b-2 border-indigo-200 pb-2">{title}</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <Table>
            <TableHeader>
              <TableRow className="border-b-0">
                {headers.map((header, idx) => (
                  <TableHead key={idx} className="bg-gray-50 font-normal text-muted-foreground border-b-0">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataRows.map((row, rowIdx) => (
                <TableRow 
                  key={rowIdx}
                  className="hover:bg-gray-50 transition-colors [&_td]:font-normal [&_td]:!font-normal border-b-0"
                >
                  {row.cells.map((cell, cellIdx) => {
                    // Check if this is the BIS Cautions column (usually last column)
                    const isBisCautions = headers[cellIdx]?.toLowerCase().includes("bis cautions");
                    return (
                      <TableCell
                        key={cellIdx}
                        className={`whitespace-normal break-words font-normal !font-normal [&_*]:!font-normal ${
                          rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                        style={{ fontWeight: 'normal', fontStyle: 'normal' }}
                      >
                        {isBisCautions ? (
                          <div className="space-y-2">
                            {cell.split(/\n+/).filter(line => line.trim()).map((line, lineIdx) => {
                              const trimmedLine = line.trim();
                              // Format numbered lists properly (1., 2., 3., etc.) - be more flexible with spacing
                              if (/^\d+\.\s*/.test(trimmedLine)) {
                                return (
                                  <div key={lineIdx} className="text-sm text-gray-800 pl-4 font-normal">
                                    {trimmedLine}
                                  </div>
                                );
                              }
                              // Also check for patterns like "1)" or "-" at start
                              if (/^[\d]+\)\s*/.test(trimmedLine) || /^-\s*/.test(trimmedLine)) {
                                return (
                                  <div key={lineIdx} className="text-sm text-gray-800 pl-4 font-normal">
                                    {trimmedLine}
                                  </div>
                                );
                              }
                              // Format regular sentences - ensure they end with proper punctuation
                              if (trimmedLine.length > 0) {
                                // Check if it's already a complete sentence
                                const isComplete = trimmedLine.match(/[.!?]$/);
                                return (
                                  <div key={lineIdx} className="text-sm text-gray-800 leading-relaxed font-normal">
                                    {isComplete ? trimmedLine : `${trimmedLine}.`}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        ) : (
                          <span className="font-normal">
                            {cell.split("\n").map((line, lineIdx) => (
                              <React.Fragment key={lineIdx}>
                                {line}
                                {lineIdx < cell.split("\n").length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const handlePPTButtonClick = async () => {
    if (onGeneratePPT) {
      // Use the new generate and preview function
      await onGeneratePPT();
    } else if (onDownloadPPT) {
      // Fallback to old download function
      setInternalIsGeneratingPPT(true);
      try {
        await onDownloadPPT();
      } catch (error) {
        console.error("Error downloading PPT:", error);
        alert("Failed to generate PPT. Please try again.");
      } finally {
        setInternalIsGeneratingPPT(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-indigo-200 pb-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            FormulationLooker 1.0
          </h2>
          <p className="text-sm text-gray-700 font-medium mt-1">
            Professional Cosmetic Formulation Analysis
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePPTButtonClick}
            disabled={isGeneratingPPT}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGeneratingPPT ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating PPT...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate & Preview PPT
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1) Submitted INCI List */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="mb-4 text-xl font-bold text-indigo-700">
          1) Submitted INCI List
        </h3>
        <div className="flex flex-wrap gap-2">
          {reportData.inci_list.map((ingredient, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 text-sm"
            >
              {ingredient}
            </Badge>
          ))}
        </div>
      </div>

      {/* 2) Analysis Table */}
      {renderTable(reportData.analysis_table, "2) Analysis")}

      {/* 3) Compliance Panel */}
      {renderTable(reportData.compliance_panel, "3) Compliance Panel")}

      {/* 4) Preservative Efficacy Check */}
      {renderTable(
        reportData.preservative_efficacy,
        "4) Preservative Efficacy Check"
      )}

      {/* 5) Risk Panel */}
      {renderTable(reportData.risk_panel, "5) Risk Panel")}

      {/* 6) Cumulative Benefit Panel */}
      {renderTable(
        reportData.cumulative_benefit,
        "6) Cumulative Benefit Panel"
      )}

      {/* 7) Claim Panel */}
      {renderTable(reportData.claim_panel, "7) Claim Panel")}

      {/* 8) Recommended pH Range */}
      {reportData.recommended_ph_range && (
        <div className="mb-8 bg-white rounded-lg border-2 border-gray-200 shadow-sm p-6">
          <h3 className="mb-4 text-xl font-bold text-indigo-700 border-b-2 border-indigo-200 pb-2">
            8) Recommended pH Range
          </h3>
          <div className="mt-4">
            <p className="text-gray-700 leading-relaxed text-base">
              {reportData.recommended_ph_range}
            </p>
          </div>
        </div>
      )}

      {/* 9) Expected Benefits Analysis */}
      {renderTable(
        reportData.expected_benefits_analysis,
        "9) Expected Benefits Analysis"
      )}
    </div>
  );
}

