import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { t } from "@/lib/i18n";
import { Menu, X, Gamepad2, Trophy, User, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: t("home"), icon: Gamepad2 },
    { to: "/leaderboard", label: t("leaderboard"), icon: Trophy },
    { to: "/winners", label: t("weeklyWinners"), icon: Trophy },
    { to: "/rules", label: t("rules") },
    { to: "/login", label: t("login"), icon: LogIn },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <Gamepad2 className="w-7 h-7 text-primary" />
          <span className="font-display text-lg font-bold text-primary neon-text">
            TAP BATTLE BD
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
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
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm"
          >
            {t("dashboard")}
          </Link>
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
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm text-center"
              >
                {t("dashboard")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
