import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'
import { useEffect } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'


const emailverify = () => {

  const navigate = useNavigate();
  const inputRefs = React.useRef([]);
  const { isLoggedin , userData } = useContext(AppContext);

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (/\d/.test(value)) {
      inputRefs.current[index].value = value;
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      inputRefs.current[index].value = '';
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    for (let i = 0; i < pasteData.length; i++) {
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = pasteData[i];
      }
    }
  };

  const handleSubmit = async (e) => {
    try{
      e.preventDefault();
      const otp = inputRefs.current.map(input => input.value).join('');
      console.log("Submitted OTP:", otp);
      // Here you can add the logic to verify the OTP with the backend
      // For example, you can make an API call to your backend server to verify the OTP
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const {data} = await axios.post(`${backendUrl}/api/auth/verify-account`, { otp }, { withCredentials: true });
      if(data.success){
        console.log("OTP verified successfully");
        navigate("/");
      }else{
        console.error("OTP verification failed:", data.message);
      }

    }catch(err){
      console.error("Error verifying OTP:", err);
    }
  }

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate('/');
  }, [isLoggedin, userData, navigate]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt=""
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      <form onSubmit={handleSubmit} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>
          Email Verify OTP
        </h1>

        <p className='text-center mb-6 text-indigo-300'>
          Enter the 6-digit code sent to your email id.
        </p>

        <div className='flex justify-between mb-8'>
          {Array(6).fill(0).map((_, index) => (
            <input
              type="text"
              maxLength='1'
              key={index}
              required
              className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
              ref={e => inputRefs.current[index] = e}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <button
          type="submit"
          className='w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-md transition duration-200'
        >
          Verify
        </button>
      </form>
    </div>
  )
}

export default emailverify;
