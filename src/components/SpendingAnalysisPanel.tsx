/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Transaction, AppLanguage } from "../types";
import { AlertTriangle, TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Tag, HelpCircle, ChevronDown, ListFilter } from "lucide-react";
import { I18N_TRANSLATIONS } from "../data";

interface SpendingAnalysisPanelProps {
  transactions: Transaction[];
  language: AppLanguage;
  onExplainSuggestion: (recommendation: string, context: string) => void;
}

export default function SpendingAnalysisPanel({
  transactions = [],
  language,
  onExplainSuggestion,
}: SpendingAnalysisPanelProps) {
  const t = I18N_TRANSLATIONS[language];
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"list" | "charts">("list");

  // Filter logic
  const filteredTx = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "anomalies") return tx.anomaly === true;
    return tx.category === filter;
  });

  // Calculate stats
  const totalDebited = transactions
    .filter((tx) => tx.type === "debit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Group by category for donut chart
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === "debit")
    .forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

  const categoriesColors: Record<string, string> = {
    Food: "#F59E0B", // Amber
    Fuel: "#3B82F6", // Blue
    Shopping: "#EC4899", // Pink
    Bills: "#10B981", // Green
    "Rent/EMI": "#EF4444", // Red
    Entertainment: "#8B5CF6", // Purple
    Healthcare: "#14B8A6", // Teal
    Travel: "#6366F1", // Indigo
    Investments: "#06B6D4", // Cyan
  };

  const donutSegments = Object.keys(categoryTotals).map((cat) => ({
    category: cat,
    amount: categoryTotals[cat],
    percentage: Math.round((categoryTotals[cat] / totalDebited) * 100),
    color: categoriesColors[cat] || "#64748B",
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Wallet className="w-5 h-5 text-idbi-orange" />
            {t.spending}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Full audit of categorized transactions & anomaly detectors
          </p>
        </div>
        {/* Toggle between list and analytics */}
        <div className="rounded-xl bg-slate-950/40 p-1 flex gap-1 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("list")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "list" ? "bg-idbi-orange text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Ledger list
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "charts" ? "bg-idbi-orange text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Analytics Vis
          </button>
        </div>
      </div>

      {/* Flagged spending anomaly BANNER */}
      <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">
            {t.anomalyAlert} (32% surge on Food)
          </h4>
          <p className="text-slate-200 text-xs leading-relaxed">
            Your Food expenditure is ₹24,420 this month vs. a 3-month rolling average of ₹18,500 (+32%). Primarily driven by dual anomalies: <strong className="text-white">₹4,890 Swiggy dineout</strong> & <strong className="text-white">₹9,500 DMart stocking</strong>.
          </p>
          <button
            onClick={() =>
              onExplainSuggestion(
                "Your Food expenditure is ₹24,420 this month vs. a 3-month rolling average of ₹18,500 (+32%), driven by ₹4,890 Swiggy Dineout gourmet surges.",
                "Food Spending Anomaly Alert"
              )
            }
            className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-mono transition mt-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {t.explainThis}
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <div className="space-y-4">
          {/* Filters controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/20 px-4 py-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-2">
              <ListFilter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Filter categories:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["all", "anomalies", "Food", "Shopping", "Bills", "Rent/EMI", "Investments"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`rounded-lg px-3 py-1 text-[10px] font-semibold font-mono border transition cursor-pointer ${
                    filter === cat
                      ? "bg-idbi-orange border-idbi-orange text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat === "all" ? "All ledger" : cat === "anomalies" ? "⚠️ Anomalies" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger body */}
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {filteredTx.map((tx) => (
              <div
                key={tx.id}
                className={`rounded-xl border p-4 flex flex-col gap-2.5 transition-all ${
                  tx.anomaly
                    ? "border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10"
                    : "border-slate-800/80 bg-slate-950/15 hover:border-slate-700 hover:bg-slate-800/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 shrink-0 ${
                      tx.type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800/60 text-slate-300"
                    }`}>
                      {tx.type === "credit" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 font-sans">{tx.description}</h4>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })} • {tx.merchant || "Direct Transfer"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-xs ${tx.type === "credit" ? "text-emerald-400" : "text-white"}`}>
                      {tx.type === "credit" ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                    <span
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full border block mt-1.5 text-center"
                      style={{
                        borderColor: `${categoriesColors[tx.category]}20`,
                        color: categoriesColors[tx.category],
                        backgroundColor: `${categoriesColors[tx.category]}08`,
                      }}
                    >
                      {tx.category}
                    </span>
                  </div>
                </div>

                {/* Anomaly expanded details */}
                {tx.anomaly && tx.anomalyReason && (
                  <div className="rounded-lg bg-slate-950/40 p-2.5 border border-amber-500/10 text-[10px] text-slate-300 flex items-start gap-1.5 italic">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Advisor Note:</strong> {tx.anomalyReason}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Custom SVG Donut allocation */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Expenditure share by category:
            </span>

            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Simple custom Donut Chart */}
              <svg className="transform -rotate-90" width="160" height="160">
                {/* Fallback track */}
                <circle cx="80" cy="80" r="60" className="stroke-slate-800" strokeWidth="16" fill="transparent" />
                {/* Dynamically layered segments based on percentages */}
                {(() => {
                  let accumulatedPercent = 0;
                  const radius = 60;
                  const circ = radius * 2 * Math.PI;

                  return donutSegments.map((segment, index) => {
                    const strokeOffset = circ - (segment.percentage / 100) * circ;
                    const rotateVal = (accumulatedPercent / 100) * 360;
                    accumulatedPercent += segment.percentage;

                    return (
                      <circle
                        key={index}
                        cx="80"
                        cy="80"
                        r={radius}
                        className="transition-all duration-500 hover:stroke-[18px]"
                        stroke={segment.color}
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={circ}
                        strokeDashoffset={strokeOffset}
                        transform={`rotate(${rotateVal} 80 80)`}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-xl font-bold text-white font-sans">
                  ₹{(totalDebited / 1000).toFixed(0)}K
                </span>
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">
                  Debits Total
                </span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Legend:</span>
            <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto">
              {donutSegments.map((segment, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-950/20 border border-slate-800/40 p-2 text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
                    <span className="text-slate-300 truncate">{segment.category}</span>
                  </div>
                  <span className="font-mono text-white font-bold">{segment.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
