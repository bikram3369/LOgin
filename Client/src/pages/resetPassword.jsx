import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


const resetPassword = () => {
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials = true;

  const [email, setEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [isEmailSent, setIsEmailSent] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = React.useState(false);
  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (/\d/.test(value)) {
      inputRefs.current[index].value = value;
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      inputRefs.current[index].value = "";
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    for (let i = 0; i < pasteData.length; i++) {
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = pasteData[i];
      }
    }
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data.success) {
        setIsEmailSent(true);
        console.log("OTP sent successfully");
        toast.success("OTP sent successfully to your email");
      }
    } catch (err) {
      toast.error("Error sending OTP");
      console.error(err);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
     
      const otp = inputRefs.current.map((input) => input.value).join("");
      console.log("Submitted OTP:", otp);
      setOtp(otp); // ✅ store OTP in state for next step
        console.log("OTP verified successfully");
        setIsOtpSubmitted(true);
        toast.success("OTP verified successfully");
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`,
        { email, otp, newPassword },
        { withCredentials: true }
      );
      if (data.success) {
        console.log("Password reset successfully");
        navigate("/login");
        toast.success("Password reset successfully. Please login with your new password.");
      }
    } catch (err) {
      toast.error("Error resetting password");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* Email Form */}
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>

          <p className="text-center mb-6 text-indigo-300">
            Enter your registered email to reset your password.
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" className="w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent outline-none w-full text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="bg-blue-500 text-white rounded-full px-4 py-2">
            Send OTP
          </button>
        </form>
      )}

      {/* OTP Form */}
      {isEmailSent && !isOtpSubmitted && (
        <form
          onSubmit={onSubmitOtp}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password OTP
          </h1>

          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code sent to your email id.
          </p>

          <div className="flex justify-between mb-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength="1"
                  key={index}
                  required
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                />
              ))}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-md transition duration-200"
          >
            Submit
          </button>
        </form>
      )}

      {/* New Password Form */}
      {isOtpSubmitted && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>

          <p className="text-center mb-6 text-indigo-300">
            Enter your new password.
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-5 h-5" />
            <input
              type="password"
              placeholder="Enter your Password"
              className="bg-transparent outline-none w-full text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button  className="bg-blue-500 text-white rounded-full px-4 py-2">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default resetPassword;
