"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Verify2FAProps {
  email?: string;
  onBack?: () => void;
}

export const Verify2FA = ({ email, onBack }: Verify2FAProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const verifyCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: true,
      });

      if (error) {
        if (error.code === "INVALID_TOTP_CODE") {
          throw new Error("Invalid verification code. Please try again.");
        }
        throw new Error(error.message);
      }

      console.log("2FA verification successful:", data);
      router.push("/"); // Redirect after successful verification
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-center">
          Two-Factor Authentication
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          {email ? `Enter the code for ${email}` : "Enter your verification code"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center text-2xl tracking-widest font-mono"
          maxLength={6}
        />
        
        <Button 
          onClick={verifyCode} 
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>

        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack}
            disabled={loading}
          >
            Back to Login
          </Button>
        )}
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code.
        </p>
      </div>
    </div>
  );
};