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
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  onDownloadPDF?: () => void;
}

export function FormulationReportViewer({
  reportData,
  onDownloadPDF,
}: FormulationReportViewerProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const downloadPDF = () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'p' as const,
        unit: 'mm' as const,
        format: 'a4' as const
      });
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.text("FormulationLooker 1.0", 105, yPos, { align: "center" });
      yPos += 10;
      doc.setFontSize(12);
      doc.text("Professional Cosmetic Formulation Analysis", 105, yPos, {
        align: "center",
      });
      yPos += 15;

      // 1) Submitted INCI List
      doc.setFontSize(16);
      doc.text("1) Submitted INCI List", 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      reportData.inci_list.forEach((ingredient) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${ingredient}`, 20, yPos);
        yPos += 6;
      });
      yPos += 10;

      // 2) Analysis Table
      if (reportData.analysis_table.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(16);
        doc.text("2) Analysis", 14, yPos);
        yPos += 10;

        const analysisData = reportData.analysis_table.map((row) => {
          // Handle both array format and object with cells property
          if (Array.isArray(row)) {
            return row;
          }
          return row.cells || [];
        });
        if (analysisData.length > 0 && analysisData[0].length > 0) {
          // Use first row as headers if available
          const headers = analysisData[0];
          const rows = analysisData.slice(1);

          (doc as any).autoTable({
            startY: yPos,
            head: [headers],
            body: rows,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [0, 123, 255] },
            margin: { left: 14, right: 14 },
            didParseCell: function(data: any) {
              // Handle multi-line cells
              if (data.cell.text && data.cell.text.length > 0) {
                const text = data.cell.text[0];
                if (typeof text === 'string' && text.includes('\n')) {
                  data.cell.text = text.split('\n');
                }
              }
            }
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;
        }
      }

      // 3) Compliance Panel
      if (reportData.compliance_panel.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(16);
        doc.text("3) Compliance Panel", 14, yPos);
        yPos += 10;

        const complianceData = reportData.compliance_panel.map((row) => {
          return Array.isArray(row) ? row : (row.cells || []);
        });
        if (complianceData.length > 0) {
          const headers = complianceData[0];
          const rows = complianceData.slice(1);

          (doc as any).autoTable({
            startY: yPos,
            head: [headers],
            body: rows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 123, 255] },
            margin: { left: 14, right: 14 },
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;
        }
      }

      // 4) Preservative Efficacy
      if (reportData.preservative_efficacy.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(16);
        doc.text("4) Preservative Efficacy Check", 14, yPos);
        yPos += 10;

        const preservativeData = reportData.preservative_efficacy.map((row) => {
          return Array.isArray(row) ? row : (row.cells || []);
        });
        if (preservativeData.length > 0) {
          const headers = preservativeData[0];
          const rows = preservativeData.slice(1);

          (doc as any).autoTable({
            startY: yPos,
            head: [headers],
            body: rows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 123, 255] },
            margin: { left: 14, right: 14 },
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;
        }
      }

      // 5) Risk Panel
      if (reportData.risk_panel.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(16);
        doc.text("5) Risk Panel", 14, yPos);
        yPos += 10;

        const riskData = reportData.risk_panel.map((row) => {
          return Array.isArray(row) ? row : (row.cells || []);
        });
        if (riskData.length > 0) {
          const headers = riskData[0];
          const rows = riskData.slice(1);

          (doc as any).autoTable({
            startY: yPos,
            head: [headers],
            body: rows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 123, 255] },
            margin: { left: 14, right: 14 },
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;
        }
      }

      // 6) Cumulative Benefit Panel
      if (reportData.cumulative_benefit.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(16);
        doc.text("6) Cumulative Benefit Panel", 14, yPos);
        yPos += 10;

        const benefitData = reportData.cumulative_benefit.map((row) => {
          return Array.isArray(row) ? row : (row.cells || []);
        });
        if (benefitData.length > 0) {
          const headers = benefitData[0];
          const rows = benefitData.slice(1);

          (doc as any).autoTable({
            startY: yPos,
            head: [headers],
            body: rows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 123, 255] },
            margin: { left: 14, right: 14 },
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;
        }
      }

      // 7) Claim Panel
      if (reportData.claim_panel.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(16);
        doc.text("7) Claim Panel", 14, yPos);
        yPos += 10;

        const claimData = reportData.claim_panel.map((row) => {
          return Array.isArray(row) ? row : (row.cells || []);
        });
        if (claimData.length > 0) {
          const headers = claimData[0];
          const rows = claimData.slice(1);

          (doc as any).autoTable({
            startY: yPos,
            head: [headers],
            body: rows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 123, 255] },
            margin: { left: 14, right: 14 },
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;
        }
      }

      // 8) Recommended pH Range
      if (reportData.recommended_ph_range) {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(16);
        doc.text("8) Recommended pH Range", 14, yPos);
        yPos += 10;
        doc.setFontSize(11);
        // Split long text into multiple lines if needed
        const phText = reportData.recommended_ph_range;
        const splitText = doc.splitTextToSize(phText, 180); // 180mm width
        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 6 + 10; // 6mm per line
      }

      // 9) Expected Benefits Analysis
      if (reportData.expected_benefits_analysis.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(16);
        doc.text("9) Expected Benefits Analysis", 14, yPos);
        yPos += 10;

        const benefitsData = reportData.expected_benefits_analysis.map((row) => {
          return Array.isArray(row) ? row : (row.cells || []);
        });
        if (benefitsData.length > 0) {
          const headers = benefitsData[0];
          const rows = benefitsData.slice(1);

          (doc as any).autoTable({
            startY: yPos,
            head: [headers],
            body: rows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 123, 255] },
            margin: { left: 14, right: 14 },
          });
        }
      }

      // Save PDF
      doc.save("formulation-report.pdf");
      if (onDownloadPDF) {
        onDownloadPDF();
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const renderTable = (rows: ReportTableRow[], title: string) => {
    if (rows.length === 0) return null;

    // Use first row as headers if available
    const headers = rows[0]?.cells || [];
    const dataRows = rows.slice(1);

    return (
      <div className="mb-8 bg-white rounded-lg border-2 border-gray-200 shadow-sm p-6">
        <h3 className="mb-4 text-xl font-bold text-indigo-700 border-b-2 border-indigo-200 pb-2">{title}</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, idx) => (
                  <TableHead key={idx} className="bg-gray-50 font-medium">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataRows.map((row, rowIdx) => (
                <TableRow 
                  key={rowIdx}
                  className="hover:bg-gray-50 transition-colors [&_td]:font-normal [&_td]:!font-normal"
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

