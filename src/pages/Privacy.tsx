import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto prose prose-invert prose-sm">
          <h1 className="text-xl font-bold text-foreground mb-6">গোপনীয়তা নীতি</h1>
          <div className="glass-card p-6 space-y-4 text-sm text-muted-foreground">
            <p>Tap Battle BD আপনার ব্যক্তিগত তথ্যের গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেয়।</p>
            <h3 className="text-foreground font-bold">তথ্য সংগ্রহ</h3>
            <p>আমরা শুধুমাত্র রেজিস্ট্রেশন এবং পেআউটের জন্য প্রয়োজনীয় তথ্য সংগ্রহ করি: নাম, ইমেইল, মোবাইল নম্বর, এবং পেমেন্ট তথ্য।</p>
            <h3 className="text-foreground font-bold">তথ্য ব্যবহার</h3>
            <p>আপনার তথ্য শুধুমাত্র গেম পরিচালনা, লিডারবোর্ড প্রদর্শন, এবং পুরস্কার বিতরণের জন্য ব্যবহৃত হয়।</p>
            <h3 className="text-foreground font-bold">তথ্য সুরক্ষা</h3>
            <p>আমরা আপনার তথ্য নিরাপদ রাখতে শিল্প-মানের সুরক্ষা ব্যবস্থা ব্যবহার করি।</p>
            <h3 className="text-foreground font-bold">যোগাযোগ</h3>
            <p>গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নে support@tapbattlebd.com এ যোগাযোগ করুন।</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
