"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAdminStore } from "../store/adminStore";
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, Shield, Book } from "lucide-react";

type LoginForm = {
  username: string;
  password: string;
};

const SignInPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = api.auth.login.useMutation({
    onSuccess: (data) => {
      useAdminStore.getState().setUsername(data.username);
      toast({
        title: "Success!",
        description: "Successfully logged in",
        variant: "success",
      });
      router.push("/admin/dashboard");
    },
    onError: (data) => {
      toast({
        title: data.message,
        description: "Invalid credentials",
        variant: "destructive",
      });
    },
  });
  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-green-100/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2"
      >
        {/* Left side - Image Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative hidden bg-gradient-to-br from-emerald-600 to-emerald-800 md:block"
        >
          <div className="absolute inset-0 opacity-40">
            <img
              src="/loginImage.jpg"
              alt="Background"
              className="h-full w-full object-cover mix-blend-overlay"
            />
          </div>
          
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
          
          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-xl backdrop-blur-sm ring-2 ring-white/30">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-8 w-8 drop-shadow-lg"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    New Life Christian Mission
                  </h2>
                </div>
              </div>
              
              {/* Bible icon with decorative frame */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-0 flex justify-center ml-[323px]"
              >
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-3xl bg-white/20 blur-xl" />
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-white/10 shadow-2xl backdrop-blur-sm ring-2 ring-white/30">
                    <img
                      src="/bible.png"
                      alt="Bible"
                      className="h-20 w-20 drop-shadow-2xl"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="space-y-4"
            >
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Book className="h-5 w-5 text-white" />
                  <h3 className="font-semibold text-white">Philippians 4:13</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/90">
                  I can do all things through Christ which strengtheneth me.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white p-8 sm:p-12"
        >
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8 md:hidden"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-8 w-8"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-emerald-700">
                    New Life Christian Mission
                  </h2>
                </div>
              </div>
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg">
                <img
                  src="/bible.png"
                  alt="Bible"
                  className="h-16 w-16"
                />
              </div>
            </div>
          </motion.div>

          {/* Header Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-8 text-center"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 px-4 py-2">
              <span className="text-sm font-semibold text-emerald-700">Admin Portal</span>
            </div>
    
            <p className="text-gray-600">
              Sign in to access your administration dashboard
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700"
              >
                Username
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-emerald-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className={`block w-full rounded-xl border bg-gray-50 py-3.5 pr-4 pl-12 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 sm:text-sm ${
                    errors.username ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200"
                  }`}
                  {...register("username", { required: "Username is required" })}
                />
                {errors.username && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-1 text-sm text-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.username.message}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-emerald-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`block w-full rounded-xl border bg-gray-50 py-3.5 pr-12 pl-12 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 sm:text-sm ${
                    errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200"
                  }`}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors duration-200 hover:text-emerald-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {errors.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-1 text-sm text-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.password.message}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || loginMutation.isPending}
                className="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {isSubmitting || loginMutation.isPending ? (
                  <span className="relative flex items-center justify-center">
                    <svg
                      className="mr-3 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </div>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-8 border-t border-gray-100 pt-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Lock className="h-3.5 w-3.5" />
              <p className="leading-relaxed">
                Restricted access. Unauthorized use prohibited.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignInPage;