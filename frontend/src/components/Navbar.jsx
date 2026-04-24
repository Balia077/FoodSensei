import React, { useState } from "react";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { loggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const getInitials = () => {
    if (!user?.username) return "U";
    return user.username.slice(0, 2).toUpperCase();
  };

  const profileOpener = async () => {
    // For now, just open profile page on click

    navigate("/profile");
  };

  return (
    <nav className="bg-[#EFF5F3] fixed px-4 lg:px-10 py-3 flex items-center justify-between relative">
      {/* Logo */}
      <Link to={"/"}>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Food<span className="text-[#00CD6E] font-[font-1]">Sensei</span>
        </h2>
      </Link>

      {/* Desktop Links */}
      <div className="hidden lg:flex gap-10 font-semibold items-center text-zinc-700">
        <Link to="/">Home</Link>

        <Link to={"/analyze"}>Analyze</Link>

        <Link to="/foodproduct">Food Log</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex items-center gap-4">
        {/* If NOT logged in */}
        {!loggedIn && (
          <Link to="/login">
            <button className="relative overflow-hidden px-4 py-2 rounded-md font-bold shadow-sm group cursor-pointer">
              <span className="absolute inset-0 bg-black scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100"></span>
              <span className="relative z-10 group-hover:text-white transition">
                Sign in
              </span>
            </button>
          </Link>
        )}

        {/* If logged in */}
        {loggedIn && (
          <div onClick={profileOpener} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-black text-white cursor-pointer flex items-center justify-center font-bold">
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
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link to="/analyze" onClick={() => setOpen(false)}>
            Analyze
          </Link>
          <Link to="/foodproduct" onClick={() => setOpen(false)}>
            Food Log
          </Link>
          <Link to="/about" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link to="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>

          {!loggedIn ? (
            <Link to="/login" onClick={() => setOpen(false)}>
              <button className="font-bold px-5 py-2 border rounded-full">
                Sign in
              </button>
            </Link>
          ) : (
            <Link to={"/profile"} onClick={() => setOpen(false)}>
              <button className="font-bold px-5 py-2 border rounded-full">
                Profile
              </button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
