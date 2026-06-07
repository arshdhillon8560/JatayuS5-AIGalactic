import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  PlusCircle,
  ChevronRight,
  FileText,
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";

import Logo from "../assets/logo.png";

function StatCard({ label, value, color, Icon }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: color + "15",
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>

      <div>
        <p
          className="text-2xl font-bold text-slate-800"
          style={{
            fontFamily: "Playfair Display, serif",
          }}
        >
          {value}
        </p>

        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [apps, setApps] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/application/all")

      .then((r) => setApps(r.data))

      .catch(() => {})

      .finally(() => setLoading(false));
  }, []);

  /* STATUS COUNTS */

  const approved = apps.filter((a) => a.status === "APPROVED").length;

  const pending = apps.filter((a) => a.status === "PENDING").length;

  const escalated = apps.filter((a) => a.status === "ESCALATED").length;

  const rejected = apps.filter((a) => a.status === "REJECTED").length;

  /* DATE FORMAT */

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  /* GREETING */

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
      {/* HEADER */}

      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-3.5 flex items-center justify-between">
          <img src={Logo} alt="Jatayu" className="h-8 object-contain" />

          <div className="flex items-center gap-3">
            {/* USER */}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm">
              <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold">
                {user?.full_name?.[0]?.toUpperCase()}
              </div>

              {user?.full_name?.split(" ")[0]}
            </div>

            {/* LOGOUT */}

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn-danger"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* TOP */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-up">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {greeting},{" "}
              <span className="text-sky-600">
                {user?.full_name?.split(" ")[0]}
              </span>
            </h1>

            <p className="text-slate-500 mt-1 text-sm">
              Manage your loan applications from your personal dashboard
            </p>
          </div>

          <button className="btn-primary" onClick={() => navigate("/apply")}>
            <PlusCircle size={16} />
            New Application
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 fade-up-2">
          <StatCard
            label="Total Applications"
            value={apps.length}
            color="#0ea5e9"
            Icon={FileText}
          />

          <StatCard
            label="Approved"
            value={approved}
            color="#22c55e"
            Icon={CheckCircle}
          />

          <StatCard
            label="Pending"
            value={pending}
            color="#f59e0b"
            Icon={Clock}
          />

          <StatCard
            label="Escalated"
            value={escalated}
            color="#a855f7"
            Icon={AlertCircle}
          />

          <StatCard
            label="Rejected"
            value={rejected}
            color="#ef4444"
            Icon={XCircle}
          />
        </div>

        {/* PROCESS */}

        <div className="card p-6 mb-8 fade-up-3">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-base">
            <TrendingUp size={16} className="text-sky-500" />
            How the Loan Process Works
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              {
                n: "1",
                t: "Loan Details",
                d: "Amount, tenure & purpose",
              },
              {
                n: "2",
                t: "Personal Info",
                d: "Profile & ID details",
              },
              {
                n: "3",
                t: "Employment",
                d: "Job & income details",
              },
              {
                n: "4",
                t: "Financials",
                d: "Bank & existing loans",
              },
              {
                n: "5",
                t: "Documents",
                d: "Upload statements & slips",
              },
              {
                n: "6",
                t: "KYC & Decision",
                d: "PAN + Aadhaar → AI result",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 text-xs font-bold flex items-center justify-center mb-2">
                  {s.n}
                </div>

                <p className="text-slate-700 text-xs font-semibold">{s.t}</p>

                <p className="text-slate-400 text-[10px] mt-0.5">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* APPLICATIONS */}

        <div className="fade-up-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              Your Applications
            </h2>

            <span className="text-sm text-slate-400">{apps.length} total</span>
          </div>

          {loading ? (
            <div className="card p-12 flex justify-center">
              <span className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : apps.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-4">
                <FileText size={22} className="text-sky-400" />
              </div>

              <h3 className="text-slate-700 font-semibold mb-1">
                No applications yet
              </h3>

              <p className="text-slate-400 text-sm mb-5">
                Start your first loan application to get funded fast
              </p>

              <button
                className="btn-primary"
                onClick={() => navigate("/apply")}
              >
                Apply Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app, i) => (
                <button
                  key={app.application_id}
                  onClick={() => navigate(`/status/${app.application_id}`)}
                  className="w-full card p-5 hover:shadow-md hover:border-sky-200 transition-all text-left flex items-center justify-between group"
                  style={{
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                      <IndianRupee size={16} className="text-sky-500" />
                    </div>

                    <div>
                      <p className="text-slate-700 font-semibold text-sm">
                        Application{" "}
                        <span className="font-mono text-sky-600">
                          #{app.application_id.slice(-8).toUpperCase()}
                        </span>
                      </p>

                      <p className="text-slate-400 text-xs mt-0.5">
                        Applied on {fmtDate(app.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />

                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-sky-500 transition-colors"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
