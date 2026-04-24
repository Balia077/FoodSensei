import { motion } from "framer-motion";
import React from "react";

const Marquee = () => {
  return (
    <div
      data-scroll
      data-scroll-section
      data-scroll-speed="0.01"
      className="hidden sm:block w-full text-white py-10 rounded-tr-3xl rounded-tl-3xl bg-[#004D43]"
    >
      <div className="border-t-2 border-b-2 mt-15 whitespace-nowrap overflow-hidden border-zinc-400 flex">
        <motion.h1
          initial={{ x: "0" }}
          animate={{ x: "-100%" }}
          transition={{ ease: "linear", repeat: Infinity, duration: 10 }}
          className="uppercase text-[27vw] lg:leading-[40vw] font-[thunder-font] -mt-[6.5vw] pr-20 -mb-[12vw]"
        >
          Food Sensei
        </motion.h1>

        <motion.h1
          initial={{ x: "0" }}
          animate={{ x: "-100%" }}
          transition={{ ease: "linear", repeat: Infinity, duration: 10 }}
          className="uppercase text-[27vw] lg:leading-[40vw] font-[thunder-font] -mt-[6.5vw] pr-20 -mb-[12vw]"
        >
          Food Sensei
        </motion.h1>

        <motion.h1
          initial={{ x: "0" }}
          animate={{ x: "-100%" }}
          transition={{ ease: "linear", repeat: Infinity, duration: 10 }}
          className="uppercase text-[27vw] lg:leading-[40vw] font-[thunder-font] -mt-[6.5vw] pr-20 -mb-[12vw]"
        >
          Food Sensei
        </motion.h1>
      </div>
    </div>
  );
};

export default Marquee;
