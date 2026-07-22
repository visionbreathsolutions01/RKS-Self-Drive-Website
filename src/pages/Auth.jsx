// src/pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resetPassword } from "../services/db";
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, KeyRound, UserCheck, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode can be 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const getFriendlyError = (msg = "") => {
    if (msg.includes("permission") || msg.includes("insufficient")) 
      return "Login successful — please wait while your account loads.";
    if (msg.includes("email-already-in-use") || msg.includes("already registered"))
      return "This email is already registered. Please log in instead.";
    if (msg.includes("wrong-password") || msg.includes("invalid-credential") || msg.includes("INVALID_LOGIN_CREDENTIALS"))
      return "Incorrect email or password. Please try again.";
    if (msg.includes("user-not-found"))
      return "No account found with this email. Please register first.";
    if (msg.includes("weak-password"))
      return "Password is too weak. Use at least 6 characters.";
    if (msg.includes("invalid-email"))
      return "Please enter a valid email address.";
    if (msg.includes("network-request-failed"))
      return "Network error. Please check your connection and try again.";
    return msg || "Something went wrong. Please try again.";
  };

  // Read redirect destination
  const from = location.state?.from || "/";

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(getFriendlyError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, name, phone);
      navigate("/dashboard");
    } catch (err) {
      setError(getFriendlyError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await resetPassword(email);
      setInfo("A password reset link has been dispatched to your email address!");
      setEmail("");
    } catch (err) {
      setError(err.message || "Email address not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === "admin") {
      setEmail("sai@rks.com");
      setPassword("adminpassword");
    } else {
      setEmail("test@user.com");
      setPassword("userpassword");
    }
    setMode("login");
  };

  return (
    <div className="bg-bg-light min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Graphic Accents */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        
        {/* Logo Branding */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-wider text-primary">
            RKS<span className="text-accent font-black"> SELF DRIVES</span>
          </h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">
            Sign in to start driving your journey
          </p>
        </div>

        {/* Message Banner */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start space-x-2.5 text-xs font-semibold leading-normal"
          >
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {info && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-start space-x-2.5 text-xs font-semibold leading-normal"
          >
            <UserCheck className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-green-600" />
            <span>{info}</span>
          </motion.div>
        )}

        {/* Dynamic Card Area */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200/50 shadow-xl overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-extrabold text-primary mb-6">Welcome Back</h3>
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E.g. sandeep@gmail.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-primary font-medium"
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setMode("forgot")}
                        className="text-[10px] font-bold text-accent hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-accent text-primary font-medium"
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-accent hover:bg-amber-500 text-primary font-bold rounded-xl text-sm uppercase tracking-wider transition-transform hover:scale-[1.01] active:scale-95 shadow-md shadow-accent/10 cursor-pointer"
                  >
                    {loading ? "Authenticating..." : "Sign In"}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs">
                  <span className="text-gray-500">Don't have an account? </span>
                  <button 
                    onClick={() => setMode("register")}
                    className="font-bold text-accent hover:underline cursor-pointer"
                  >
                    Register Now
                  </button>
                </div>
              </motion.div>
            )}

            {mode === "register" && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-extrabold text-primary mb-6">Create Account</h3>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="E.g. Sandeep Reddy"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-primary font-medium"
                      />
                      <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Contact Number</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="E.g. +91 9988776655"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-primary font-medium"
                      />
                      <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E.g. sandeep@gmail.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-primary font-medium"
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Password</label>
                    <div className="relative">
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password (6+ chars)"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-primary font-medium"
                      />
                      <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-accent hover:bg-amber-500 text-primary font-bold rounded-xl text-sm uppercase tracking-wider transition-transform hover:scale-[1.01] active:scale-95 shadow-md cursor-pointer"
                  >
                    {loading ? "Registering..." : "Submit Registration"}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs">
                  <span className="text-gray-500">Already registered? </span>
                  <button 
                    onClick={() => setMode("login")}
                    className="font-bold text-accent hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              </motion.div>
            )}

            {mode === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-extrabold text-primary mb-3">Recover Password</h3>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                  Enter your email. If registered, we will send password recovery instructions.
                </p>
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E.g. sandeep@gmail.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-primary font-medium"
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-accent hover:bg-amber-500 text-primary font-bold rounded-xl text-sm uppercase tracking-wider transition-transform hover:scale-[1.01] active:scale-95 shadow-md cursor-pointer"
                  >
                    {loading ? "Sending link..." : "Send Reset Email"}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs">
                  <button 
                    onClick={() => setMode("login")}
                    className="font-bold text-accent hover:underline cursor-pointer"
                  >
                    Back to Log In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>


      </div>
    </div>
  );
}
