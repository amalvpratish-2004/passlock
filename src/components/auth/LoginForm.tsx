"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Email Input */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
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
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter your email"
          />
        </div>
        {form.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
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
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600">
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
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700"
          >
            Remember me
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
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
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <GitHubIcon />
            GitHub
          </Button>

          {/* Google Button */}
          <Button
            type="button"
            disabled={pending}
            onClick={() => onSocial("google")}
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <GoogleIcon />
            Google
          </Button>
        </div>
      </div>
    </form>
  );
};