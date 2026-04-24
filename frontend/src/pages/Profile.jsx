import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Profile = () => {
  const [user, setUser] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUser();
  }, []);

  // Get first 2 letters of username
  const getInitials = (name) => {
    if (!name) return "";
    return name.slice(0, 2).toUpperCase();
  };

  if (!user) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <p className="text-lg animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-gray-100 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8"
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl font-bold">
            {getInitials(user.user.username)}
          </div>

          <p className="mt-4 text-lg font-semibold text-gray-800">
            {user.user.username}
          </p>

          <p className="text-sm text-gray-500">
            {user.user.email}
          </p>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 w-full"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
            Welcome back 👋
          </h1>

          <div className="border rounded-xl p-5">
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Username:</span>{" "}
              {user.user.username}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Email:</span>{" "}
              {user.user.email}
            </p>
          </div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="mt-6 w-full sm:w-auto px-6 py-3 bg-black text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            Logout
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;