import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext"; // ✅ Import context
import axios from "axios";
import { toast } from "react-toastify";


const Navbar = () => {
  const navigate = useNavigate();
  const { userData , setIsLoggedin , setUserData } = useContext(AppContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);
      const data = response.data;
      if (data.success) {
        console.log("Verification OTP sent:", data);
        navigate("/email-verify");
        toast.success("Verification OTP sent to your email!");
      } else {
        toast.error(data.message || "Failed to send verification OTP.");
      }
    } catch (error) {
      console.error("Error sending verification OTP:", error);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setIsLoggedin(false);
      setUserData(null);
      navigate("/login");
    }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 left-0 z-10">
      <img src={assets.logo} alt="Logo" className="w-28 sm:w-32" />

      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {userData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {/* ✅ Safely check userData before accessing isAccountVerified */}
              {!userData?.isAccountVerified && (
                <li className="py-1 px-2 hover:bg-gray-200 cursor-pointer" onClick={sendVerificationOtp}>
                  Verify email
                </li>
              )}

              <li onClick={logout} className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10">
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
        >
          Login <img src={assets.arrow_icon} alt="Logout" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
