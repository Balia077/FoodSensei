import { Utensils, LeafyGreen } from "lucide-react";
import { Link } from "react-router-dom";

const HeroText = () => {
  return (
    <div className="relative w-full min-h-[92vh] bg-[#EFF5F3] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-10">
      {/* === MAIN GLOW === */}
      <div
        className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[720px] lg:h-[720px] rounded-full 
        bg-[radial-gradient(circle,_rgba(16,185,129,0.35)_0%,_rgba(16,185,129,0.15)_35%,_transparent_70%)] blur-[40px] sm:blur-[50px]"
      />

      <div
        className="absolute w-[400px] h-[400px] sm:w-[700px] sm:h-[700px] lg:w-[900px] lg:h-[900px] rounded-full 
        bg-[radial-gradient(circle,_rgba(34,197,94,0.18)_0%,_transparent_70%)] blur-[60px] sm:blur-[70px]"
      />

      <div
        className="absolute w-[500px] h-[500px] sm:w-[900px] sm:h-[900px] lg:w-[1100px] lg:h-[1100px] rounded-full 
        bg-[radial-gradient(circle,_rgba(52,211,153,0.08)_0%,_transparent_75%)] blur-[80px] sm:blur-[90px]"
      />

      {/* === RINGS === */}
      <div className="absolute w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] rounded-full border border-emerald-400/30" />
      <div className="absolute w-[200px] h-[200px] sm:w-[340px] sm:h-[340px] lg:w-[520px] lg:h-[520px] rounded-full border border-emerald-400/20" />
      <div className="absolute w-[160px] h-[160px] sm:w-[280px] sm:h-[280px] lg:w-[440px] lg:h-[440px] rounded-full border border-emerald-400/15" />
      <div className="absolute w-[120px] h-[120px] sm:w-[220px] sm:h-[220px] lg:w-[360px] lg:h-[360px] rounded-full border border-emerald-400/10" />

      {/* === FLOATING ICON LEFT === */}
      <div className="absolute left-[5%] sm:left-[10%] lg:left-[15%] bottom-[10%] sm:bottom-[15%] lg:bottom-[20%] animate-floatSlow">
        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl shadow-md flex items-center justify-center">
          <LeafyGreen className="text-emerald-500" size={20} />
        </div>
      </div>

      {/* === FLOATING ICON RIGHT === */}
      <div className="absolute right-[5%] sm:right-[10%] lg:right-[15%] top-[10%] sm:top-[20%] lg:top-[25%] animate-float">
        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl shadow-md flex items-center justify-center">
          <Utensils className="text-emerald-500" size={20} />
        </div>
      </div>

      {/* === CONTENT === */}
      <div className="relative z-10 text-center max-w-2xl lg:max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] leading-tight font-semibold text-[#1f2937] tracking-tight">
          Eat smarter, live better <br />
          <span className="font-medium">— your personal Food Sensei</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-gray-500 text-base sm:text-lg">
          Discover healthy recipes, personalized meal plans, and nutrition
          guidance tailored just for you.
        </p>

        <Link to={'/analyze'}>
          <button className="mt-6 sm:mt-8 px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base cursor-pointer bg-black text-white rounded-full shadow-lg hover:scale-105 transition-all duration-300">
            Try it Now →
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HeroText;
