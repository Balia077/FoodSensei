import React from "react";
import { Search } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="text-white w-full h-25 border-b-2 border-zinc-700 flex items-center px-10 gap-12">
      <div className="logo font-[font-1]">
        <h2 className="text-3xl">
          Food<span className="text-[#f73b3b]">Sensei</span>
        </h2>
      </div>
      <div className="navcontents font-[lemon-milk] flex justify-around items-center h-12 w-140 backdrop-blur-md bg-white/10 border-b border-white/20 text-white rounded-4xl">
        <a className="text-sm text-zinc-300" href="">
          HOME
        </a>
        <a className="text-sm text-zinc-300" href="">
          FEATURE
        </a>
        <a className="text-sm text-zinc-300" href="">
          FP
        </a>
        <a className="text-sm text-zinc-300" href="">
          ABOUT
        </a>
        <a className="text-sm text-zinc-300" href="">
          CONTACT
        </a>
      </div>
      <div
        className="
        flex items-center gap-3
        px-4 py-2.5 w-75
        rounded-4xl
        backdrop-blur-xl
        bg-white/10
        border border-white/20
        shadow-xl
      "
      >
        <Search className="text-white/70" size={20} />

        <input
          type="text"
          placeholder="Search healthy food..."
          className="
            bg-transparent
            outline-none
            text-white
            placeholder:text-white/60
            w-full
          "
        />
      </div>
      <div className="flex justify-between font-[lemon-milk] gap-7">
        <button className="text-md font-bold border-2 text-zinc-300 border-zinc-600 rounded-4xl px-7 ">Sign Up</button>
        <button className="text-md font-bold bg-white px-7 py-2.5 rounded-4xl text-black">Login</button>
      </div>
    </div>
  );
};

export default Navbar;
