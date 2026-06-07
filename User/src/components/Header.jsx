import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/logo.png";

export default function Header({
  showBack = true,
  backLabel = "Dashboard",
  backPath = "/dashboard",
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-3.5 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Jatayu" className="h-8 object-contain" />
          {showBack && (
            <button
              onClick={() => navigate(backPath)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-sky-600 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              {backLabel}
            </button>
          )}
        </div>

        {/* Right */}
        <button onClick={handleLogout} className="btn-danger">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
