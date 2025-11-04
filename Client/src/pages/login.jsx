import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";


const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { backendUrl, isLoggedin, setIsLoggedin, getUserData } =
    useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (state === "Sign Up") {
        // Enable credentials for axios globally (optional if used later)
        axios.defaults.withCredentials = true;

        const response = await fetch(`${backendUrl}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
          credentials: "include", // include cookies if your backend sets them
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
          console.log("Signup successful!");
          setIsLoggedin(true);
          navigate("/login");
          toast.success("Signup successful!");
        } else {
          console.error("Signup failed:", data.message);
          toast.error(data.message || "Signup failed!");
        }
      }
      // Optional: Handle Login
      else if (state === "Login") {
        const response = await fetch(`${backendUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
          toast.success("Login successful!");
        } else {
          toast.error(data.message || "Login failed!");
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const loginWithGoogle = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={handleSubmit}>
          {/* ✅ Show Full Name only in Sign Up */}
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="text" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent outline-none w-full"
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="text" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none w-full"
              type="email"
              placeholder="Email Address"
              required
            />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="text" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none w-full"
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <div className="text-center pb-4 text-white ">OR</div>

          <div className="text-center pb-4 text-white">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-2.5 rounded-full bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
            >
              {state === "Sign Up"
                ? "Create Account using Google"
                : "Login Using Google"}
            </button>
          </div>

          {/* ✅ Forgot password visible only on Login */}
          {state === "Login" && (
            <p
              className="mb-4 text-indigo-500 cursor-pointer"
              onClick={() => navigate("/reset-password")}
            >
              Forgot password?
            </p>
          )}

          <button className="w-full py-2.5 rounded-full bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition">
            {state === "Sign Up" ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-indigo-300">
          {state === "Sign Up"
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <span
            className="text-white font-semibold cursor-pointer"
            onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")}
          >
            {state === "Sign Up" ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
