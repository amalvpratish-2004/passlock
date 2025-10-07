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
  email: z.string().email({ message: "Please enter a valid email" }),
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
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    setUserEmail(data.email);

    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (ctx) => {
          setPending(false);
          if (ctx.data?.twoFactorRedirect) setShow2FA(true);
          else router.push("/");
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
        provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => setPending(false),
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        },
      }
    );
  };

  if (show2FA) {
    return <Verify2FA email={userEmail} onBack={() => setShow2FA(false)} />;
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="bg-[#faf9fe] dark:bg-[#2a243a] rounded-2xl shadow-xl border border-[#e8e6f9] dark:border-[#3b315a] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Iris gradient & branding */}
          <div className="lg:w-2/5 bg-gradient-to-br from-[#7b68ee] to-[#a18aff] px-8 lg:px-12 flex flex-col justify-center items-center text-white">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm border border-white/30">
                <Shield className="h-16 w-16 text-[#f8f7ff]" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-[#faf9fe]">Passlock</h1>
                <p className="text-[#e8e6f9] text-lg leading-relaxed">
                  Secure and safe password manager.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form Section */}
          <div className="lg:w-3/5 p-8 lg:p-12 bg-[#faf9fe] dark:bg-[#2a243a]">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#4a3f8c] dark:text-[#dcd6f7] mb-2">
                  Welcome Back
                </h2>
                <p className="text-[#7b68ee] dark:text-[#b3a7f9]">
                  Sign in to your account to continue
                </p>
              </div>

              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {error && (
                  <Alert className="bg-[#f6f4ff] dark:bg-[#3b315a] border-[#dcd6f7] dark:border-[#5c4a8a]">
                    <AlertTitle className="text-[#7b68ee] dark:text-[#b3a7f9]">
                      Error
                    </AlertTitle>
                    <p className="text-[#6a5bbf] dark:text-[#c5bdf7]">{error}</p>
                  </Alert>
                )}

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#5a4ea8] dark:text-[#c5bdf7] mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-[#9d8fdf]" />
                    <input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="w-full pl-10 pr-3 py-3 bg-white/60 dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg placeholder-[#b3a7f9] text-[#4a3f8c] dark:text-[#e8e6f9] focus:outline-none focus:ring-2 focus:ring-[#9d8fdf] transition-all"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#5a4ea8] dark:text-[#c5bdf7] mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-[#9d8fdf]" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("password")}
                      className="w-full pl-10 pr-10 py-3 bg-white/60 dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg placeholder-[#b3a7f9] text-[#4a3f8c] dark:text-[#e8e6f9] focus:outline-none focus:ring-2 focus:ring-[#9d8fdf] transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#9d8fdf] hover:text-[#7b68ee] dark:hover:text-[#c5bdf7] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-[#7b68ee] to-[#b3a7f9] hover:from-[#6a5bbf] hover:to-[#9d8fdf] focus:ring-2 focus:ring-[#b3a7f9] focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
                >
                  {pending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    "Sign in"
                  )}
                </button>

                {/* Social Login */}
                <div className="mt-6 text-center">
                  <p className="text-[#9d8fdf] dark:text-[#b3a7f9] mb-3">
                    Or continue with
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={() => onSocial("github")}
                      disabled={pending}
                      className="flex items-center justify-center gap-2 py-3 border border-[#dcd6f7] dark:border-[#5a4a8a] bg-white/70 dark:bg-[#3b315a] text-[#4a3f8c] dark:text-[#e8e6f9] hover:bg-[#f2f0ff] dark:hover:bg-[#45386a] rounded-lg transition-all cursor-pointer"
                    >
                      <GitHubIcon /> GitHub
                    </Button>
                    <Button
                      type="button"
                      onClick={() => onSocial("google")}
                      disabled={pending}
                      className="flex items-center justify-center gap-2 py-3 border border-[#dcd6f7] dark:border-[#5a4a8a] bg-white/70 dark:bg-[#3b315a] text-[#4a3f8c] dark:text-[#e8e6f9] hover:bg-[#f2f0ff] dark:hover:bg-[#45386a] rounded-lg transition-all cursor-pointer"
                    >
                      <GoogleIcon /> Google
                    </Button>
                  </div>
                </div>
              </form>

              {/* Signup link */}
              <div className="mt-6 text-center">
                <p className="text-[#7b68ee] dark:text-[#b3a7f9]">
                  Don’t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-[#5a4ea8] hover:text-[#7b68ee] dark:text-[#dcd6f7] dark:hover:text-[#b3a7f9] transition-colors"
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
