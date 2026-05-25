"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  Globe2, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  HeartPulse,
  SlidersHorizontal,
  TrendingDown
} from "lucide-react";

interface ChecklistItem {
  itemKey: string;
  originalQuestion: string;
  status: string;
  extractedDetails: string;
}

interface CallAnalysis {
  overallMood: "GOOD" | "CONCERNED" | string;
  summary: string;
  checklist: ChecklistItem[];
}

interface CallRecord {
  callSid: string;
  phoneNumber: string;
  status: "INITIATED" | "IN_PROGRESS" | "COMPLETED" | string;
  scheduledAt: string;
  completedAt: string | null;
  languageDetected: string;
  rawTranscript: string | null;
  analysis: CallAnalysis | null;
}

interface OverviewData {
  summary: {
    totalCallsRouted: number;
    successfulCheckins: number;
    criticalEscalations: number;
    globalComplianceRate: number;
  };
  timestamp: string;
}

// Support both chronology settings and all dynamic string-based filters
type SortOption = "DATE_DESC" | "DATE_ASC" | string;

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCallSid, setExpandedCallSid] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("DATE_DESC");

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [overviewRes, callsRes] = await Promise.all([
        fetch("/api/dashboard/overview"),
        fetch("/api/dashboard/calls")
      ]);

      if (!overviewRes.ok || !callsRes.ok) {
        throw new Error("Failed to fetch operational data from background services.");
      }

      const overviewData = await overviewRes.json();
      const callsData = await callsRes.json();

      setOverview(overviewData);
      setCalls(callsData.calls || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred loading the dashboard.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleCallExpand = (callSid: string) => {
    setExpandedCallSid(expandedCallSid === callSid ? null : callSid);
  };

  // --- Dynamic Unique Mood Registry Scanner ---
  const dynamicMoodsList = useMemo(() => {
    const moodsSet = new Set<string>();
    calls.forEach(c => {
      if (c.analysis?.overallMood) {
        moodsSet.add(c.analysis.overallMood.toUpperCase().trim());
      }
    });
    return Array.from(moodsSet);
  }, [calls]);

  // --- Flexible Filter / Sort Processing Engine ---
  const processedCalls = useMemo(() => {
    let result = [...calls];
    
    // If the selection isn't explicitly standard date configurations, evaluate it as a strict category filter
    if (sortBy !== "DATE_DESC" && sortBy !== "DATE_ASC") {
      result = result.filter(c => c.analysis?.overallMood?.toUpperCase() === sortBy);
    }

    return result.sort((a, b) => {
      const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;

      if (sortBy === "DATE_ASC") return timeA - timeB;
      // Default standard chronological fallback (newest logs first)
      return timeB - timeA;
    });
  }, [calls, sortBy]);

  // --- Analytics Curve Generator Engine ---
  const dynamicChartData = useMemo(() => {
    const dailyMap: Record<string, { total: number; concerned: number }> = {};
    
    calls.forEach(call => {
      if (!call.scheduledAt || isNaN(Date.parse(call.scheduledAt))) return;
      const dateKey = new Date(call.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" });
      
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { total: 0, concerned: 0 };
      }
      dailyMap[dateKey].total += 1;
      if (call.analysis?.overallMood === "CONCERNED") {
        dailyMap[dateKey].concerned += 1;
      }
    });

    return Object.entries(dailyMap).map(([day, values]) => ({
      day,
      ...values,
      ratio: values.total > 0 ? Math.round((values.concerned / values.total) * 100) : 0
    })).slice(-7);
  }, [calls]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600 font-medium animate-pulse">
          <HeartPulse className="w-6 h-6 text-emerald-500 animate-bounce" />
          <span>Synchronizing live healthcare console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* --- Header --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md shadow-emerald-100">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">AmmaCare Live</h1>
              <p className="text-xs text-slate-500 font-medium">Remote Patient Monitoring Node (Telangana)</p>
            </div>
          </div>
          
          <button 
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Sync Live Data"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* --- Metrics Panel --- */}
        {overview && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Calls Routed</span>
                <h3 className="text-3xl font-black text-slate-800">{overview.summary.totalCallsRouted}</h3>
                <p className="text-xs text-slate-500">Twilio SIP trunk routing attempts</p>
              </div>
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Successful Check-ins</span>
                <h3 className="text-3xl font-black text-emerald-600">{overview.summary.successfulCheckins}</h3>
                <p className="text-xs text-slate-500">Completed dynamic AI forms</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Escalations</span>
                <h3 className={`text-3xl font-black ${overview.summary.criticalEscalations > 0 ? "text-amber-600 animate-pulse" : "text-slate-800"}`}>
                  {overview.summary.criticalEscalations}
                </h3>
                <p className="text-xs text-slate-500">Urgent WhatsApp alerts pushed</p>
              </div>
              <div className={`p-2.5 rounded-xl ${overview.summary.criticalEscalations > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance Evaluation</span>
                <h3 className="text-3xl font-black text-slate-800">{overview.summary.globalComplianceRate}%</h3>
                <p className="text-xs text-slate-500">Protocol verification benchmark</p>
              </div>
              <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </section>
        )}

        {/* --- Trends Chart Block --- */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Critical Distress Volatility Index</h2>
              <p className="text-xs text-slate-500">Realtime metric tracing percentage of daily check-ins flagged with anomalous patient discomfort indicators</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 h-48 items-end border-b border-slate-200 px-2">
            {dynamicChartData.map((dataPoint, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded absolute mb-40 shadow-xl pointer-events-none z-10 font-bold space-y-0.5 text-center">
                  <div>Distress Load: <span className="text-red-400">{dataPoint.ratio}%</span></div>
                  <div className="text-[9px] font-normal text-slate-400">({dataPoint.concerned}/{dataPoint.total} Calls)</div>
                </div>

                <div className="w-full bg-slate-100 rounded-t-lg h-full max-h-[140px] flex items-end overflow-hidden">
                  <div 
                    style={{ height: `${Math.max(dataPoint.ratio, dataPoint.total > 0 ? 8 : 0)}%` }} 
                    className={`w-full transition-all duration-500 rounded-t-md cursor-pointer ${
                      dataPoint.ratio > 40 ? "bg-red-500 group-hover:bg-red-400" :
                      dataPoint.ratio > 0 ? "bg-amber-500 group-hover:bg-amber-400" :
                      "bg-slate-300 group-hover:bg-slate-400"
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 text-center tracking-tight truncate w-full">{dataPoint.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-500" />
              <span>High Critical Stress Level (&gt;40%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Anomalous Conditions Reported</span>
            </div>
          </div>
        </section>

        {/* --- Log Table Block --- */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-800">Operational Logging Stream</h2>
              <p className="text-xs text-slate-500">Chronological ledger of interactive automated patient check-ins</p>
            </div>
            
            {/* Sorting Toolbar Integration */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort Metrics:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer uppercase tracking-wide"
              >
                {/* Fixed Structural Group */}
                <option value="DATE_DESC">Date: Newest First</option>
                <option value="DATE_ASC">Date: Oldest First</option>
                
                {/* Dynamic Category Engine Group */}
                {dynamicMoodsList.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood === "CONCERNED" ? "🚨 " : "• "} Mood: {mood} Only
                  </option>
                ))}
              </select>
              <span className="bg-slate-200/70 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                {processedCalls.length} Nodes Filtered
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Target Phone</th>
                  <th className="py-3 px-6">Operational Status</th>
                  <th className="py-3 px-6">Detected Lang</th>
                  <th className="py-3 px-6">Call Timestamp</th>
                  <th className="py-3 px-6 text-right">Audit Insights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {processedCalls.map((call) => {
                  const isExpanded = expandedCallSid === call.callSid;
                  const isConcerned = call.analysis?.overallMood === "CONCERNED";

                  return (
                    <React.Fragment key={call.callSid}>
                      <tr className={`transition-colors duration-200 ${
                        isConcerned 
                          ? "bg-red-50/70 hover:bg-red-100/80 border-l-4 border-l-red-500" 
                          : isExpanded ? "bg-slate-50" : "hover:bg-slate-50/80"
                      }`}>
                        <td className="py-4 px-6 font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            {call.phoneNumber}
                            {isConcerned && (
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border tracking-wide ${
                            call.status === "COMPLETED" ? (isConcerned ? "bg-red-100 text-red-800 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-100") :
                            call.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse" :
                            "bg-blue-50 text-blue-700 border-blue-100"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              call.status === "COMPLETED" ? (isConcerned ? "bg-red-500" : "bg-emerald-500") :
                              call.status === "IN_PROGRESS" ? "bg-amber-500" : "bg-blue-500"
                            }`} />
                            {call.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                            <Globe2 className="w-3 h-3 text-slate-400" />
                            {call.languageDetected}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 space-y-0.5">
                          {call.scheduledAt && !isNaN(Date.parse(call.scheduledAt)) ? (
                            <>
                              <div className="flex items-center gap-1 font-medium text-slate-700">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{new Date(call.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {new Date(call.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-400 italic font-normal">
                              <Clock className="w-3 h-3 text-slate-300" />
                              <span>Connecting...</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => toggleCallExpand(call.callSid)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                              isExpanded 
                                ? "bg-slate-800 border-slate-800 text-white shadow-sm" 
                                : isConcerned
                                  ? "bg-white hover:bg-red-200 border-red-300 text-red-700 shadow-sm shadow-red-50"
                                  : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600"
                            }`}
                          >
                            <span>Review</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* --- INLINE EXPANSION ACCORDION BLOCK --- */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-slate-900 text-white p-6 border-b border-slate-800">
                            <div className="space-y-6 animate-fadeIn">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded uppercase border border-emerald-900 tracking-wider">
                                      Active Inspection Node
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">UUID Ref: {call.callSid}</span>
                                  </div>
                                  <h3 className="text-base font-black text-white">Clinical Breakdown Ledger</h3>
                                </div>
                                
                                <span className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                                  call.analysis?.overallMood === "CONCERNED" 
                                    ? "bg-red-950 text-red-400 border-red-900 animate-pulse" 
                                    : "bg-emerald-950 text-emerald-400 border-emerald-900"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${call.analysis?.overallMood === "CONCERNED" ? "bg-red-500" : "bg-emerald-500"}`} />
                                  Mood Status: {call.analysis?.overallMood || "PENDING_CALL_END"}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Side Box */}
                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                                      Sarvam ASR Decoded Translation (English)
                                    </label>
                                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm leading-relaxed text-slate-200 font-medium min-h-[80px]">
                                      {call.rawTranscript || (
                                        <span className="text-slate-500 italic">No audio narrative streams captured for this transaction index yet.</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
                                      Gemini Executive Medical Abstract
                                    </label>
                                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm leading-relaxed text-emerald-100/90 font-medium min-h-[80px]">
                                      {call.analysis?.summary || (
                                        <span className="text-slate-500 italic">Waiting for medical report generation parameters...</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Side Box */}
                                <div className="space-y-4">
                                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                    Target Protocol Checklist Parameters Mapping
                                  </label>
                                  
                                  {call.analysis && call.analysis.checklist.length > 0 ? (
                                    <div className="space-y-3">
                                      {call.analysis.checklist.map((item, idx) => (
                                        <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                                          <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Protocol Metric Question</span>
                                            <span className={`text-xs font-black px-2 py-0.5 rounded uppercase tracking-wide border ${
                                              item.status === "YES" 
                                                ? "bg-emerald-950 text-emerald-400 border-emerald-900" 
                                                : "bg-amber-950 text-amber-400 border-amber-900"
                                            }`}>
                                              Value: {item.status}
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1">
                                              <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Original Scripted Telugu Question</span>
                                              <p className="text-slate-300 font-medium bg-slate-900/50 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
                                                {item.originalQuestion}
                                              </p>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Extracted Context Details</span>
                                              <p className="text-emerald-100/80 font-medium bg-slate-900/50 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
                                                {item.extractedDetails}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-sm text-slate-500 italic">
                                      No structural parameters extracted for this telephony index. Call may still be processing.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}