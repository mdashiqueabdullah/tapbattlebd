import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { t } from "@/lib/i18n";
import { Menu, X, Gamepad2, Trophy, LogIn, UserPlus, LayoutDashboard, User, History, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const publicLinks = [
    { to: "/", label: t("home"), icon: Gamepad2 },
    { to: "/leaderboard", label: t("leaderboard"), icon: Trophy },
    { to: "/winners", label: t("monthlyWinners"), icon: Trophy },
    { to: "/rules", label: t("rules") },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const initials = profile?.username?.slice(0, 2).toUpperCase() || "U";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Gamepad2 className="w-7 h-7 text-primary" />
          <span className="font-display text-lg font-bold text-primary neon-text">
            TAP BATTLE BD
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {publicLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}

          {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm"
              >
                {t("dashboard")}
              </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="flex items-center gap-1"><LogIn className="w-4 h-4" /> {t("login")}</span>
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm"
              >
                <span className="flex items-center gap-1"><UserPlus className="w-4 h-4" /> রেজিস্টার</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass-card border-t border-border/30"
          >
            <div className="container py-4 flex flex-col gap-3">
              {publicLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                >
                  {l.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary py-2 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> ড্যাশবোর্ড
                  </Link>
                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="text-sm font-medium text-destructive hover:text-destructive/80 py-2 flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" /> লগআউট
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary py-2 flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> {t("login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm text-center"
                  >
                    রেজিস্টার
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
