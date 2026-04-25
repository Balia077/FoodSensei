import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api.js";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // optional (for auto-login)

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      // OPTION 1: Auto login after register
      login(response.data);

      // OPTION 2 (if backend doesn't return user/token):
      // navigate("/login");

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[91vh] w-full bg-[#EFF5F3] flex px-4 py-5 lg:px-50">
      <div className="w-full flex flex-col lg:flex-row justify-between rounded-2xl shadow-xl overflow-hidden bg-white lg:h-[81vh]">

        {/* Image */}
        <div className="hidden lg:block w-1/2 h-full p-3">
          <img
            className="w-full h-full object-cover rounded-2xl"
            src="../images/fifth.jpg"
            alt=""
          />
        </div>

        {/* Form */}
        <div className="w-full lg:w-1/2 h-full p-6 sm:p-10 lg:p-20">
          <h2 className="flex justify-center text-2xl sm:text-3xl font-bold mb-5">
            Create an account
          </h2>

          <form onSubmit={formHandler} className="flex flex-col gap-3">

            <h3 className="font-semibold">Username</h3>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Username..."
              className="px-5 py-3 border rounded-xl outline-none"
              type="text"
              required
            />

            <h3 className="font-semibold">Email</h3>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email..."
              className="px-5 py-3 border rounded-xl outline-none"
              type="email"
              required
            />

            <h3 className="font-semibold">Password</h3>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password..."
              className="px-5 py-3 border rounded-xl outline-none"
              type="password"
              required
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              disabled={loading}
              className="px-5 py-3 mt-5 bg-black text-white font-bold rounded-xl hover:opacity-90 transition"
            >
              {loading ? "Creating account..." : "Get Started"}
            </button>
          </form>

          <h4 className="text-sm mt-5 flex justify-center">
            Already have an account?{" "}
            <Link className="text-blue-600 font-semibold ml-1" to="/login">
              Sign in
            </Link>
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Register;