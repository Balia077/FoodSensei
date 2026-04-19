import React, { useState } from "react";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { loggedIn, logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  const getInitials = () => {
    if(!user?.username) return "U";
    return user.username.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-[#EFF5F3] px-4 lg:px-10 py-3 flex items-center justify-between relative">

      {/* Logo */}
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
        Food<span className="text-[#00CD6E]">Sensei</span>
      </h2>

      {/* Desktop Links */}
      <div className="hidden lg:flex gap-8 font-semibold items-center">
        <Link to="/">Home</Link>

        <div className="flex items-center gap-1 cursor-pointer">
          Feature <ChevronDown size={16} />
        </div>

        <Link to="#">FP</Link>
        <Link to="#">About</Link>
        <Link to="#">Contact</Link>
      </div>

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 px-4 py-2 w-[40%] lg:w-[30%] rounded-full bg-white/30 backdrop-blur-md shadow-sm">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search Food..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex items-center gap-4">

        {/* If NOT logged in */}
        {!loggedIn && (
          <Link to="/login">
            <button className="relative overflow-hidden px-4 py-2 rounded-md font-bold shadow-sm group">
              <span className="absolute inset-0 bg-black scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100"></span>
              <span className="relative z-10 group-hover:text-white transition">
                Sign in
              </span>
            </button>
          </Link>
        )}

        {/* If logged in */}
        {loggedIn && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
              {getInitials()}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-[#EFF5F3] shadow-md flex flex-col items-center gap-5 py-6 lg:hidden z-50">

          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="#" onClick={() => setOpen(false)}>Feature</Link>
          <Link to="#" onClick={() => setOpen(false)}>FP</Link>
          <Link to="#" onClick={() => setOpen(false)}>About</Link>
          <Link to="#" onClick={() => setOpen(false)}>Contact</Link>

          {!loggedIn ? (
            <Link to="/login">
              <button className="font-bold px-5 py-2 border rounded-full">
                Sign in
              </button>
            </Link>
          ) : (
            <button
              className="font-bold px-5 py-2 border rounded-full"
            >
              Profile
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;