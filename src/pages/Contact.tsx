import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> যোগাযোগ
          </h1>
          <div className="glass-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground">যেকোনো সমস্যা বা প্রশ্নে আমাদের সাথে যোগাযোগ করুন।</p>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">ইমেইল</p>
                <p className="text-sm text-muted-foreground">support@tapbattlebd.com</p>
              </div>
            </div>
            <form className="space-y-3 mt-4" onSubmit={e => e.preventDefault()}>
              <input placeholder="আপনার নাম" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input placeholder="ইমেইল" type="email" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <textarea placeholder="আপনার বার্তা" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 h-24" />
              <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold">
                পাঠান
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
