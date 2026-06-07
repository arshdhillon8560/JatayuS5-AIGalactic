import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { officerAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  FileText,
  AlertTriangle,
  ChevronRight,
  Clock,
  DollarSign,
  Tag,
  ShieldCheck,
} from "lucide-react";
import favicon from "../assets/favicon.png";

const t = {
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
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const statusConfig = {
  ESCALATED: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#92400E",
    dot: "#F59E0B",
  },
  APPROVED: {
    bg: "#F0FDF4",
    border: "#BBF7D0",
    text: "#14532D",
    dot: "#22C55E",
  },
  REJECTED: {
    bg: "#FEF2F2",
    border: "#FECACA",
    text: "#991B1B",
    dot: "#EF4444",
  },
  DEFAULT: {
    bg: "#EFF6FF",
    border: "#BFDBFE",
    text: "#1E40AF",
    dot: "#3B82F6",
  },
};

const getStatus = (s) => statusConfig[s] ?? statusConfig.DEFAULT;

const AppNavbar = ({ onLogout }) => (
  <nav
    style={{
      background: t.navy,
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
      Credit Officer Dashboard
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

const HeroBand = ({ count, loading }) => (
  <div
    style={{
      background: t.navyMid,
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}
    className="px-8 py-6"
  >
    <div className="max-w-5xl mx-auto flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "rgba(200,150,62,0.18)",
          border: "1px solid rgba(200,150,62,0.3)",
        }}
      >
        <AlertTriangle className="w-5 h-5" style={{ color: t.goldLight }} />
      </div>
      <div>
        <h1
          style={{ color: "#fff", fontFamily: "'Syne', sans-serif" }}
          className="text-lg font-semibold leading-tight"
        >
          Escalated Applications
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'DM Sans', sans-serif",
          }}
          className="text-xs mt-0.5"
        >
          Review and action applications flagged for officer decision
        </p>
      </div>
      {!loading && (
        <div
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span
            style={{
              color: t.goldLight,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
            className="text-base font-semibold"
          >
            {count}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans', sans-serif",
            }}
            className="text-xs"
          >
            pending
          </span>
        </div>
      )}
    </div>
  </div>
);

const AppCard = ({ app, onClick }) => {
  const status = getStatus(app.status);
  const initials = (app.applicant_name ?? app.application_id ?? "NA")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      variants={fadeUp}
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(10,20,40,0.1)" }}
      whileTap={{ scale: 0.985 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        boxShadow: "0 1px 4px rgba(10,20,40,0.05)",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#B5D4F4")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.border)}
    >
      {/* Top stripe (status color) */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(to right, ${status.dot}, ${status.dot}66)`,
          opacity: 0.6,
        }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: t.navy + "0E",
              border: `1px solid ${t.navy}18`,
              color: t.navy,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {initials}
          </div>

          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: status.bg,
              border: `1px solid ${status.border}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: status.dot }}
            />
            <span
              style={{
                color: status.text,
                fontFamily: "'DM Sans', sans-serif",
              }}
              className="text-[10px] font-medium"
            >
              {app.status ?? "PENDING"}
            </span>
          </div>
        </div>

        {/* Application ID */}
        <p
          className="text-xs mb-3 truncate"
          style={{ color: t.muted, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {app.application_id}
        </p>

        {/* Applicant name if available */}
        {app.applicant_name && (
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: t.text, fontFamily: "'Syne', sans-serif" }}
          >
            {app.applicant_name}
          </p>
        )}

        {/* Fields */}
        <div
          className="rounded-xl p-3 mb-4 flex flex-col gap-2.5"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <div className="flex items-center justify-between">
            <span
              className="flex items-center gap-1.5 text-[11px]"
              style={{ color: t.muted, fontFamily: "'DM Sans', sans-serif" }}
            >
              <DollarSign className="w-3 h-3" />
              Loan Amount
            </span>
            <span
              className="text-[12px] font-semibold"
              style={{
                color: t.text,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              ₹{Number(app.loan_amount ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className="flex items-center gap-1.5 text-[11px]"
              style={{ color: t.muted, fontFamily: "'DM Sans', sans-serif" }}
            >
              <Tag className="w-3 h-3" />
              Purpose
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: t.text, fontFamily: "'DM Sans', sans-serif" }}
            >
              {app.loan_purpose ?? "—"}
            </span>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <span
            className="flex items-center gap-1 text-[10px]"
            style={{ color: t.muted, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <Clock className="w-3 h-3" />
            {new Date(app.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span
            className="flex items-center gap-1 text-[10px] font-medium transition-colors"
            style={{ color: "#2B7FD4", fontFamily: "'DM Sans', sans-serif" }}
          >
            Review <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{ background: t.card, border: `1px solid ${t.border}` }}
  >
    <div className="h-0.5 w-full" style={{ background: t.border }} />
    <div className="p-5 flex flex-col gap-3">
      <div className="flex justify-between">
        <div
          className="w-10 h-10 rounded-xl animate-pulse"
          style={{ background: t.border }}
        />
        <div
          className="w-20 h-6 rounded-full animate-pulse"
          style={{ background: t.border }}
        />
      </div>
      <div
        className="w-3/4 h-3 rounded animate-pulse"
        style={{ background: t.border }}
      />
      <div
        className="w-full h-16 rounded-xl animate-pulse"
        style={{ background: t.surface }}
      />
      <div
        className="w-1/2 h-3 rounded animate-pulse"
        style={{ background: t.border }}
      />
    </div>
  </div>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
    >
      <ShieldCheck className="w-7 h-7" style={{ color: "#22C55E" }} />
    </div>
    <p
      style={{ color: t.text, fontFamily: "'Syne', sans-serif" }}
      className="text-base font-semibold mb-1"
    >
      All clear
    </p>
    <p
      style={{ color: t.muted, fontFamily: "'DM Sans', sans-serif" }}
      className="text-sm"
    >
      No escalated applications pending review
    </p>
  </motion.div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    officerAPI
      .getEscalated()
      .then((data) => setApplications(data.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: t.surface, fontFamily: "'DM Sans', sans-serif" }}
    >
      <AppNavbar onLogout={handleLogout} />
      <HeroBand count={applications.length} loading={loading} />

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {applications.map((app) => (
              <AppCard
                key={app.application_id}
                app={app}
                onClick={() => navigate(`/application/${app.application_id}`)}
              />
            ))}
          </motion.div>
        )}

        {/* Footer */}
        {!loading && applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between mt-10 px-1"
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
                color: t.muted,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
              className="text-[11px]"
            >
              v2.4.1 · Production
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
