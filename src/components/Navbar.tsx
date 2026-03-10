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
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm"
              >
                {t("dashboard")}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                  <Avatar className="h-8 w-8 border border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">{profile?.username}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> ড্যাশবোর্ড
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" /> প্রোফাইল
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <History className="w-4 h-4 mr-2" /> অ্যাটেম্পট হিস্ট্রি
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> লগআউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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
                  <div className="flex items-center gap-3 py-2 border-t border-border/30 mt-2 pt-3">
                    <Avatar className="h-8 w-8 border border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{profile?.username}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary py-2 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> ড্যাশবোর্ড
                  </Link>
                  <Link to="/profile" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary py-2 flex items-center gap-2">
                    <User className="w-4 h-4" /> প্রোফাইল
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
