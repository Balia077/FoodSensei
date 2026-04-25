import React from "react";
import {
  ScanLine,
  Search,
  BarChart3,
  Utensils,
  Activity,
  Apple,
} from "lucide-react";
import { Link } from "react-router-dom";

const Features = () => {
  const features = [
    {
      icon: ScanLine,
      title: "Barcode Scanner",
      desc: "Scan food barcodes and instantly get detailed nutrition information.",
    },
    {
      icon: Search,
      title: "Food Name Search",
      desc: "Search any food manually and get calories, macros, and ingredients.",
    },
    {
      icon: BarChart3,
      title: "Macros Chart",
      desc: "Visual breakdown of protein, carbs, and fats in your daily diet.",
    },
    {
      icon: Utensils,
      title: "Meal Tracking",
      desc: "Log your meals easily and track what you eat throughout the day.",
    },
    {
      icon: Activity,
      title: "Health Insights",
      desc: "Get smart insights about your eating habits and nutrition balance.",
    },
    {
      icon: Apple,
      title: "Healthy Suggestions",
      desc: "Receive healthier food alternatives based on what you consume.",
    },
  ];

  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-5 py-8 sm:px-10 md:px-14 rounded-tr-3xl rounded-tl-3xl">
      {/* Mobile-first Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/30 border-b border-white/10 py-4 mb-8">
        <h1 className="font-[thunder-font] text-3xl sm:text-4xl md:text-[4vw] tracking-wider">
          Features
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Simple tools to track your food smarter
        </p>
      </div>

      {/* Mobile-first layout (single column -> grid on larger screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((item, index) => (
          <div
            key={index}
            className="relative p-5 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/10 transition duration-300 overflow-hidden"
          >
            {/* glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-lime-400/10 via-transparent to-transparent opacity-20" />

            <div className="relative z-10 flex gap-4 sm:block">
              {/* Icon */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-lime-400/20 border border-lime-300/30 text-lime-300 shrink-0">
                <item.icon size={20} />
              </div>

              {/* Text */}
              <div className="sm:mt-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  {item.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile CTA bar */}
      <Link to={'/analyze'}>
        <div className="fixed bottom-4 left-0 right-0 flex justify-center sm:hidden">
          <button className="bg-lime-400 text-black font-semibold px-6 py-3 rounded-full shadow-lg">
            Analyze Now
          </button>
        </div>
      </Link>
    </div>
  );
};

export default Features;
