import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const sections = [
    {
      title: "Features",
      links: [
        { label: "Barcode Scanner", to: "/analyze" },
        { label: "Food Search", to: "/analyze" },
        { label: "Meal Tracking", to: "/analyze" },
        { label: "Health Insights", to: "/analyze" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", to: "/about" },
        { label: "Contact", to: "/contact" },
        { label: "Privacy Policy", to: "#" },
        { label: "Terms", to: "#" },
      ],
    },
    {
      title: "Social",
      links: [
        { label: "Instagram", href: "https://www.instagram.com/ig.balia.01/" },
        { label: "Github", href: "https://github.com/Balia077" },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/balaram-das-96b514333/" },
      ],
    },
    {
      title: "Contact",
      custom: (
        <>
          <p className="mb-2">balaramd894@gmail.com</p>
          <p className="mb-2">+91 7377321480</p>
        </>
      ),
    },
  ];

  return (
    <footer className="w-full bg-zinc-900 text-white font-[font-1] px-6 sm:px-10 md:px-14 py-14">
      
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Left */}
        <div className="md:w-1/2 flex flex-col justify-between gap-10">
          <div>
            <h1 className="text-[12vw] md:text-[6vw] uppercase leading-none">
              Eat
            </h1>
            <h1 className="text-[12vw] md:text-[6vw] uppercase leading-none">
              Smarter
            </h1>
          </div>

          <div className="text-xl sm:text-2xl font-semibold">
            Food Sensei
          </div>
        </div>

        {/* Right */}
        <div className="md:w-1/2 flex flex-col justify-between">
          
          {/* Tagline */}
          <h1 className="text-[10vw] md:text-[4vw] uppercase leading-tight">
            Nutrition
            <br />
            Simplified
          </h1>

          {/* Dynamic Sections */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-8 mt-10 text-sm">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="mb-4 text-zinc-400">{section.title}</h2>

                {section.custom ? (
                  section.custom
                ) : (
                  section.links.map((link, idx) =>
                    link.to ? (
                      <Link
                        key={idx}
                        to={link.to}
                        className="block mb-2 hover:text-white/80 transition"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        key={idx}
                        href={link.href}
                        className="block mb-2 hover:text-white/80 transition"
                      >
                        {link.label}
                      </a>
                    )
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 border-t border-white/10 pt-6 text-xs text-zinc-500 flex flex-col sm:flex-row justify-between gap-3">
        <p>© {new Date().getFullYear()} Food Sensei</p>
        <p>All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;