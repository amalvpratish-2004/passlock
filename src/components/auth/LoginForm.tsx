"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import Link from "next/link";

import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import { Verify2FA } from "./Verify2FA";

const formSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    setUserEmail(data.email); // Store email for 2FA context

    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (context) => {
          setPending(false);
          // Check if 2FA is required
          if (context.data?.twoFactorRedirect) {
            setShow2FA(true); // Show 2FA verification component
          } else {
            // Regular login successful
            router.push("/");
          }
        },
        onError: (ctx) => {
          setError(ctx.error.message);
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

  // If 2FA is required, show the verification component
  if (show2FA) {
    return <Verify2FA email={userEmail} onBack={() => setShow2FA(false)} />;
  }

  return (
    <div className="w-full max-w-6xl">
      {/* Increased max width for two columns */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Brand Section */}
          <div className="lg:w-2/5 bg-gradient-to-br from-blue-500 to-purple-600 px-8 lg:px-12 flex flex-col justify-center items-center text-white">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Shield Icon */}
              <div className="p-4 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm">
                <Shield className="h-16 w-16 text-white" />
              </div>

              {/* Brand Text */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">Passlock</h1>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Secure your digital life with enterprise-grade password
                  management
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="lg:w-3/5 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sign in to your account to continue
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
                    <AlertTitle className="text-red-800 dark:text-red-400">
                      Error
                    </AlertTitle>
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                  </Alert>
                )}

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      {...form.register("email")}
                      className="block w-full pl-10 pr-3 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 transition-all"
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
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      {...form.register("password")}
                      className="block w-full pl-10 pr-10 py-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-transparent"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {pending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Sign in"
                  )}
                </button>

                {/* Social Login */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {/* GitHub Button */}
                    <Button
                      type="button"
                      disabled={pending}
                      onClick={() => onSocial("github")}
                      className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white/50 dark:bg-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <GitHubIcon />
                      GitHub
                    </Button>

                    {/* Google Button */}
                    <Button
                      type="button"
                      disabled={pending}
                      onClick={() => onSocial("google")}
                      className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white/50 dark:bg-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <GoogleIcon />
                      Google
                    </Button>
                  </div>
                </div>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Sign up
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
