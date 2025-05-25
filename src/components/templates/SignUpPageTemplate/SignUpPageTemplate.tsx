"use client";

import { Google_Logo } from "@/assets";
import { AuthService } from "@/services";
import { SignUpFormInputs, SignUpSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const SignUpPageTemplate = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const router = useRouter();

  const authService = new AuthService();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (data: SignUpFormInputs) => {
    const formDataWithTimestamp = {
      ...data,
      joinedOn: new Date().getTime(),
    };

    try {
      setIsLoading(true);
      const registerResponse = await authService.register(
        formDataWithTimestamp
      );

      if (!registerResponse?.uid) {
        toast.error("Registration failed!");
        return;
      }

      toast.success("Registration successful!");
      router.push("/signin");
    } catch (error) {
      console.log("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setIsGoogleLoading(true);

      await authService.registerByGoogle();

      router.push("/signin");
      toast.success("Registration successful!");
    } catch (error) {
      console.log("Google registration error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push("/signin");
  };

  return (
    <div className="py-10 h-screen">
      <div className="w-full max-w-md mx-auto rounded-xl shadow-sm border border-emerald-900 overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="px-8 pt-5 pb-4">
          <h2 className="text-2xl font-semibold text-emerald-500 text-center mb-2">
            Create an account
          </h2>
          <p className="text-gray-200 text-center text-sm mb-10">
            Sign up to get started
          </p>

          <div className="space-y-4">
            {/* Email/Username Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name and Email in one row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="w-full px-4 py-3.5 rounded-lg border border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-200 text-sm bg-transparent"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-3.5 rounded-lg border border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-200 text-sm bg-transparent"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-3.5 rounded-lg border border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-200 text-sm bg-transparent"
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1.5">
                    emerald
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-3.5 px-4 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 mt-4"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-emerald-600 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Sign up"
                )}
              </button>
            </form>

            {/* Sign In Option */}
            <div className="text-center pt-2">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <button
                  onClick={handleSignIn}
                  className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors focus:outline-none"
                >
                  Sign in
                </button>
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-900 text-gray-400">or</span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center gap-3 bg-teal-700 border border-teal-700 rounded-lg py-3.5 px-4 text-white hover:bg-teal-800 hover:border-teal-800 transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700"
            >
              {isGoogleLoading ? (
                <div className="h-5 w-5 border-2 border-teal-800 border-t-teal-400 rounded-full animate-spin mx-auto"></div>
              ) : (
                <div className="flex items-center gap-3">
                  <Image
                    src={Google_Logo}
                    alt="Google Logo"
                    className="w-5 h-5"
                  />
                  <span>Continue with Google</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPageTemplate;
