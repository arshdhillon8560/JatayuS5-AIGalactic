import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Shield,
  Briefcase,
  IndianRupee,
  AlertCircle,
  Brain,
  Sparkles,
  ChevronUp,
} from "lucide-react";

import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import api from "../utils/api";

/* ----------------------------- FORMATTERS ----------------------------- */

const fmtPct = (val) => {
  if (val == null) return "N/A";

  const pct = Number(val) * 100;

  if (pct > 0 && pct < 0.000001) {
    return "< 0.000001%";
  }

  return pct.toFixed(4) + "%";
};

const getRisk = (val) => {
  if (val == null) {
    return {
      label: "N/A",
      color: "text-slate-500",
      bg: "bg-slate-100",
    };
  }

  if (val >= 0.7) {
    return {
      label: "VERY HIGH",
      color: "text-red-600",
      bg: "bg-red-50",
    };
  }

  if (val >= 0.4) {
    return {
      label: "MEDIUM",
      color: "text-amber-500",
      bg: "bg-amber-50",
    };
  }

  return {
    label: "LOW",
    color: "text-green-600",
    bg: "bg-green-50",
  };
};

/* ----------------------------- RISK CARD ----------------------------- */

function RiskCard({ title, value }) {
  const risk = getRisk(value);

  return (
    <div className={`rounded-2xl border p-5 ${risk.bg}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
            {title}
          </p>

          <h3
            className="text-3xl font-bold text-slate-800"
            style={{
              fontFamily: "Playfair Display, serif",
            }}
          >
            {fmtPct(value)}
          </h3>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${risk.color} ${risk.bg}`}
        >
          {risk.label}
        </div>
      </div>
    </div>
  );
}

/* ============================= PAGE ============================= */

export default function ApplicationStatus() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [status, setStatus] = useState(null);

  const [loading, setLoading] = useState(true);

  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);

  const [showAI, setShowAI] = useState(false);

  /* ----------------------------- FETCH STATUS ----------------------------- */

  useEffect(() => {
    let interval;

    const fetchData = async () => {
      try {
        const { data } = await api.get(`/application/status/${id}`);

        setStatus(data);

        setLoading(false);

        if (
          data.status === "APPROVED" ||
          data.status === "REJECTED" ||
          data.status === "ESCALATED"
        ) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);

        setLoading(false);
      }
    };

    fetchData();

    interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, [id]);

  /* ----------------------------- FETCH AI ANALYSIS ----------------------------- */

  const fetchAIAnalysis = async () => {
    if (aiAnalysis) {
      setShowAI(!showAI);
      return;
    }

    try {
      setAiLoading(true);

      const { data } = await api.get(`/application/${id}/ai-analysis`);

      setAiAnalysis(data);

      setShowAI(true);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  /* ----------------------------- LOADING ----------------------------- */

  if (loading || !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
        <Header />

        <div className="flex items-center justify-center py-24">
          <RefreshCw size={30} className="animate-spin text-sky-500" />
        </div>
      </div>
    );
  }

  /* ----------------------------- STATUS ----------------------------- */

  const isApproved = status.status === "APPROVED";

  const isRejected = status.status === "REJECTED";

  const isEscalated = status.status === "ESCALATED";

  const isProcessing = !isApproved && !isRejected && !isEscalated;

  const statusIcon = isApproved ? (
    <CheckCircle className="w-20 h-20 text-green-600" />
  ) : isRejected ? (
    <XCircle className="w-20 h-20 text-red-500" />
  ) : isEscalated ? (
    <AlertTriangle className="w-20 h-20 text-purple-500" />
  ) : (
    <Clock className="w-20 h-20 text-sky-500 animate-pulse" />
  );

  const pd =
    status.agent_scores?.pd ?? status.agent_scores?.credit_pd_score ?? null;

  const fraud =
    status.agent_scores?.fraud ??
    status.agent_scores?.fraud_probability ??
    null;

  const collateralValue = status.agent_scores?.collateral_value ?? null;

  const collateralRisk = status.agent_scores?.collateral_risk ?? null;

  const empVerified = status.agent_scores?.employment_verified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ---------------- HERO CARD ---------------- */}

        <div className="card p-8 mb-8 fade-up">
          <div className="flex flex-col items-center text-center">
            {statusIcon}

            <h1
              className="text-4xl font-bold text-slate-800 mt-5"
              style={{
                fontFamily: "Playfair Display, serif",
              }}
            >
              {isApproved
                ? "Loan Approved"
                : isRejected
                  ? "Application Rejected"
                  : isEscalated
                    ? "Manual Review Required"
                    : "Application Under Review"}
            </h1>

            <p className="text-slate-500 mt-3 text-sm">
              Application ID:{" "}
              <span className="font-mono font-semibold text-sky-600">
                #{status.application_id?.slice(-8).toUpperCase()}
              </span>
            </p>

            {status.reason && (
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm">
                <AlertCircle size={15} className="text-slate-400" />

                {status.reason}
              </div>
            )}
          </div>
        </div>

        {/* ---------------- OVERVIEW ---------------- */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 fade-up-2">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Application
            </p>

            <StatusBadge status={status.status} />
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              KYC Status
            </p>

            <StatusBadge status={status.kyc_status} />
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Final Decision
            </p>

            <p
              className={`text-xl font-bold ${
                isApproved
                  ? "text-green-600"
                  : isRejected
                    ? "text-red-600"
                    : isEscalated
                      ? "text-purple-600"
                      : "text-sky-600"
              }`}
              style={{
                fontFamily: "Playfair Display, serif",
              }}
            >
              {status.final_decision || status.status}
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Risk Band
            </p>

            <p
              className={`text-xl font-bold ${
                status.risk_band?.toUpperCase() === "LOW"
                  ? "text-green-600"
                  : status.risk_band?.toUpperCase() === "MEDIUM"
                    ? "text-amber-500"
                    : status.risk_band?.toUpperCase() === "HIGH"
                      ? "text-red-600"
                      : "text-slate-500"
              }`}
              style={{
                fontFamily: "Playfair Display, serif",
              }}
            >
              {status.risk_band || "Not Available"}
            </p>
          </div>
        </div>

        {/* ---------------- AI BUTTON ---------------- */}

        <div className="flex justify-end gap-3 mb-5 fade-up-3">
          {/* COMPLETE KYC BUTTON */}

          {status.kyc_status === "PENDING" && (
            <button
              onClick={() => navigate(`/kyc/${id}`)}
              className="btn-primary"
            >
              <Shield size={16} />
              Complete KYC
            </button>
          )}

          {/* AI BUTTON */}

          <button
            onClick={fetchAIAnalysis}
            disabled={aiLoading}
            className="btn-primary"
          >
            {aiLoading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Brain size={16} />
            )}

            {showAI ? "Hide AI Explanation" : "View AI Explanation"}
          </button>
        </div>

        {/* ---------------- AI ANALYSIS ---------------- */}

        {status.agent_scores && (
          <div className="card p-8 mb-8 fade-up-3">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Shield size={20} className="text-sky-500" />
              AI Risk Analysis
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              <RiskCard title="Credit Default Probability" value={pd} />

              <RiskCard title="Fraud Detection Score" value={fraud} />

              {/* EMPLOYMENT */}

              {empVerified != null && (
                <div
                  className={`rounded-2xl border p-5 ${
                    empVerified ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
                        Employment Verification
                      </p>

                      <h3
                        className={`text-2xl font-bold ${
                          empVerified ? "text-green-600" : "text-red-500"
                        }`}
                        style={{
                          fontFamily: "Playfair Display, serif",
                        }}
                      >
                        {empVerified ? "Verified" : "Not Verified"}
                      </h3>
                    </div>

                    <Briefcase
                      size={26}
                      className={
                        empVerified ? "text-green-500" : "text-red-500"
                      }
                    />
                  </div>
                </div>
              )}

              {/* COLLATERAL */}

              {collateralValue != null && (
                <div className="rounded-2xl border p-5 bg-sky-50">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
                    Collateral Value
                  </p>

                  <h3
                    className="text-3xl font-bold text-sky-700"
                    style={{
                      fontFamily: "Playfair Display, serif",
                    }}
                  >
                    ₹{Number(collateralValue).toLocaleString("en-IN")}
                  </h3>

                  {collateralRisk && (
                    <p className="text-sm text-slate-500 mt-2">
                      Risk:{" "}
                      <span className="font-semibold">{collateralRisk}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- AI EXPLANATION ---------------- */}

        {showAI && aiAnalysis?.ai_analysis && (
          <div className="card p-8 mb-8 fade-up-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Brain size={20} className="text-sky-500" />
                AI Decision Explanation
              </h2>

              <StatusBadge status={aiAnalysis.final_decision} />
            </div>

            {/* SUMMARY */}

            <div className="p-6 rounded-2xl bg-sky-50 border border-sky-100 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-sky-600" />

                <p className="font-semibold text-slate-700">Summary</p>
              </div>

              <p className="text-slate-600 leading-7 text-sm">
                {aiAnalysis.ai_analysis.summary}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* STRENGTHS */}

              <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Strengths
                </h3>

                <div className="space-y-3">
                  {aiAnalysis.ai_analysis.strengths.map((item, i) => (
                    <div key={i} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-green-600">•</span>

                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RISKS */}

              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Risks
                </h3>

                <div className="space-y-3">
                  {aiAnalysis.ai_analysis.risks.map((item, i) => (
                    <div key={i} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-red-600">•</span>

                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* IMPROVEMENTS */}

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <h3 className="font-semibold text-amber-700 mb-4 flex items-center gap-2">
                  <ChevronUp size={16} />
                  Improvements
                </h3>

                <div className="space-y-3">
                  {aiAnalysis.ai_analysis.improvements.map((item, i) => (
                    <div key={i} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-amber-600">•</span>

                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- PROCESSING ---------------- */}

        {isProcessing && (
          <div className="card p-8 fade-up-5">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Clock size={18} className="text-sky-500" />
              Processing Checklist
            </h2>

            <div className="space-y-4">
              {[
                {
                  label: "Application received",
                  done: true,
                },
                {
                  label: "KYC verified",
                  done: status.kyc_status === "VERIFIED",
                },
                {
                  label: "Credit analysis completed",
                  done: pd != null,
                },
                {
                  label: "Fraud analysis completed",
                  done: fraud != null,
                },
                {
                  label: "Employment verification",
                  done: empVerified != null,
                },
                {
                  label: "Final decision",
                  done: !!status.final_decision,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.done ? "bg-green-500" : "bg-slate-200"
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle size={14} className="text-white" />
                    ) : (
                      <Clock size={12} className="text-slate-500" />
                    )}
                  </div>

                  <span
                    className={`text-sm ${
                      item.done
                        ? "text-slate-700 font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- FOOTER BUTTON ---------------- */}

        <div className="text-center mt-8">
          <button className="btn-ghost" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
