import React from "react";
import { Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="text-[#222222] w-full h-25 border-b border-zinc-300 flex items-center px-10 gap-12">
      
      <div className="logo font-[font-1]">
        <h2 className="text-3xl">
          Food<span className="text-[#F30819]">Sensei</span>
        </h2>
      </div>

      <div className="navcontents font-[helvetica] capitalize flex gap-10 items-center h-12 w-105 text-[#222222] rounded-4xl">
        
        <Link className="font-semibold" to="/">
          Home
        </Link>

        <Link className="flex font-semibold" to="#">
          Feature
          <ChevronDown className="mt-1" size={17} />
        </Link>

        <Link className="font-semibold" to="#">
          FP
        </Link>

        <Link className="font-semibold" to="#">
          About
        </Link>

        <Link className="font-semibold" to="#">
          Contact
        </Link>
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5 w-125 rounded-4xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl inset-shadow-sm">
        <Search className="text-black/70" size={20} />

        <input
          type="text"
          placeholder="Search healthy food..."
          className="bg-transparent outline-none text-black placeholder:text-black/60 w-full"
        />
      </div>

      <div className="flex font-[helvetica] gap-5">
        
        <Link to="/register">
          <button className="text-md font-bold text-[#222222] rounded-4xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl inset-shadow-sm px-5 py-2">
            Sign Up
          </button>
        </Link>

        <Link to="/login">
          <button className="text-md font-bold px-5 rounded-4xl backdrop-blur-xl bg-black border border-white/20 shadow-xl/20 text-white py-2">
            Login
          </button>
        </Link>

      </div>
    </div>
  );
};

export default Navbar;