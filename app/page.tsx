import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
      <Navbar />
      <Hero />
      <Features />
      
      {/* Scrollable sections below */}
      <div className="space-y-32 pb-20">
        {/* We will add Testimonials, Pricing, FAQ, etc. here in next steps */}
      </div>
    </main>
  );
}
