import React, { useState } from "react";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-[#222222] h-[10vh] bg-[#F8F2F0] w-full border-b border-zinc-300 flex items-center justify-between px-4 lg:px-10 py-3">

      <h2 className="text-xl sm:text-2xl lg:text-3xl font-[font-1]">
        Food<span className="text-[#F30819]">Sensei</span>
      </h2>

      <div className="hidden lg:flex gap-10 items-center font-semibold">
        <Link to="/">Home</Link>

        <Link className="flex items-center gap-1" to="#">
          Feature <ChevronDown size={16} />
        </Link>

        <Link to="#">FP</Link>
        <Link to="#">About</Link>
        <Link to="#">Contact</Link>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 w-[45%] sm:w-[40%] lg:w-[30%] rounded-full backdrop-blur-xl bg-white/20 border border-white/30 shadow-md">
        <Search size={18} className="text-black/70" />
        <input
          type="text"
          placeholder="Search Food..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-black/60"
        />
      </div>

      <div className="hidden lg:flex gap-4">
        <Link to="/register">
          <button className="font-bold rounded-full bg-white/20 border px-4 py-2 shadow">
            Sign Up
          </button>
        </Link>

        <Link to="/login">
          <button className="font-bold rounded-full bg-black text-white px-4 py-2 shadow">
            Login
          </button>
        </Link>
      </div>

      <div className="lg:hidden">
        <button onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="absolute top-[70px] left-0 w-full bg-[#F8F2F0] shadow-md flex flex-col items-center gap-5 py-6 lg:hidden z-50">

          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="#" onClick={() => setOpen(false)}>Feature</Link>
          <Link to="#" onClick={() => setOpen(false)}>FP</Link>
          <Link to="#" onClick={() => setOpen(false)}>About</Link>
          <Link to="#" onClick={() => setOpen(false)}>Contact</Link>

          <Link to="/register">
            <button className="font-bold rounded-full bg-white/20 border px-5 py-2">
              Sign Up
            </button>
          </Link>

          <Link to="/login">
            <button className="font-bold rounded-full bg-black text-white px-5 py-2">
              Login
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;