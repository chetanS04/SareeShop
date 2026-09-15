"use client";

import { useState, useEffect, useRef } from "react";
import { X, Eye, EyeOff, ShieldCheck, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { useAuth, AuthModalMode } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { login, registerUser, forgotPassword, resetPassword } from "../../../utils/auth";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "../../../utils/axios";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import * as Yup from "yup";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const indianPhoneRegex = /^[6-9]\d{9}$/;

const emailValidation = Yup.string()
  .trim()
  .required("Email Address is required")
  .matches(emailRegex, "Please enter a valid email address");

const phoneValidation = Yup.string().test(
  "valid-indian-phone",
  "Please enter a valid 10-digit mobile number",
  (val) => !val || indianPhoneRegex.test(val)
);

// Yup Validation Schemas
const loginSchema = Yup.object().shape({
  email: emailValidation,
  password: Yup.string().required("Password is required"),
});

const registerSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Full Name is required")
    .matches(/^[a-zA-Z\s]+$/, "Full Name can only contain letters and spaces"),
  email: emailValidation,
  phone: phoneValidation,
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const forgotPasswordSchema = Yup.object().shape({
  email: emailValidation,
});

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  passwordConfirmation: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    authModalEmail,
    closeAuthModal,
    setAuthModalMode,
    setUserDirectly,
    user,
  } = useAuth();

  const { showLoader, hideLoader } = useLoader();

  const [mode, setMode] = useState<AuthModalMode>(authModalMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  /** Register fields kept separate from login so tab switch doesn't clash */
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regFieldErrors, setRegFieldErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const currentMode = authModalMode || mode;

  // Reset form when modal opens or closes or mode changes
  const resetFormFields = () => {
    setEmail("");
    setPassword("");
    setPasswordConfirmation("");
    setName("");
    setPhone("");
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegPassword("");
    setShowRegPassword(false);
    setRegFieldErrors({});
    setOtp(["", "", "", "", "", ""]);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
  };

  useEffect(() => {
    if (isAuthModalOpen) {
      setFieldErrors({});
      if (authModalEmail) {
        setEmail(authModalEmail);
      } else {
        const savedEmail = localStorage.getItem("verifyEmail") || localStorage.getItem("resetPasswordEmail") || "";
        if (savedEmail && (currentMode === "email-verify" || currentMode === "reset-password")) {
          setEmail(savedEmail);
        }
      }
    } else {
      resetFormFields();
    }
  }, [isAuthModalOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  if (!isAuthModalOpen) return null;

  const handleModeSwitch = (newMode: AuthModalMode) => {
    setAuthModalMode(newMode);
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
  };

  const handleLoginSuccess = (loggedUser: any, token: string) => {
    localStorage.setItem("user", JSON.stringify(loggedUser));
    localStorage.setItem("token", token);
    setUserDirectly(loggedUser);
    resetFormFields();
    closeAuthModal();
  };

  // Real-time Single Field Validation Helper
  const validateSingleField = async (fieldName: string, value: any, currentValues: any) => {
    try {
      let schemaToUse: any;
      if (currentMode === "login") schemaToUse = loginSchema;
      else if (currentMode === "register") schemaToUse = registerSchema;
      else if (currentMode === "forgot-password") schemaToUse = forgotPasswordSchema;
      else if (currentMode === "reset-password") schemaToUse = resetPasswordSchema;

      if (schemaToUse) {
        await schemaToUse.validateAt(fieldName, { ...currentValues, [fieldName]: value });
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    } catch (err: any) {
      if (err instanceof Yup.ValidationError) {
        setFieldErrors((prev) => ({ ...prev, [fieldName]: err.message }));
      }
    }
  };

  // Input Field Change Handlers with Auto-hiding validation
  const handleNameChange = (val: string) => {
    // Restrict input to letters and spaces ONLY
    const cleanName = val.replace(/[^a-zA-Z\s]/g, "");
    setName(cleanName);
    validateSingleField("name", cleanName, { name: cleanName, email, phone, password });
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    validateSingleField("email", val, { name, email: val, phone, password });
  };

  const handlePhoneChange = (val: string) => {
    // Restrict input to digits ONLY and 10 digits MAX
    const cleanPhone = val.replace(/\D/g, "").slice(0, 10);
    setPhone(cleanPhone);
    validateSingleField("phone", cleanPhone, { name, email, phone: cleanPhone, password });
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    validateSingleField("password", val, { name, email, phone, password: val, passwordConfirmation });
  };

  const handleConfirmPasswordChange = (val: string) => {
    setPasswordConfirmation(val);
    validateSingleField("passwordConfirmation", val, { password, passwordConfirmation: val });
  };

  // Full Form Validation on Submit
  const validateForm = async (): Promise<boolean> => {
    setFieldErrors({});
    try {
      if (currentMode === "login") {
        await loginSchema.validate({ email, password }, { abortEarly: false });
      } else if (currentMode === "register") {
        await registerSchema.validate({ name, email, phone, password }, { abortEarly: false });
      } else if (currentMode === "forgot-password") {
        await forgotPasswordSchema.validate({ email }, { abortEarly: false });
      } else if (currentMode === "reset-password") {
        await resetPasswordSchema.validate({ password, passwordConfirmation }, { abortEarly: false });
      }
      return true;
    } catch (err: any) {
      if (err instanceof Yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path && !errors[error.path]) {
            errors[error.path] = error.message;
          }
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  // Handle OTP Inputs
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    otpInputRefs.current[focusIndex]?.focus();
  };

  // Submit Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate using Yup schemas
    const isValid = await validateForm();
    if (!isValid && currentMode !== "email-verify") return;

    // 1. Sign In
    if (currentMode === "login") {
      setIsSubmitting(true);
      showLoader();
      try {
        const res = await login(email, password);
        handleLoginSuccess(res.user, res.token);
      } catch (err: any) {
        if (err.response?.data?.email_not_verified) {
          const unverifiedEmail = err.response.data.email || email;
          localStorage.setItem("verifyEmail", unverifiedEmail);
          setEmail(unverifiedEmail);
          try {
            await axios.post("/api/resend-otp", { email: unverifiedEmail });
          } catch {
            // Ignore if backend already dispatched OTP email
          }
          setSuccess("Your email is not verified. We have sent a verification code to your email, please check and verify your email.");
          setAuthModalMode("email-verify");
          setMode("email-verify");
          setOtp(["", "", "", "", "", ""]);
          setResendCountdown(60);
          return;
        }
        const msg = err.response?.data?.message || err.message || "An error occurred. Please try again.";
        setError(msg);
      } finally {
        hideLoader();
        setIsSubmitting(false);
      }
    }

    // 2. Register Account (Opens Email Verification Modal)
    else if (currentMode === "register") {
      setIsSubmitting(true);
      showLoader();
      try {
        await registerUser({
          name,
          email,
          password,
          password_confirmation: password,
          phone_number: phone,
        });

        localStorage.setItem("verifyEmail", email);
        setSuccess("Registration successful! Please enter the 6-digit OTP sent to your email.");
        setAuthModalMode("email-verify");
        setMode("email-verify");
        setOtp(["", "", "", "", "", ""]);
        setResendCountdown(60);
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "Registration failed. Please try again.";
        setError(msg);
      } finally {
        hideLoader();
        setIsSubmitting(false);
      }
    }

    // 3. Email Verification OTP Submit
    else if (currentMode === "email-verify") {
      const targetEmail = email || localStorage.getItem("verifyEmail");
      if (!targetEmail) {
        setError("No email address found for verification.");
        return;
      }
      const otpCode = otp.join("");
      if (otpCode.length !== 6) {
        setError("Please enter all 6 digits of the OTP.");
        return;
      }
      setIsSubmitting(true);
      showLoader();
      try {
        const response = await axios.post("/api/verify-otp", {
          email: targetEmail,
          otp: otpCode,
        });
        localStorage.removeItem("verifyEmail");
        if (response.data.token && response.data.user) {
          handleLoginSuccess(response.data.user, response.data.token);
        } else {
          setSuccess("Email verified successfully! Please sign in.");
          handleModeSwitch("login");
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || "Verification failed. Please try again.";
        setError(msg);
        if (err.response?.data?.expired) setOtp(["", "", "", "", "", ""]);
      } finally {
        hideLoader();
        setIsSubmitting(false);
      }
    }

    // 4. Forgot Password Submit
    else if (currentMode === "forgot-password") {
      setIsSubmitting(true);
      showLoader();
      try {
        const res = await forgotPassword(email);
        localStorage.setItem("resetPasswordEmail", email);
        setSuccess(res.message || "Reset code sent successfully! Please check your email.");
        setAuthModalMode("reset-password");
        setMode("reset-password");
        setOtp(["", "", "", "", "", ""]);
      } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to send reset code. Please try again.";
        setError(msg);
      } finally {
        hideLoader();
        setIsSubmitting(false);
      }
    }

    // 5. Reset Password Submit
    else if (currentMode === "reset-password") {
      const targetEmail = email || localStorage.getItem("resetPasswordEmail");
      if (!targetEmail) {
        setError("Email not found. Please request a password reset first.");
        return;
      }
      const codeString = otp.join("");
      if (codeString.length !== 6) {
        setError("Please enter all 6 digits of the reset code.");
        return;
      }

      setIsSubmitting(true);
      showLoader();
      try {
        await resetPassword({
          email: targetEmail,
          code: codeString,
          password,
          password_confirmation: passwordConfirmation,
        });
        localStorage.removeItem("resetPasswordEmail");
        if (user) {
          closeAuthModal();
        } else {
          setSuccess("Password reset successfully! Please sign in with your new password.");
          handleModeSwitch("login");
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to reset password. Please try again.";
        setError(msg);
      } finally {
        hideLoader();
        setIsSubmitting(false);
      }
    }
  };

  // Resend OTP for email verification
  const handleResendOTP = async () => {
    const targetEmail = email || localStorage.getItem("verifyEmail");
    if (!targetEmail) {
      setError("Email address not found.");
      return;
    }
    setIsResending(true);
    setError(null);
    try {
      const res = await axios.post("/api/resend-otp", { email: targetEmail });
      setSuccess(res.data?.message || "Verification code resent successfully!");
      setResendCountdown(60);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend code.";
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  // Google OAuth Login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    showLoader();
    try {
      const response = await axios.post("/api/auth/google", {
        token: credentialResponse.credential,
      });
      if (response.data.token && response.data.user) {
        handleLoginSuccess(response.data.user, response.data.token);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Google login failed.";
      setError(msg);
    } finally {
      hideLoader();
    }
  };

  const fieldInput = (hasError?: boolean) =>
    `w-full bg-surface px-3 py-2.5 text-[14px] text-on-surface placeholder:text-body-slate/45 focus:outline-none border transition-colors ${
      hasError ? "border-primary" : "border-border-line focus:border-on-surface"
    }`;

  const isRegisterTab = currentMode === "register";

  // Secondary flows: forgot / reset / verify — compact single panel
  if (
    currentMode === "forgot-password" ||
    currentMode === "reset-password" ||
    currentMode === "email-verify"
  ) {
    return (
      <div className="sv-theme fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-surface-dark/70 animate-in fade-in duration-200 overflow-y-auto">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
        {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

        <div className="relative w-full max-w-md bg-surface border border-on-surface my-auto p-6 sm:p-8">
          <button
            type="button"
            onClick={() => {
              resetFormFields();
              closeAuthModal();
            }}
            className="absolute top-3.5 right-3.5 z-30 w-8 h-8 bg-surface-ivory text-on-surface border border-border-line flex items-center justify-center hover:bg-surface-dark hover:text-surface"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {currentMode === "forgot-password" && (
            <div className="mb-6 pr-8">
              <button
                type="button"
                onClick={() => (user ? closeAuthModal() : handleModeSwitch("login"))}
                className="label-caps text-[10px] text-body-slate hover:text-on-surface inline-flex items-center gap-1 mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {user ? "Back to Profile" : "Back to Sign In"}
              </button>
              <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface mb-1">Forgot Password?</h3>
              <p className="text-[13px] text-body-slate">We&apos;ll send a 6-digit reset code to your email.</p>
            </div>
          )}

          {currentMode === "reset-password" && (
            <div className="mb-6 pr-8">
              <button
                type="button"
                onClick={() => (user ? closeAuthModal() : handleModeSwitch("login"))}
                className="label-caps text-[10px] text-body-slate hover:text-on-surface inline-flex items-center gap-1 mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface mb-1">Reset Password</h3>
              <p className="text-[13px] text-body-slate">
                Enter the code sent to <span className="font-semibold text-on-surface">{email}</span>
              </p>
            </div>
          )}

          {currentMode === "email-verify" && (
            <div className="mb-6 text-center pr-4">
              <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/30 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface mb-1">Verify Your Email</h3>
              <p className="text-[13px] text-body-slate">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-on-surface">{email}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {currentMode === "forgot-password" && (
              <div>
                <label className="label-caps text-[10px] text-on-surface font-semibold block mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter your registered email"
                  className={fieldInput(!!fieldErrors.email)}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-primary font-semibold mt-1">{fieldErrors.email}</p>
                )}
              </div>
            )}

            {(currentMode === "email-verify" || currentMode === "reset-password") && (
              <div>
                <label className="label-caps text-[10px] text-on-surface font-semibold block mb-2 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2 mb-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-12 text-center text-lg font-bold bg-surface border border-border-line focus:border-on-surface focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            )}

            {currentMode === "reset-password" && (
              <>
                <div>
                  <label className="label-caps text-[10px] text-on-surface font-semibold block mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={`${fieldInput(!!fieldErrors.password)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-body-slate p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-primary font-semibold mt-1">{fieldErrors.password}</p>
                  )}
                </div>
                <div>
                  <label className="label-caps text-[10px] text-on-surface font-semibold block mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordConfirmation}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      placeholder="Re-enter new password"
                      className={`${fieldInput(!!fieldErrors.passwordConfirmation)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-body-slate p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.passwordConfirmation && (
                    <p className="text-[11px] text-primary font-semibold mt-1">
                      {fieldErrors.passwordConfirmation}
                    </p>
                  )}
                </div>
              </>
            )}

            {currentMode === "email-verify" && (
              <div className="text-center">
                <button
                  type="button"
                  disabled={resendCountdown > 0 || isResending}
                  onClick={handleResendOTP}
                  className="text-xs font-semibold text-body-slate hover:text-on-surface disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                  {resendCountdown > 0 ? `Resend Code in ${resendCountdown}s` : "Resend Code"}
                </button>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="sv-btn-primary w-full disabled:opacity-50">
              {isSubmitting
                ? "Processing..."
                : currentMode === "forgot-password"
                  ? "Send Reset Code"
                  : currentMode === "reset-password"
                    ? "Reset Password"
                    : "Verify & Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Login + Register — professional single panel with tabs
  return (
    <div className="sv-theme fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-surface-dark/65 animate-in fade-in duration-200 overflow-y-auto">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      <div className="relative w-full max-w-[420px] bg-surface my-auto border border-on-surface">
        <button
          type="button"
          onClick={() => {
            resetFormFields();
            closeAuthModal();
          }}
          className="absolute top-3 right-3 z-30 w-8 h-8 text-body-slate hover:text-on-surface flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 sm:px-8 pt-7 pb-5">
          <p className="label-caps text-[10px] text-primary tracking-[0.18em] mb-2">SVastra</p>
          <h1 className="text-[22px] font-bold uppercase tracking-tight text-on-surface leading-none">
            {isRegisterTab ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-[13px] text-body-slate mt-2 leading-relaxed">
            {isRegisterTab
              ? "Join to track orders, save addresses, and unlock atelier privileges."
              : "Sign in to access your archive, saved addresses, and express checkout."}
          </p>
        </div>

        <div className="px-6 sm:px-8">
          <div className="grid grid-cols-2 border border-border-line" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!isRegisterTab}
              onClick={() => handleModeSwitch("login")}
              className={`py-2.5 label-caps text-[10px] tracking-widest transition-colors ${
                !isRegisterTab
                  ? "bg-on-surface text-surface"
                  : "bg-surface text-body-slate hover:text-on-surface"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegisterTab}
              onClick={() => handleModeSwitch("register")}
              className={`py-2.5 label-caps text-[10px] tracking-widest border-l border-border-line transition-colors ${
                isRegisterTab
                  ? "bg-on-surface text-surface"
                  : "bg-surface text-body-slate hover:text-on-surface"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-5">
          {isRegisterTab ? (
            <form
              className="flex flex-col gap-3.5"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void (async () => {
                  setError(null);
                  setSuccess(null);
                  try {
                    await registerSchema.validate(
                      { name: regName, email: regEmail, phone: regPhone, password: regPassword },
                      { abortEarly: false }
                    );
                    setRegFieldErrors({});
                  } catch (err: any) {
                    if (err instanceof Yup.ValidationError) {
                      const next: Record<string, string> = {};
                      err.inner.forEach((ve) => {
                        if (ve.path && !next[ve.path]) next[ve.path] = ve.message;
                      });
                      setRegFieldErrors(next);
                    }
                    return;
                  }
                  setIsSubmitting(true);
                  showLoader();
                  try {
                    await registerUser({
                      name: regName,
                      email: regEmail,
                      password: regPassword,
                      password_confirmation: regPassword,
                      phone_number: regPhone,
                    });
                    localStorage.setItem("verifyEmail", regEmail);
                    setEmail(regEmail);
                    setSuccess("Registration successful! Please enter the OTP sent to your email.");
                    setAuthModalMode("email-verify");
                    setMode("email-verify");
                    setOtp(["", "", "", "", "", ""]);
                    setResendCountdown(60);
                  } catch (err: any) {
                    setError(
                      err.response?.data?.message ||
                        err.message ||
                        "Registration failed. Please try again."
                    );
                  } finally {
                    hideLoader();
                    setIsSubmitting(false);
                  }
                })();
              }}
            >
              <div>
                <label className="label-caps text-[9px] text-body-slate block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => {
                    const cleanName = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                    setRegName(cleanName);
                    setRegFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }}
                  placeholder="Your full name"
                  className={fieldInput(!!regFieldErrors.name)}
                  autoComplete="name"
                />
                {regFieldErrors.name && (
                  <p className="text-[11px] text-primary mt-1">{regFieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="label-caps text-[9px] text-body-slate block mb-1.5">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    setRegFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }}
                  placeholder="name@domain.com"
                  className={fieldInput(!!regFieldErrors.email)}
                  autoComplete="email"
                />
                {regFieldErrors.email && (
                  <p className="text-[11px] text-primary mt-1">{regFieldErrors.email}</p>
                )}
              </div>
              <div>
                <label className="label-caps text-[9px] text-body-slate block mb-1.5">
                  Mobile <span className="normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={regPhone}
                  onChange={(e) => {
                    setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setRegFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.phone;
                      return next;
                    });
                  }}
                  placeholder="10-digit mobile"
                  className={fieldInput(!!regFieldErrors.phone)}
                  autoComplete="tel"
                />
                {regFieldErrors.phone && (
                  <p className="text-[11px] text-primary mt-1">{regFieldErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="label-caps text-[9px] text-body-slate block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setRegFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.password;
                        return next;
                      });
                    }}
                    placeholder="Min. 8 characters"
                    className={`${fieldInput(!!regFieldErrors.password)} pr-10`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-body-slate hover:text-on-surface"
                    aria-label={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {regFieldErrors.password && (
                  <p className="text-[11px] text-primary mt-1">{regFieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 py-3 bg-primary text-on-primary label-caps text-[11px] tracking-widest uppercase hover:bg-on-surface transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Creating…" : "Create Account"}
              </button>
            </form>
          ) : (
            <form
              className="flex flex-col gap-3.5"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void (async () => {
                  setError(null);
                  setSuccess(null);
                  try {
                    await loginSchema.validate({ email, password }, { abortEarly: false });
                    setFieldErrors({});
                  } catch (err: any) {
                    if (err instanceof Yup.ValidationError) {
                      const next: Record<string, string> = {};
                      err.inner.forEach((ve) => {
                        if (ve.path && !next[ve.path]) next[ve.path] = ve.message;
                      });
                      setFieldErrors(next);
                    }
                    return;
                  }
                  setIsSubmitting(true);
                  showLoader();
                  try {
                    const res = await login(email, password);
                    handleLoginSuccess(res.user, res.token);
                  } catch (err: any) {
                    if (err.response?.data?.email_not_verified) {
                      const unverifiedEmail = err.response.data.email || email;
                      localStorage.setItem("verifyEmail", unverifiedEmail);
                      setEmail(unverifiedEmail);
                      try {
                        await axios.post("/api/resend-otp", { email: unverifiedEmail });
                      } catch {
                        /* ignore */
                      }
                      setSuccess(
                        "Your email is not verified. We have sent a verification code — please verify."
                      );
                      setAuthModalMode("email-verify");
                      setMode("email-verify");
                      setOtp(["", "", "", "", "", ""]);
                      setResendCountdown(60);
                      return;
                    }
                    setError(
                      err.response?.data?.message ||
                        err.message ||
                        "An error occurred. Please try again."
                    );
                  } finally {
                    hideLoader();
                    setIsSubmitting(false);
                  }
                })();
              }}
            >
              <div>
                <label className="label-caps text-[9px] text-body-slate block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="client@svastra.com"
                  className={fieldInput(!!fieldErrors.email)}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-primary mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="label-caps text-[9px] text-body-slate">Password</label>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("forgot-password")}
                    className="text-[11px] text-body-slate hover:text-primary underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${fieldInput(!!fieldErrors.password)} pr-10`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-body-slate hover:text-on-surface"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-primary mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 py-3 bg-primary text-on-primary label-caps text-[11px] tracking-widest uppercase hover:bg-on-surface transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 my-4">
            <span className="h-px flex-1 bg-border-line" />
            <span className="label-caps text-[9px] text-body-slate tracking-widest">Or continue with</span>
            <span className="h-px flex-1 bg-border-line" />
          </div>

          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
            <div className="w-full flex justify-center border border-border-line py-2 hover:bg-surface-ivory transition-colors">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in was unsuccessful.")}
                shape="rectangular"
                text="continue_with"
                width="320"
                size="medium"
              />
            </div>
          </GoogleOAuthProvider>
        </div>

        <div className="px-6 sm:px-8 py-3 border-t border-border-line bg-surface-ivory/60 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="label-caps text-[8px] text-body-slate tracking-widest">
            Encrypted · SSL 256-Bit · Atelier Support
          </span>
        </div>
      </div>
    </div>
  );
}
