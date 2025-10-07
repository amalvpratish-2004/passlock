"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";

import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/");
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        },
      }
    );
  };

  const onSocial = (provider: "github" | "google") => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        },
      }
    );
  };

  return (
    <div className="w-full max-w-5xl max-h-6xl">
      {/* Increased max width for two columns */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Brand Section */}
          <div className="lg:w-2/5 bg-gradient-to-br from-[#7b68ee] to-[#a18aff] px-8 lg:px-12 flex flex-col justify-center items-center text-white">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Shield Icon */}
              <div className="p-4 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm">
                <Shield className="h-16 w-16 text-white" />
              </div>

              {/* Brand Text */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">Passlock</h1>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Secure and safe password manager
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-3/5 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#4a3f8c] dark:text-[#dcd6f7] mb-2">
                  Create Account
                </h2>
                <p className="text-[#7b68ee] dark:text-[#b3a7f9]">
                  Sign up to start securing your passwords
                </p>
              </div>

              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                {error && (
                  <Alert
                    variant="destructive"
                    className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  >
                    <AlertTitle className="text-[#7b68ee] dark:text-[#b3a7f9]">
                      Error
                    </AlertTitle>
                    <p className="text-[#6a5bbf] dark:text-[#c5bdf7]">{error}</p>
                  </Alert>
                )}

                {/* Social Login */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* GitHub Button */}
                    <Button
                      type="button"
                      disabled={pending}
                      onClick={() => onSocial("github")}
                      className="flex items-center justify-center gap-2 py-3 border border-[#dcd6f7] dark:border-[#5a4a8a] bg-white/70 dark:bg-[#3b315a] text-[#4a3f8c] dark:text-[#e8e6f9] hover:bg-[#f2f0ff] dark:hover:bg-[#45386a] rounded-lg transition-all cursor-pointer"
                    >
                      <GitHubIcon />
                      GitHub
                    </Button>

                    {/* Google Button */}
                    <Button
                      type="button"
                      disabled={pending}
                      onClick={() => onSocial("google")}
                      className="flex items-center justify-center gap-2 py-3 border border-[#dcd6f7] dark:border-[#5a4a8a] bg-white/70 dark:bg-[#3b315a] text-[#4a3f8c] dark:text-[#e8e6f9] hover:bg-[#f2f0ff] dark:hover:bg-[#45386a] rounded-lg transition-all cursor-pointer"
                    >
                      <GoogleIcon />
                      Google
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600 py-1" />
                    <div className="relative flex justify-center text-sm">
                      <span className="text-[#9d8fdf] dark:text-[#b3a7f9]">
                        Or register with email
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#5a4ea8] dark:text-[#c5bdf7] mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-[#9d8fdf]" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      required
                      {...form.register("name")}
                      className="w-full pl-10 pr-3 py-3 bg-white/60 dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg placeholder-[#b3a7f9] text-[#4a3f8c] dark:text-[#e8e6f9] focus:outline-none focus:ring-2 focus:ring-[#9d8fdf] transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#5a4ea8] dark:text-[#c5bdf7] mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#9d8fdf]" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      required
                      {...form.register("email")}
                      className="w-full pl-10 pr-3 py-3 bg-white/60 dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg placeholder-[#b3a7f9] text-[#4a3f8c] dark:text-[#e8e6f9] focus:outline-none focus:ring-2 focus:ring-[#9d8fdf] transition-all"
                      placeholder="Enter your email"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#5a4ea8] dark:text-[#c5bdf7] mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#9d8fdf]" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      {...form.register("password")}
                      className="w-full pl-10 pr-3 py-3 bg-white/60 dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg placeholder-[#b3a7f9] text-[#4a3f8c] dark:text-[#e8e6f9] focus:outline-none focus:ring-2 focus:ring-[#9d8fdf] transition-all"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[#5a4ea8] dark:text-[#c5bdf7] mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#9d8fdf]" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      {...form.register("confirmPassword")}
                      className="w-full pl-10 pr-3 py-3 bg-white/60 dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg placeholder-[#b3a7f9] text-[#4a3f8c] dark:text-[#e8e6f9] focus:outline-none focus:ring-2 focus:ring-[#9d8fdf] transition-all"
                      placeholder="Confirm your password"
                    />
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-[#7b68ee] to-[#b3a7f9] hover:from-[#6a5bbf] hover:to-[#9d8fdf] focus:ring-2 focus:ring-[#b3a7f9] focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
                >
                  {pending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="font-semibold text-[#5a4ea8] hover:text-[#7b68ee] dark:text-[#dcd6f7] dark:hover:text-[#b3a7f9] transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};