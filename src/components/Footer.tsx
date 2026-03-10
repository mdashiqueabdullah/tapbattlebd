import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 bg-card/50 py-10 mt-12">
      <div className="container">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <span className="font-display text-sm font-bold text-primary">TAP BATTLE BD</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
             <Link to="/rules" className="hover:text-primary transition-colors">নিয়মাবলী</Link>
            <Link to="/referral-rules" className="hover:text-primary transition-colors">রেফার রুলস</Link>
            <Link to="/faq" className="hover:text-primary transition-colors">জিজ্ঞাসা</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">গোপনীয়তা</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">শর্তাবলী</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">যোগাযোগ</Link>
          </div>
          <p className="text-xs text-muted-foreground">© ২০২৬ Tap Battle BD. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
}
