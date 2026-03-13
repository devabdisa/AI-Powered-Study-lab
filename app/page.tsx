import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      <Navbar />
      <Hero />
      
      {/* Scrollable sections below */}
      <div className="space-y-32 pb-20">
        {/* We will add Features, Pricing, FAQ, etc. here in next steps */}
        <section id="features" className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Powerful Features Coming Soon</h2>
            <p className="text-slate-400">We are currently building the Bento Grid features section to showcase everything Study Buddy can do.</p>
        </section>
      </div>
    </main>
  );
}
