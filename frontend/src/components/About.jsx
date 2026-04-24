import React from "react";
import { motion } from "framer-motion";
import { Apple, Activity, BarChart3 } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen w-full bg-[#0E0E0F] text-white px-5 py-10 sm:px-10 md:px-16">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide">
          About Food Sensei
        </h1>
        <p className="text-zinc-400 mt-4 text-sm sm:text-base">
          Your smart companion to understand food, track nutrition, and build healthier habits.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-5xl mx-auto">
        {[
          {
            title: "Our Mission",
            desc: "To simplify nutrition tracking and help people make smarter food choices every day.",
          },
          {
            title: "Our Vision",
            desc: "A world where everyone understands what they eat and lives a healthier life.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
            <p className="text-zinc-400 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
          What makes us different
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            {
              icon: Apple,
              title: "Smart Food Analysis",
              desc: "Understand exactly what you're eating with detailed breakdowns.",
            },
            {
              icon: Activity,
              title: "Health Insights",
              desc: "Track patterns and improve your diet with actionable insights.",
            },
            {
              icon: BarChart3,
              title: "Visual Tracking",
              desc: "Clear charts to monitor your nutrition progress easily.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-5 rounded-xl border border-white/10 bg-white/5"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 mb-3">
                <item.icon size={20} />
              </div>
              <h3 className="font-semibold text-base">{item.title}</h3>
              <p className="text-zinc-400 text-sm mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;