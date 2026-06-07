import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  CreditCard,
  FileText,
  Brain,
  ClipboardCheck,
  LogOut,
  ShieldCheck,
  Eye,
  TrendingUp,
  Activity,
  BadgeCheck,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { officerAPI } from "../services/api";
import favicon from "../assets/favicon.png";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const tokens = {
  navy: "#0B1F3A",
  navyMid: "#132D52",
  gold: "#C8963E",
  goldLight: "#F0C96B",
  surface: "#F6F7FA",
  card: "#FFFFFF",
  border: "#E4E7EE",
  muted: "#8A93A6",
  text: "#1A2332",
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const AppNavbar = ({ onLogout }) => (
  <nav
    style={{
      background: tokens.navy,
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}
    className="h-14 px-8 flex items-center justify-between sticky top-0 z-30"
  >
    <div className="flex items-center gap-3">
      <img
        src={favicon}
        alt="logo"
        className="h-7 brightness-0 invert opacity-90"
      />
      <div
        className="w-px h-4"
        style={{ background: "rgba(255,255,255,0.18)" }}
      />
      <span
        style={{
          fontFamily: "'Syne', sans-serif",
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.08em",
        }}
        className="text-xs font-medium uppercase tracking-widest hidden md:block"
      >
        Loan Review Console
      </span>
    </div>
    <div
      className="hidden md:flex items-center gap-2 text-xs font-medium"
      style={{
        color: "rgba(255,255,255,0.45)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      Application Review
    </div>
    <button
      onClick={onLogout}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        color: "rgba(255,255,255,0.6)",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.13)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
      }
    >
      <LogOut className="w-3.5 h-3.5" />
      Sign out
    </button>
  </nav>
);

const Field = ({ label, value, mono = true }) => (
  <div className="flex flex-col gap-1">
    <span
      style={{
        color: tokens.muted,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.09em",
      }}
      className="text-[10px] font-medium uppercase"
    >
      {label}
    </span>
    <span
      style={{
        color: value ? tokens.text : tokens.muted,
        fontFamily: mono
          ? "'IBM Plex Mono', monospace"
          : "'DM Sans', sans-serif",
      }}
      className="text-sm font-medium"
    >
      {value ?? "—"}
    </span>
  </div>
);

const Section = ({ icon: Icon, title, accent = "#378ADD", children }) => (
  <motion.div
    variants={fadeUp}
    className="rounded-2xl overflow-hidden"
    style={{
      background: tokens.card,
      border: `1px solid ${tokens.border}`,
      boxShadow: "0 1px 4px rgba(10,20,40,0.06)",
    }}
  >
    <div
      className="flex items-center gap-3 px-6 py-4"
      style={{
        borderBottom: `1px solid ${tokens.border}`,
        background: "#FAFBFD",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: accent + "18" }}
      >
        <Icon style={{ color: accent }} className="w-3.5 h-3.5" />
      </div>
      <h2
        style={{ fontFamily: "'Syne', sans-serif", color: tokens.text }}
        className="text-sm font-semibold"
      >
        {title}
      </h2>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

const Divider = () => (
  <div style={{ borderTop: `1px solid ${tokens.border}` }} className="my-5" />
);

const RiskGauge = ({ label, value }) => {
  const pct = Math.min(value * 100, 100);
  const trackColor = pct < 33 ? "#22C55E" : pct < 66 ? "#F59E0B" : "#EF4444";
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: tokens.muted,
            letterSpacing: "0.08em",
          }}
          className="text-[10px] font-medium uppercase"
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: trackColor,
            background: trackColor + "18",
            border: `1px solid ${trackColor}40`,
          }}
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
        >
          {pct < 33 ? "Low" : pct < 66 ? "Moderate" : "High"} risk
        </span>
      </div>
      <div
        className="relative h-1.5 rounded-full overflow-hidden"
        style={{ background: tokens.border }}
      >
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: pct + "%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(to right, #22C55E, ${trackColor})`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {["Low", "Medium", "High"].map((l) => (
          <span
            key={l}
            style={{ color: tokens.muted, fontFamily: "'DM Sans', sans-serif" }}
            className="text-[9px]"
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

const riskConfig = {
  HIGH: {
    Icon: XCircle,
    label: "High Risk",
    bg: "#FEF2F2",
    border: "#FECACA",
    iconColor: "#DC2626",
    textColor: "#991B1B",
    dot: "#EF4444",
    barColor: "#EF4444",
  },
  MEDIUM: {
    Icon: AlertTriangle,
    label: "Medium Risk",
    bg: "#FFFBEB",
    border: "#FDE68A",
    iconColor: "#D97706",
    textColor: "#92400E",
    dot: "#F59E0B",
    barColor: "#F59E0B",
  },
  LOW: {
    Icon: CheckCircle,
    label: "Low Risk",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    iconColor: "#16A34A",
    textColor: "#14532D",
    dot: "#22C55E",
    barColor: "#22C55E",
  },
};

// Maps legacy lowercase keys used for the header badge
const riskConfigLegacy = {
  high: riskConfig.HIGH,
  medium: riskConfig.MEDIUM,
  low: riskConfig.LOW,
};

const recConfig = {
  APPROVE: {
    Icon: CheckCircle,
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    label: "Approve",
  },
  REJECT: {
    Icon: XCircle,
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    label: "Reject",
  },
  REVIEW: {
    Icon: AlertTriangle,
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    label: "Manual Review",
  },
};

const DocButton = ({ label, url, onClick }) => (
  <motion.button
    whileHover={
      url ? { y: -1, boxShadow: "0 4px 12px rgba(10,30,60,0.12)" } : {}
    }
    whileTap={url ? { scale: 0.97 } : {}}
    onClick={() => onClick(url)}
    disabled={!url}
    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
    style={{
      fontFamily: "'DM Sans', sans-serif",
      ...(url
        ? {
            background: tokens.navy,
            color: "#fff",
            border: `1px solid ${tokens.navy}`,
            cursor: "pointer",
          }
        : {
            background: "#F1F3F8",
            color: tokens.muted,
            border: `1px solid ${tokens.border}`,
            cursor: "not-allowed",
          }),
    }}
  >
    <Eye className="w-3.5 h-3.5 shrink-0" />
    {label}
    {url && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
  </motion.button>
);

const StatPill = ({ label, value, color = tokens.navy }) => (
  <div
    className="flex flex-col gap-1 px-4 py-3 rounded-xl"
    style={{ background: color + "10", border: `1px solid ${color}25` }}
  >
    <span
      style={{
        color: tokens.muted,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.08em",
      }}
      className="text-[10px] uppercase font-medium"
    >
      {label}
    </span>
    <span
      style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}
      className="text-sm font-semibold"
    >
      {value ?? "—"}
    </span>
  </div>
);

// ── AI RISK BANNER (dynamic) ───────────────────────────────────────────────
const AIRiskBanner = ({ result, onReanalyze, analyzing }) => {
  const [expanded, setExpanded] = useState(true);
  const riskKey = result.risk_level?.toUpperCase() || "MEDIUM";
  const risk = riskConfig[riskKey] || riskConfig.MEDIUM;
  const rec = recConfig[result.recommendation] || recConfig.REVIEW;
  const confidencePct = Math.round((result.confidence ?? 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: `1.5px solid ${risk.border}`,
        background: risk.bg,
        boxShadow: `0 2px 12px ${risk.dot}18`,
      }}
    >
      {/* Banner header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        style={{ borderBottom: expanded ? `1px solid ${risk.border}` : "none" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: risk.iconColor + "20" }}
          >
            <risk.Icon className="w-4 h-4" style={{ color: risk.iconColor }} />
          </div>
          <div>
            <p
              style={{
                color: risk.textColor,
                fontFamily: "'Syne', sans-serif",
              }}
              className="text-sm font-bold leading-tight"
            >
              {risk.label}
            </p>
            <p
              style={{
                color: risk.textColor,
                fontFamily: "'DM Sans', sans-serif",
                opacity: 0.7,
              }}
              className="text-[11px]"
            >
              AI-generated · analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Recommendation pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: rec.bg,
              border: `1px solid ${rec.border}`,
              color: rec.color,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            <rec.Icon className="w-3 h-3" />
            {rec.label}
          </div>
          {expanded ? (
            <ChevronUp
              className="w-4 h-4"
              style={{ color: risk.textColor, opacity: 0.5 }}
            />
          ) : (
            <ChevronDown
              className="w-4 h-4"
              style={{ color: risk.textColor, opacity: 0.5 }}
            />
          )}
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 pt-4 flex flex-col gap-4">
              {/* Confidence bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    style={{
                      color: risk.textColor,
                      fontFamily: "'DM Sans', sans-serif",
                      opacity: 0.7,
                      letterSpacing: "0.08em",
                    }}
                    className="text-[10px] uppercase font-medium"
                  >
                    Model Confidence
                  </span>
                  <span
                    style={{
                      color: risk.textColor,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                    className="text-xs font-semibold"
                  >
                    {confidencePct}%
                  </span>
                </div>
                <div
                  className="relative h-2 rounded-full overflow-hidden"
                  style={{ background: risk.iconColor + "20" }}
                >
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: confidencePct + "%" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: risk.barColor }}
                  />
                </div>
              </div>

              {/* Reasons */}
              {result.reasons?.length > 0 && (
                <div>
                  <p
                    style={{
                      color: risk.textColor,
                      fontFamily: "'DM Sans', sans-serif",
                      opacity: 0.7,
                      letterSpacing: "0.08em",
                    }}
                    className="text-[10px] uppercase font-medium mb-2"
                  >
                    Key Factors
                  </p>
                  <ul className="flex flex-col gap-2">
                    {result.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: risk.iconColor }}
                        />
                        <span
                          style={{
                            color: risk.textColor,
                            fontFamily: "'DM Sans', sans-serif",
                            opacity: 0.85,
                          }}
                          className="text-xs leading-relaxed"
                        >
                          {r}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-analyze */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReanalyze();
                }}
                disabled={analyzing}
                className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  color: risk.textColor,
                  background: risk.iconColor + "15",
                  border: `1px solid ${risk.iconColor}30`,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: analyzing ? "not-allowed" : "pointer",
                  opacity: analyzing ? 0.6 : 1,
                }}
              >
                <RefreshCw
                  className={cn("w-3 h-3", analyzing && "animate-spin")}
                />
                {analyzing ? "Analyzing…" : "Re-analyze"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── ANALYZE BUTTON ─────────────────────────────────────────────────────────
const AnalyzeButton = ({ onClick, loading }) => (
  <motion.button
    whileHover={
      !loading ? { y: -1, boxShadow: "0 6px 20px rgba(232,93,4,0.28)" } : {}
    }
    whileTap={!loading ? { scale: 0.97 } : {}}
    onClick={onClick}
    disabled={loading}
    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all"
    style={{
      fontFamily: "'Syne', sans-serif",
      background: loading
        ? "linear-gradient(135deg, #c9642b 0%, #b85a25 100%)"
        : "linear-gradient(135deg, #E85D04 0%, #C84B00 100%)",
      color: "#fff",
      border: "none",
      cursor: loading ? "not-allowed" : "pointer",
      boxShadow: loading ? "none" : "0 2px 8px rgba(232,93,4,0.22)",
    }}
  >
    {loading ? (
      <>
        <RefreshCw className="w-4 h-4 animate-spin" />
        Analyzing with AI…
      </>
    ) : (
      <>
        <Sparkles className="w-4 h-4" />
        Run AI Risk Analysis
      </>
    )}
  </motion.button>
);

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState(null);
  const [reason, setReason] = useState("");
  const [selectedDecision, setSelectedDecision] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);

  // AI analysis state
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  useEffect(() => {
    officerAPI.getDetails(id).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [id]);

  const handleDecision = async (decision, decisionReason) => {
    setSubmitting(decision);
    await officerAPI.updateDecision({
      application_id: id,
      decision,
      reason: decisionReason,
    });
    setSubmitting(null);
    alert("Application " + decision);
    navigate("/dashboard");
  };

  const openDocument = (url) => {
    if (!url) {
      alert("Document not ready yet");
      return;
    }
    window.open(url, "_blank");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ── AI ANALYSIS CALL ────────────────────────────────────────────────────
  const runAIAnalysis = async () => {
    if (!data) return;
    setAnalyzing(true);
    setAnalyzeError(null);

    const payload = {
      loan_amount: data.loan_amount,
      loan_tenure: data.loan_tenure,
      loan_purpose: data.loan_purpose,
      age: data.age,
      employment_type: data.employment_type,
      employer_name: data.employer_name,
      industry: data.industry,
      job_title: data.job_title,
      years_in_current_job: data.years_in_current_job,
      total_work_experience: data.total_work_experience,
      monthly_income: data.monthly_income,
      existing_loans: data.existing_loans,
      existing_emi: data.existing_emi,
      credit_card_limit: data.credit_card_limit,
      credit_card_balance: data.credit_card_balance,
      average_monthly_balance: data.average_monthly_balance,
      collateral_type: data.collateral_type,
      collateral_value: data.collateral_value,
      credit_pd_score: data.credit_pd_score,
      fraud_probability: data.fraud_probability,
      employment_verified: data.employment_verified,
      kyc_status: data.kyc_status,
    };

    try {
      const json = await officerAPI.analyzeRisk(payload);
      setAiResult(json);
    } catch (err) {
      setAnalyzeError(err.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen" style={{ background: tokens.surface }}>
        <AppNavbar onLogout={handleLogout} />
        <div className="flex flex-col items-center justify-center pt-32 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-6 h-6 rounded-full border-2"
            style={{ borderColor: tokens.border, borderTopColor: tokens.navy }}
          />
          <p
            style={{ color: tokens.muted, fontFamily: "'DM Sans', sans-serif" }}
            className="text-sm"
          >
            Loading application…
          </p>
        </div>
      </div>
    );
  }

  const pd = Number(data.credit_pd_score ?? 0);
  const fraud = Number(data.fraud_probability ?? 0);
  const emp = data.employment_verified;

  // Legacy static risk for header badge (unchanged)
  let riskLevel = "low";
  if (fraud > 0.7 || pd > 0.6) riskLevel = "high";
  else if (!emp || (pd > 0.4 && pd <= 0.6)) riskLevel = "medium";
  const risk = riskConfigLegacy[riskLevel];

  const initials = (data.name ?? "NA")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="min-h-screen"
      style={{
        background: tokens.surface,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <AppNavbar onLogout={handleLogout} />

      {/* HERO BAND */}
      <div
        style={{
          background: tokens.navyMid,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-6">
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-xs font-medium mb-5 transition-all"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
            }
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: tokens.gold + "22",
                color: tokens.goldLight,
                border: `1px solid ${tokens.gold}40`,
                fontFamily: "'Syne', sans-serif",
              }}
            >
              {initials}
            </div>
            <div>
              <h1
                style={{ color: "#fff", fontFamily: "'Syne', sans-serif" }}
                className="text-lg font-semibold leading-tight"
              >
                {data.name ?? "Applicant"}
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
                className="text-[11px] mt-0.5"
              >
                {id}
              </p>
            </div>
            <div
              className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: risk.dot + "20",
                border: `1px solid ${risk.dot}40`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: risk.dot }}
              />
              <span
                style={{ color: risk.dot, fontFamily: "'DM Sans', sans-serif" }}
                className="text-xs font-medium"
              >
                {risk.label}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-4"
      >
        {/* ── PERSONAL ─────────────────────────────────────────────── */}
        <Section icon={User} title="Personal Details" accent="#378ADD">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field label="Full Name" value={data.name} />
            <Field
              label="Date of Birth"
              value={
                data.date_of_birth
                  ? new Date(data.date_of_birth).toLocaleDateString("en-GB")
                  : null
              }
            />
            <Field label="Gender" value={data.gender} mono={false} />
            <Field
              label="Marital Status"
              value={data.marital_status}
              mono={false}
            />
            <Field label="PAN Number" value={data.pan_number} />
            <Field label="Aadhaar" value={data.aadhaar_number} />
            <Field label="City" value={data.city} mono={false} />
            <Field label="State" value={data.state} mono={false} />
            <Field label="Age" value={data.age} />
            <Field label="Address" value={data.address} mono={false} />
            <Field label="Pincode" value={data.pincode} />
            <Field label="KYC Status" value={data.kyc_status} mono={false} />
          </div>
        </Section>

        {/* ── EMPLOYMENT ───────────────────────────────────────────── */}
        <Section icon={Briefcase} title="Employment Details" accent="#8B5CF6">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field
              label="Employment Type"
              value={data.employment_type}
              mono={false}
            />
            <Field label="Employer" value={data.employer_name} mono={false} />
            <Field label="Job Title" value={data.job_title} mono={false} />
            <Field
              label="Experience"
              value={data.total_work_experience}
              mono={false}
            />
            <Field
              label="Monthly Income"
              value={
                data.monthly_income != null
                  ? "Rs. " + Number(data.monthly_income).toLocaleString("en-IN")
                  : null
              }
            />
            <Field label="Salary Mode" value={data.salary_mode} mono={false} />
            <Field label="Industry" value={data.industry} mono={false} />
            <Field
              label="Years In Current Job"
              value={data.years_in_current_job + " years"}
              mono={false}
            />
          </div>
        </Section>

        {/* ── FINANCIAL ────────────────────────────────────────────── */}
        <Section icon={CreditCard} title="Financial Details" accent="#0D9488">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field
              label="Loan Amount"
              value={"Rs. " + Number(data.loan_amount).toLocaleString("en-IN")}
            />
            <Field label="Loan Tenure" value={data.loan_tenure + " months"} />
            <Field
              label="Loan Purpose"
              value={data.loan_purpose}
              mono={false}
            />
            <Field label="Existing Loans" value={data.existing_loans} />
            <Field
              label="Existing EMI"
              value={
                data.existing_emi != null
                  ? "Rs. " + Number(data.existing_emi).toLocaleString("en-IN")
                  : null
              }
            />
            <Field
              label="Credit Card Limit"
              value={
                data.credit_card_limit
                  ? "Rs. " +
                    Number(data.credit_card_limit).toLocaleString("en-IN")
                  : null
              }
            />
            <Field
              label="Credit Card Balance"
              value={
                data.credit_card_balance
                  ? "Rs. " +
                    Number(data.credit_card_balance).toLocaleString("en-IN")
                  : null
              }
            />
            <Field label="Bank Name" value={data.bank_name} mono={false} />
            <Field
              label="Account Type"
              value={data.bank_account_type}
              mono={false}
            />
            <Field label="Account Number" value={data.bank_account_number} />
            <Field
              label="Collateral Value"
              value={
                data.collateral_value
                  ? "Rs. " +
                    Number(data.collateral_value).toLocaleString("en-IN")
                  : null
              }
            />
            <Field
              label="Avg. Monthly Balance"
              value={
                data.average_monthly_balance != null
                  ? "Rs. " +
                    Number(data.average_monthly_balance).toLocaleString("en-IN")
                  : null
              }
            />
          </div>
        </Section>

        {/* ── DOCUMENTS ────────────────────────────────────────────── */}
        <Section
          icon={FileText}
          title="Supporting Documents"
          accent={tokens.gold}
        >
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Bank Statement", url: data.bank_statement_url },
              { label: "Salary Slip", url: data.salary_slip_url },
              { label: "ITR Document", url: data.itr_document_url },
              { label: "Collateral Document", url: data.collateral_url },
            ].map(({ label, url }) => (
              <DocButton
                key={label}
                label={label}
                url={url}
                onClick={openDocument}
              />
            ))}
          </div>
        </Section>

        {/* ── AI RISK ───────────────────────────────────────────────── */}
        <Section icon={Brain} title="AI Risk Analysis" accent="#E85D04">
          {/* Stat pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatPill
              label="Credit PD"
              value={`${(pd * 100).toFixed(2)}%`}
              color="#E85D04"
            />
            <StatPill
              label="Fraud Prob."
              value={`${(fraud * 100).toFixed(2)}%`}
              color="#DC2626"
            />
            <StatPill
              label="Final Decision"
              value={data.final_decision}
              color={tokens.navy}
            />
            <StatPill
              label="Application Status"
              value={data.status}
              color="#7C3AED"
            />
          </div>

          <Divider />

          {/* Gauges */}
          <div className="mb-6">
            <RiskGauge label="Credit Risk Score" value={pd} />
            <RiskGauge label="Fraud Probability" value={fraud} />
          </div>

          <Divider />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatPill
              label="Collateral Type"
              value={data.collateral_type}
              color="#0D9488"
            />
            <StatPill
              label="Collateral Value"
              value={
                data.collateral_value
                  ? "Rs. " +
                    Number(data.collateral_value).toLocaleString("en-IN")
                  : "—"
              }
              color="#059669"
            />
          </div>

          {/* Employment verification */}
          <div className="flex items-center gap-3 mb-5">
            <BadgeCheck
              className={cn(
                "w-4 h-4",
                emp ? "text-green-500" : "text-slate-400",
              )}
            />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: tokens.text,
              }}
              className="text-sm"
            >
              Employment {emp ? "verified successfully" : "not verified"}
            </span>
          </div>

          <Divider />

          {/* ── DYNAMIC AI RISK BANNER ZONE ───────────────────────── */}
          <AnimatePresence mode="wait">
            {!aiResult && !analyzing && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                {/* Placeholder state */}
                <div
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: "#F8F9FC",
                    border: `1.5px dashed ${tokens.border}`,
                  }}
                >
                  <Sparkles
                    className="w-4 h-4 shrink-0"
                    style={{ color: "#E85D04" }}
                  />
                  <div>
                    <p
                      style={{
                        color: tokens.text,
                        fontFamily: "'Syne', sans-serif",
                      }}
                      className="text-sm font-semibold"
                    >
                      AI Risk Assessment
                    </p>
                    <p
                      style={{
                        color: tokens.muted,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      className="text-xs mt-0.5"
                    >
                      Click below to run an AI-powered risk analysis on this
                      application.
                    </p>
                  </div>
                </div>
                <AnalyzeButton onClick={runAIAnalysis} loading={false} />
              </motion.div>
            )}

            {analyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                {/* Skeleton shimmer */}
                <div
                  className="p-5 rounded-2xl flex flex-col gap-3"
                  style={{
                    background: "#F8F9FC",
                    border: `1.5px dashed ${tokens.border}`,
                  }}
                >
                  {[80, 55, 65].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 rounded-full animate-pulse"
                      style={{ width: w + "%", background: tokens.border }}
                    />
                  ))}
                </div>
                <AnalyzeButton onClick={() => {}} loading={true} />
              </motion.div>
            )}

            {aiResult && !analyzing && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                <AIRiskBanner
                  result={aiResult}
                  onReanalyze={runAIAnalysis}
                  analyzing={analyzing}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {analyzeError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: "#DC2626", fontFamily: "'DM Sans', sans-serif" }}
              className="text-xs mt-2"
            >
              ⚠ {analyzeError}
            </motion.p>
          )}
        </Section>

        {/* ── DECISION ──────────────────────────────────────────────── */}
        {/* ── DECISION ──────────────────────────────────────────────── */}
        {/* ── DECISION ──────────────────────────────────────────────── */}
        <Section
          icon={ClipboardCheck}
          title="Officer Decision"
          accent="#1D4ED8"
        >
          {/* DECISION LABEL */}
          <label
            className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.12em]"
            style={{
              color: tokens.muted,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Officer Decision
          </label>

          {/* MODERN CUSTOM DECISION SELECT */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* APPROVE CARD */}
            <motion.button
              whileHover={{
                y: -2,
                boxShadow: "0 10px 24px rgba(34,197,94,0.16)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedDecision("APPROVED");
                setReason("");
              }}
              className="relative overflow-hidden rounded-2xl p-4 text-left transition-all"
              style={{
                background:
                  selectedDecision === "APPROVED"
                    ? "linear-gradient(135deg, #ECFDF3 0%, #D1FAE5 100%)"
                    : "#FFFFFF",
                border:
                  selectedDecision === "APPROVED"
                    ? "2px solid #22C55E"
                    : `1.5px solid ${tokens.border}`,
                cursor: "pointer",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      selectedDecision === "APPROVED" ? "#22C55E" : "#F0FDF4",
                  }}
                >
                  <CheckCircle
                    className="w-5 h-5"
                    style={{
                      color:
                        selectedDecision === "APPROVED" ? "#FFFFFF" : "#16A34A",
                    }}
                  />
                </div>

                <div className="flex-1">
                  <h3
                    className="text-sm font-semibold"
                    style={{
                      color: "#14532D",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    Approve Application
                  </h3>

                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{
                      color: "#166534",
                      opacity: 0.75,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Applicant satisfies underwriting, risk and verification
                    checks.
                  </p>
                </div>
              </div>

              {selectedDecision === "APPROVED" && (
                <div
                  className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
                  style={{ background: "#22C55E" }}
                />
              )}
            </motion.button>

            {/* REJECT CARD */}
            <motion.button
              whileHover={{
                y: -2,
                boxShadow: "0 10px 24px rgba(220,38,38,0.14)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedDecision("REJECTED");
                setReason("");
              }}
              className="relative overflow-hidden rounded-2xl p-4 text-left transition-all"
              style={{
                background:
                  selectedDecision === "REJECTED"
                    ? "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)"
                    : "#FFFFFF",
                border:
                  selectedDecision === "REJECTED"
                    ? "2px solid #EF4444"
                    : `1.5px solid ${tokens.border}`,
                cursor: "pointer",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      selectedDecision === "REJECTED" ? "#EF4444" : "#FEF2F2",
                  }}
                >
                  <XCircle
                    className="w-5 h-5"
                    style={{
                      color:
                        selectedDecision === "REJECTED" ? "#FFFFFF" : "#DC2626",
                    }}
                  />
                </div>

                <div className="flex-1">
                  <h3
                    className="text-sm font-semibold"
                    style={{
                      color: "#991B1B",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    Reject Application
                  </h3>

                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{
                      color: "#991B1B",
                      opacity: 0.75,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Applicant failed risk, fraud, compliance or eligibility
                    checks.
                  </p>
                </div>
              </div>

              {selectedDecision === "REJECTED" && (
                <div
                  className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
                  style={{ background: "#EF4444" }}
                />
              )}
            </motion.button>
          </div>

          {/* APPROVAL REASONS */}
          {selectedDecision === "APPROVED" && (
            <div className="mb-5">
              <label
                className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.12em]"
                style={{
                  color: "#16A34A",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Approval Reason
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Low credit risk",
                  "Strong repayment capacity",
                  "Stable employment verified",
                  "Excellent banking history",
                  "Collateral value sufficient",
                  "Documents verified successfully",
                  "Good credit utilization",
                  "Custom",
                ].map((item) => (
                  <motion.button
                    key={item}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setReason(item)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                    style={{
                      background: reason === item ? "#ECFDF3" : "#FFFFFF",
                      border:
                        reason === item
                          ? "2px solid #22C55E"
                          : `1.5px solid ${tokens.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: reason === item ? "#22C55E" : "#D1D5DB",
                      }}
                    />

                    <span
                      className="text-sm font-medium"
                      style={{
                        color: reason === item ? "#14532D" : tokens.text,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {item}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* REJECTION REASONS */}
          {selectedDecision === "REJECTED" && (
            <div className="mb-5">
              <label
                className="block text-[11px] font-semibold mb-2 uppercase tracking-[0.12em]"
                style={{
                  color: "#DC2626",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Rejection Reason
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "High credit risk",
                  "High fraud probability",
                  "Low income eligibility",
                  "Poor repayment history",
                  "Employment not verified",
                  "Document mismatch detected",
                  "Insufficient collateral value",
                  "KYC verification failed",
                  "Too many existing loans",
                  "Custom",
                ].map((item) => (
                  <motion.button
                    key={item}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setReason(item)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                    style={{
                      background: reason === item ? "#FEF2F2" : "#FFFFFF",
                      border:
                        reason === item
                          ? "2px solid #EF4444"
                          : `1.5px solid ${tokens.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: reason === item ? "#EF4444" : "#D1D5DB",
                      }}
                    />

                    <span
                      className="text-sm font-medium"
                      style={{
                        color: reason === item ? "#991B1B" : tokens.text,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {item}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOM REASON */}
          {reason === "Custom" && (
            <textarea
              rows={4}
              placeholder="Enter custom officer remarks..."
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full resize-none outline-none text-sm mb-5 px-4 py-4 rounded-2xl transition-all"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: tokens.text,
                background: "#FFFFFF",
                border: `1.5px solid ${tokens.border}`,
              }}
            />
          )}

          {/* FINAL ACTION BUTTON */}
          <motion.button
            whileHover={{
              y: -2,
              boxShadow:
                selectedDecision === "APPROVED"
                  ? "0 12px 28px rgba(34,197,94,0.24)"
                  : "0 12px 28px rgba(220,38,38,0.22)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleDecision(
                selectedDecision,
                reason === "Custom" ? customReason : reason,
              )
            }
            disabled={!selectedDecision || !reason || !!submitting}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold transition-all"
            style={{
              fontFamily: "'Syne', sans-serif",
              background:
                selectedDecision === "APPROVED"
                  ? "linear-gradient(135deg, #15803D 0%, #22C55E 100%)"
                  : selectedDecision === "REJECTED"
                    ? "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)"
                    : "#CBD5E1",
              color: "#FFFFFF",
              cursor: !selectedDecision || !reason ? "not-allowed" : "pointer",
              opacity: !selectedDecision || !reason ? 0.7 : 1,
            }}
          >
            {selectedDecision === "APPROVED" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {submitting === "APPROVED"
                  ? "Approving Application..."
                  : "Approve Application"}
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                {submitting === "REJECTED"
                  ? "Rejecting Application..."
                  : "Reject Application"}
              </>
            )}
          </motion.button>
        </Section>

        {/* FOOTER */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between px-1 pb-4"
        >
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "#16A34A", fontFamily: "'DM Sans', sans-serif" }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            TLS 1.3 encrypted
          </span>
          <span
            style={{
              color: tokens.muted,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
            className="text-[11px]"
          >
            v2.4.1 · Production
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};
