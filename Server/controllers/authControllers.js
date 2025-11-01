import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';


// user registration function
export const register = async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Our Platform',
            text: `Hello ${name},\n\nThank you for registering on our platform!with email: ${email}\n\nBest regards,\nThe Team`

        }

        await transporter.sendMail(mailOptions);

        return res.json({ success: true });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// User Login Function
export const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.json({ success: false, message: 'Please provide all required fields' });
    }

    try {

        const user = await userModel.findOne({email});
        if(!user) {
            return res.json({ success: false, message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Login Successful',
            text: `Hello ${user.name},\n\nYou have successfully logged in to your account.\n\nBest regards,\nThe Team`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// User Logout Function
export const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: 'Logged out successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// user verification function
export const sendVerifyOtp = async (req, res) =>{
    try {

        const {userId} = req.body;
        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: 'Account already verified'});
        }

      const otp =  String(Math.floor(100000 + Math.random() * 90000))

      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 24*60*60*1000;
      
      await user.save();

      const mailOption = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Account Verification OTP',
        text: `Hello ${user.name},\n\nYour OTP for account verification is ${otp}. It is valid for 24 hours`
      }

      await transporter.sendMail(mailOption);

      res.json({ success: true, message: 'OTP sent to your email' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// verify email
export const verifyEmail = async (req, res) =>{
    const {userId, otp} = req.body;

    if( !userId || !otp) {
        return res.json({success: false, message: 'Missing Details'});
    }
    try {

        const user = await userModel.findById(userId);
        if(!user) {
            return res.json({success: false, message: 'User not found'});
        }

        if (user.verifyOtp == '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP Expired'});
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: 'Account verified successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    } 
}

// Check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

//send reset password otp
export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 90000));
        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Reset Password OTP",
            text: `Hello ${user.name},\n\nYour OTP for resetting your password is ${otp}. It is valid for 15 minutes.\n\nBest regards,\nThe Team`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// export const verifyResetOtp = async (req, res) => {
//     const { email, otp } = req.body;
//     if (!email || !otp) {
//         return res.json({ success: false, message: 'Please provide all required fields' });
//     }
//     try {
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             return res.json({ success: false, message: 'User not found' });
//         }
//         if (user.resetOtp === '' || user.resetOtp !== otp) {
//             return res.json({ success: false, message: 'Invalid OTP' });
//         }
//         if (user.resetOtpExpires < Date.now()) {
//             return res.json({ success: false, message: 'OTP Expired' });
//         }   
//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// }   

// Reset Password Function
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Please provide all required fields' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }
        if (user.resetOtpExpires < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpires = 0;

        await user.save();

        return res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
        