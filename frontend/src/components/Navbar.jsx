import React, { useRef, useState } from "react";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const btnGreen = useRef(null)
  const text = useRef(null)

  return (
    <div className="text-[#222222] bg-[#EFF5F3] w-full flex items-center justify-between px-4 lg:px-10 py-3">

      <h2 className="text-xl sm:text-2xl lg:text-3xl font-[font-1]">
        Food<span className="text-[#00CD6E]">Sensei</span>
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

      <div
        onMouseEnter={()=> {
          btnGreen.current.style.height="5.5vh"
          text.current.style.color="white"
        }}
        onMouseLeave={()=> {
          btnGreen.current.style.height="0"
          text.current.style.color="black"
        }}
        className="hidden lg:flex">
        <Link to="/register">
          <div ref={btnGreen} className="absolute h-0 w-[11.5vh] rounded-full bg-black font-bold justify-center flex items-center transition-all"></div>
          <div ref={text} className="relative font-bold rounded-full bg-white/20 text-black px-4 py-2 shadow-md">Sign in</div>
        </Link>


      </div>

      <div className="lg:hidden">
        <button onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="absolute top-17.5 left-0 w-full bg-[#EFF5F3] shadow-md flex flex-col items-center gap-5 py-6 lg:hidden z-50">

          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="#" onClick={() => setOpen(false)}>Feature</Link>
          <Link to="#" onClick={() => setOpen(false)}>FP</Link>
          <Link to="#" onClick={() => setOpen(false)}>About</Link>
          <Link to="#" onClick={() => setOpen(false)}>Contact</Link>

          <Link to="/register">
            <button className="font-bold rounded-full bg-white/20 border px-5 py-2">
              Sign in
            </button>
          </Link>


        </div>
      )}
    </div>
  );
};

export default Navbar;