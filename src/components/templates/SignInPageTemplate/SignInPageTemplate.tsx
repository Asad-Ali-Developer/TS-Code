"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/router";
import { type SigninFormInputsTypes, SigninSchema, UserDetails } from "@/types";
import { Google_Logo } from "@/assets";
import { useAuth } from "@/providers";
import { AuthService } from "@/services";

const SignInPageTemplate = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const router = useRouter();
  const { setUserDetails } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormInputsTypes>({
    resolver: zodResolver(SigninSchema),
  });

  const onSubmit = async (data: SigninFormInputsTypes) => {
    const authService = new AuthService();

    console.log("User data:", data);

    try {
      setIsLoading(true);
      const response = await authService.login(data);

      // 🔒 If register failed (e.g., user exists), stop
      if (!response?.uid) {
        return;
      }

      setUserDetails(response);
      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const authService = new AuthService();

    try {
      setIsGoogleLoading(true);
      const response = await authService.loginByGoogle();

      // 🔒 If register failed (e.g., user exists), stop
      if (!response?.uid) {
        return;
      }

      setUserDetails(response as UserDetails);

      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="py-16">
      <div className="w-full max-w-md mx-auto rounded-xl shadow-sm border border-emerald-900 overflow-hidden transition-all duration-300 hover:shadow-md text-white">
        <div className="px-8 pt-5 pb-5">
          <h2 className="text-2xl font-semibold text-center mb-2 text-emerald-500">
            Welcome back
          </h2>
          <p className="text-center text-sm mb-10">
            Sign in to continue to your account
          </p>

          <div className="space-y-5">
            {/* Email/Password Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  className="w-full px-4 py-3.5 rounded-lg border border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-200 text-sm text-white bg-transparent"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.email.message}
                  </p>
                )}
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
                  className="w-full px-4 py-3.5 rounded-lg border border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-200 text-sm text-white bg-transparent"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full hover:bg-emerald-800 text-white rounded-lg py-3.5 px-4 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 mt-4 bg-emerald-700"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Sign Up Option */}
            <div className="text-center pt-2">
              <p className="text-gray-400 text-sm">
                Don&rsquo;t have an account?{" "}
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="text-primary hover:text-primary/80 font-medium transition-colors focus:outline-none text-emerald-500"
                >
                  Sign up
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
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 bg-teal-800 border border-teal-800 rounded-lg py-3.5 px-4 text-white hover:bg-teal-900 hover:border-teal-800 transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800"
            >
              {isGoogleLoading ? (
                <div className="h-5 w-5 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin"></div>
              ) : (
                <>
                  <Image
                    src={Google_Logo}
                    alt="Google Logo"
                    className="w-5 h-5"
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPageTemplate;
