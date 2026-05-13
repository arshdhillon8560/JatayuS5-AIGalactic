// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { officerAPI } from "../services/api";
// import { useAuth } from "../contexts/AuthContext";
// import { LogOut, FileText, AlertTriangle, LayoutDashboard } from "lucide-react";

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

//   .db-root * { box-sizing: border-box; margin: 0; padding: 0; }

//   .db-root {
//     font-family: 'DM Sans', sans-serif;
//     background: #F7F8FA;
//     min-height: 100vh;
//     display: grid;
//     grid-template-rows: auto 1fr;
//   }

//   /* ── NAVBAR ── */
//   .db-navbar {
//     background: #fff;
//     border-bottom: 1px solid #E4E8EF;
//     padding: 0 40px;
//     height: 56px;
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     position: sticky;
//     top: 0;
//     z-index: 10;
//   }

//   .db-nav-brand {
//     display: flex;
//     align-items: center;
//     gap: 10px;
//   }

//   .db-nav-logo-mark {
//     width: 28px;
//     height: 28px;
//     background: #0C2D48;
//     border-radius: 6px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//   }

//   .db-nav-brand-text {
//     font-size: 14px;
//     font-weight: 600;
//     color: #0C2D48;
//     letter-spacing: -0.01em;
//   }

//   .db-nav-brand-text span { color: #2B7FD4; }

//   .db-nav-center {
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     font-size: 13px;
//     font-weight: 500;
//     color: #4A5568;
//   }

//   .db-logout-btn {
//     display: flex;
//     align-items: center;
//     gap: 7px;
//     padding: 7px 14px;
//     font-size: 13px;
//     font-weight: 500;
//     font-family: 'DM Sans', sans-serif;
//     color: #B91C1C;
//     background: #FEF2F2;
//     border: 1px solid #FCA5A5;
//     border-radius: 7px;
//     cursor: pointer;
//     transition: background 0.15s, border-color 0.15s;
//   }

//   .db-logout-btn:hover {
//     background: #FEE2E2;
//     border-color: #F87171;
//   }

//   /* ── PAGE BODY ── */
//   .db-body {
//     max-width: 1200px;
//     margin: 0 auto;
//     padding: 40px;
//     width: 100%;
//   }

//   /* ── PAGE HEADER ── */
//   .db-page-header {
//     display: flex;
//     align-items: center;
//     gap: 12px;
//     margin-bottom: 28px;
//   }

//   .db-page-icon {
//     width: 36px;
//     height: 36px;
//     background: #FEF3C7;
//     border-radius: 8px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     color: #D97706;
//   }

//   .db-page-title {
//     font-size: 22px;
//     font-weight: 600;
//     color: #0C2D48;
//     letter-spacing: -0.02em;
//   }

//   .db-page-count {
//     margin-left: auto;
//     font-size: 12px;
//     font-weight: 500;
//     color: #6B7585;
//     background: #F0F3F7;
//     border: 1px solid #E4E8EF;
//     border-radius: 100px;
//     padding: 3px 12px;
//     font-family: 'DM Mono', monospace;
//   }

//   /* ── EMPTY / LOADING STATES ── */
//   .db-state {
//     text-align: center;
//     padding: 64px 0;
//     font-size: 14px;
//     color: #8893A4;
//   }

//   /* ── GRID ── */
//   .db-grid {
//     display: grid;
//     grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
//     gap: 20px;
//   }

//   /* ── CARD ── */
//   .db-card {
//     background: #fff;
//     border: 1px solid #E4E8EF;
//     border-radius: 12px;
//     padding: 24px;
//     cursor: pointer;
//     transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
//     position: relative;
//     overflow: hidden;
//   }

//   .db-card:hover {
//     border-color: #B5D4F4;
//     box-shadow: 0 4px 20px rgba(12, 45, 72, 0.08);
//     transform: translateY(-2px);
//   }

//   .db-card-top {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//     margin-bottom: 16px;
//   }

//   .db-card-icon {
//     width: 40px;
//     height: 40px;
//     background: #E3F0FB;
//     border-radius: 8px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     color: #2B7FD4;
//   }

//   /* ── STATUS BADGES ── */
//   .db-badge {
//     font-size: 11px;
//     font-weight: 500;
//     padding: 3px 10px;
//     border-radius: 100px;
//     border: 1px solid;
//     letter-spacing: 0.01em;
//   }

//   .db-badge-escalated { color: #92400E; background: #FEF3C7; border-color: #FCD34D; }
//   .db-badge-approved  { color: #14532D; background: #DCFCE7; border-color: #86EFAC; }
//   .db-badge-rejected  { color: #B91C1C; background: #FEF2F2; border-color: #FCA5A5; }
//   .db-badge-default   { color: #1C5A8A; background: #E3F0FB; border-color: #B5D4F4; }

//   /* ── CARD CONTENT ── */
//   .db-card-id {
//     font-size: 13.5px;
//     font-weight: 600;
//     color: #0C2D48;
//     margin-bottom: 12px;
//     letter-spacing: -0.01em;
//     white-space: nowrap;
//     overflow: hidden;
//     text-overflow: ellipsis;
//     font-family: 'DM Mono', monospace;
//   }

//   .db-card-fields {
//     display: flex;
//     flex-direction: column;
//     gap: 7px;
//   }

//   .db-card-field {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     font-size: 12.5px;
//   }

//   .db-card-field-label { color: #8893A4; font-weight: 400; }
//   .db-card-field-value { color: #2D3748; font-weight: 500; }

//   .db-card-date {
//     font-size: 11px;
//     color: #9AA5B4;
//     margin-top: 14px;
//     padding-top: 12px;
//     border-top: 1px solid #F0F3F7;
//     font-family: 'DM Mono', monospace;
//   }

//   /* ── HOVER ACCENT ── */
//   .db-card-accent {
//     position: absolute;
//     bottom: 0; left: 0; right: 0;
//     height: 3px;
//     background: linear-gradient(90deg, #2B7FD4, #4CA3E3);
//     transform: scaleX(0);
//     transform-origin: left;
//     transition: transform 0.2s ease;
//   }

//   .db-card:hover .db-card-accent { transform: scaleX(1); }

//   @media (max-width: 768px) {
//     .db-navbar { padding: 0 20px; }
//     .db-nav-center { display: none; }
//     .db-body { padding: 24px 20px; }
//     .db-grid { grid-template-columns: 1fr; }
//   }
// `;

// export const Dashboard = () => {
//   const navigate = useNavigate();
//   const { logout } = useAuth();

//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     officerAPI.getEscalated()
//       .then((data) => setApplications(data.applications || []))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, []);

//   const getBadgeClass = (status) => {
//     switch (status) {
//       case "APPROVED":  return "db-badge db-badge-approved";
//       case "REJECTED":  return "db-badge db-badge-rejected";
//       case "ESCALATED": return "db-badge db-badge-escalated";
//       default:          return "db-badge db-badge-default";
//     }
//   };

//   return (
//     <>
//       <style>{styles}</style>
//       <div className="db-root">

//         {/* NAVBAR */}
//         <nav className="db-navbar">
//           {/* <div className="db-nav-brand">
//             <div className="db-nav-logo-mark">
//               <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
//                 <rect x="2" y="2" width="5" height="5" rx="1" fill="#4CA3E3"/>
//                 <rect x="9" y="2" width="5" height="5" rx="1" fill="#2B7FD4"/>
//                 <rect x="2" y="9" width="5" height="5" rx="1" fill="#2B7FD4"/>
//                 <rect x="9" y="9" width="5" height="5" rx="1" fill="#1A5FA0" opacity="0.7"/>
//               </svg>
//             </div>
//             <span className="db-nav-brand-text">Virtusa <span>LoanIQ</span></span>
//           </div> */}
//           <div className="flex justify-center items-center gap-2">
//             <img
//                   src="/src/assets/favicon.png"
//                   alt="Virtusa"
//                   className="h-8"
//                 />
//           </div>

//           <div className="db-nav-center">
//             <LayoutDashboard size={14} color="#9AA5B4" />
//             Credit Officer Dashboard
//           </div>

//           <button className="db-logout-btn" onClick={() => { logout(); navigate("/login"); }}>
//             <LogOut size={14} />
//             Sign out
//           </button>
//         </nav>

//         {/* BODY */}
//         <div className="db-body">

//           <div className="db-page-header">
//             <div className="db-page-icon">
//               <AlertTriangle size={18} />
//             </div>
//             <h1 className="db-page-title">Escalated Applications</h1>
//             {!loading && (
//               <span className="db-page-count">{applications.length} pending</span>
//             )}
//           </div>

//           {loading ? (
//             <div className="db-state">Loading applications…</div>
//           ) : applications.length === 0 ? (
//             <div className="db-state">No escalated applications found</div>
//           ) : (
//             <div className="db-grid">
//               {applications.map((app) => (
//                 <div
//                   key={app.application_id}
//                   className="db-card"
//                   onClick={() => navigate(`/application/${app.application_id}`)}
//                 >
//                   <div className="db-card-top">
//                     <div className="db-card-icon">
//                       <FileText size={18} />
//                     </div>
//                     <span className={getBadgeClass(app.status)}>{app.status}</span>
//                   </div>

//                   <p className="db-card-id">{app.application_id}</p>

//                   <div className="db-card-fields">
//                     <div className="db-card-field">
//                       <span className="db-card-field-label">Loan Amount</span>
//                       <span className="db-card-field-value">₹{app.loan_amount}</span>
//                     </div>
//                     <div className="db-card-field">
//                       <span className="db-card-field-label">Purpose</span>
//                       <span className="db-card-field-value">{app.loan_purpose}</span>
//                     </div>
//                   </div>

//                   <p className="db-card-date">
//                     {new Date(app.created_at).toLocaleString()}
//                   </p>

//                   <div className="db-card-accent" />
//                 </div>
//               ))}
//             </div>
//           )}

//         </div>
//       </div>
//     </>
//   );
// };


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { officerAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, FileText, AlertTriangle, ChevronRight,
  Clock, DollarSign, Tag, ShieldCheck,
} from "lucide-react";

// ── DESIGN TOKENS (mirrors ApplicationDetails) ─────────────────────────────
const t = {
  navy:    '#0B1F3A',
  navyMid: '#132D52',
  gold:    '#C8963E',
  goldLight:'#F0C96B',
  surface: '#F6F7FA',
  card:    '#FFFFFF',
  border:  '#E4E7EE',
  muted:   '#8A93A6',
  text:    '#1A2332',
};

// ── ANIMATION ──────────────────────────────────────────────────────────────
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ── STATUS CONFIG ──────────────────────────────────────────────────────────
const statusConfig = {
  ESCALATED: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B' },
  APPROVED:  { bg: '#F0FDF4', border: '#BBF7D0', text: '#14532D', dot: '#22C55E' },
  REJECTED:  { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#EF4444' },
  DEFAULT:   { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', dot: '#3B82F6' },
};

const getStatus = (s) => statusConfig[s] ?? statusConfig.DEFAULT;

// ── NAVBAR ─────────────────────────────────────────────────────────────────
const AppNavbar = ({ onLogout }) => (
  <nav
    style={{ background: t.navy, borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    className="h-14 px-8 flex items-center justify-between sticky top-0 z-30"
  >
    <div className="flex items-center gap-3">
      <img src="/src/assets/favicon.png" alt="Virtusa" className="h-7 brightness-0 invert opacity-90" />
      <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.18)' }} />
      <span
        style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}
        className="text-xs font-medium uppercase tracking-widest hidden md:block"
      >
        Loan Review Console
      </span>
    </div>

    <div
      className="hidden md:flex items-center gap-2 text-xs font-medium"
      style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif" }}
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      Credit Officer Dashboard
    </div>

    <button
      onClick={onLogout}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        color: 'rgba(255,255,255,0.6)',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        fontFamily: "'DM Sans', sans-serif",
        cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
    >
      <LogOut className="w-3.5 h-3.5" />
      Sign out
    </button>
  </nav>
);

// ── HERO BAND ──────────────────────────────────────────────────────────────
const HeroBand = ({ count, loading }) => (
  <div
    style={{ background: t.navyMid, borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    className="px-8 py-6"
  >
    <div className="max-w-5xl mx-auto flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(200,150,62,0.18)', border: '1px solid rgba(200,150,62,0.3)' }}
      >
        <AlertTriangle className="w-5 h-5" style={{ color: t.goldLight }} />
      </div>
      <div>
        <h1
          style={{ color: '#fff', fontFamily: "'Syne', sans-serif" }}
          className="text-lg font-semibold leading-tight"
        >
          Escalated Applications
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }} className="text-xs mt-0.5">
          Review and action applications flagged for officer decision
        </p>
      </div>
      {!loading && (
        <div
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span style={{ color: t.goldLight, fontFamily: "'IBM Plex Mono', monospace" }} className="text-base font-semibold">
            {count}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }} className="text-xs">
            pending
          </span>
        </div>
      )}
    </div>
  </div>
);

// ── APPLICATION CARD ───────────────────────────────────────────────────────
const AppCard = ({ app, onClick }) => {
  const status = getStatus(app.status);
  const initials = (app.applicant_name ?? app.application_id ?? 'NA')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      variants={fadeUp}
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(10,20,40,0.1)' }}
      whileTap={{ scale: 0.985 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        boxShadow: '0 1px 4px rgba(10,20,40,0.05)',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#B5D4F4'}
      onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
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
              background: t.navy + '0E',
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
            style={{ background: status.bg, border: `1px solid ${status.border}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: status.dot }} />
            <span
              style={{ color: status.text, fontFamily: "'DM Sans', sans-serif" }}
              className="text-[10px] font-medium"
            >
              {app.status ?? 'PENDING'}
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
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: t.muted, fontFamily: "'DM Sans', sans-serif" }}>
              <DollarSign className="w-3 h-3" />
              Loan Amount
            </span>
            <span
              className="text-[12px] font-semibold"
              style={{ color: t.text, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              ₹{Number(app.loan_amount ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px]" style={{ color: t.muted, fontFamily: "'DM Sans', sans-serif" }}>
              <Tag className="w-3 h-3" />
              Purpose
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: t.text, fontFamily: "'DM Sans', sans-serif" }}
            >
              {app.loan_purpose ?? '—'}
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
            {new Date(app.created_at).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          <span
            className="flex items-center gap-1 text-[10px] font-medium transition-colors"
            style={{ color: '#2B7FD4', fontFamily: "'DM Sans', sans-serif" }}
          >
            Review <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── SKELETON CARD ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{ background: t.card, border: `1px solid ${t.border}` }}
  >
    <div className="h-0.5 w-full" style={{ background: t.border }} />
    <div className="p-5 flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: t.border }} />
        <div className="w-20 h-6 rounded-full animate-pulse" style={{ background: t.border }} />
      </div>
      <div className="w-3/4 h-3 rounded animate-pulse" style={{ background: t.border }} />
      <div className="w-full h-16 rounded-xl animate-pulse" style={{ background: t.surface }} />
      <div className="w-1/2 h-3 rounded animate-pulse" style={{ background: t.border }} />
    </div>
  </div>
);

// ── EMPTY STATE ────────────────────────────────────────────────────────────
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
    >
      <ShieldCheck className="w-7 h-7" style={{ color: '#22C55E' }} />
    </div>
    <p style={{ color: t.text, fontFamily: "'Syne', sans-serif" }} className="text-base font-semibold mb-1">
      All clear
    </p>
    <p style={{ color: t.muted, fontFamily: "'DM Sans', sans-serif" }} className="text-sm">
      No escalated applications pending review
    </p>
  </motion.div>
);

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    officerAPI.getEscalated()
      .then((data) => setApplications(data.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen" style={{ background: t.surface, fontFamily: "'DM Sans', sans-serif" }}>
      <AppNavbar onLogout={handleLogout} />
      <HeroBand count={applications.length} loading={loading} />

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
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
              style={{ color: '#16A34A', fontFamily: "'DM Sans', sans-serif" }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              TLS 1.3 encrypted
            </span>
            <span style={{ color: t.muted, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[11px]">
              v2.4.1 · Production
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};