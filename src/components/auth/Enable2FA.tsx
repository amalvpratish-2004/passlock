"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import QRCode from "react-qr-code";
import { useRouter } from "next/navigation";
import {
  Shield,
  Key,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";

export const Enable2FA = () => {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [totpURI, setTotpURI] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"password" | "qr" | "success">("password");

  const router = useRouter();

  // Extract secret from TOTP URI for manual entry
  const extractSecretFromURI = (uri: string) => {
    const secretMatch = uri.match(/secret=([^&]+)/);
    return secretMatch ? secretMatch[1] : "";
  };

  // Step 1: generate TOTP secret + QR URI
  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await authClient.twoFactor.enable({
        password, // user's current password is required for verification
      });

      if (error) throw new Error(error.message);

      // Show QR code for the user to scan
      setTotpURI(data?.totpURI || "");
      const extractedSecret = extractSecretFromURI(data?.totpURI || "");
      setSecret(extractedSecret);
      setShowQR(true);
      setStep("qr");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to enable 2FA. Please check your password."
      );
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify user's 6-digit code from authenticator app
  const verifyCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await authClient.twoFactor.verifyTotp({
        code, // required 6-digit code from user's app
        trustDevice: true, // optional: remember this device
      });

      if (error) throw new Error(error.message);
      setStep("success");

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push("/vault");
      }, 3000);
    } catch (err) {
      setError("Invalid verification code. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleBack = () => {
    if (step === "qr") {
      setShowQR(false);
      setStep("password");
      setCode("");
      setError(null);
    } else {
      router.push("/vault");
    }
  };

  if (step === "success") {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl border-[#e8e6f9] dark:border-[#3b315a]">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#f6f4ff] dark:bg-[#3b315a] mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#82ab7d]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#4a3f8c] dark:text-[#dcd6f7]">
            2FA Enabled Successfully!
          </CardTitle>
          <CardDescription className="text-lg text-[#5a4ea8] dark:text-[#c5bdf7] mt-2">
            Your account is now protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-[#f6f4ff] dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg p-4">
            <div className="flex items-center space-x-2 text-[#82ab7d]">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">
                Enhanced Security Active
              </span>
            </div>
          </div>
          <div className="text-center text-sm text-[#7b68ee] dark:text-[#b3a7f9]">
            <p>Redirecting you to your vault in 3 seconds...</p>
          </div>
          <Button
            onClick={() => router.push("/vault")}
            className="w-full bg-gradient-to-r from-[#7b68ee] to-[#b3a7f9] hover:from-[#6a5bbf] hover:to-[#9d8fdf] text-white"
            size="lg"
          >
            Go to Vault Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-[#e8e6f9] dark:border-[#3b315a]">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#f6f4ff] dark:bg-[#3b315a] mb-4">
          <Shield className="h-6 w-6 text-[#7b68ee] dark:text-[#b3a7f9]" />
        </div>
        <CardTitle className="text-2xl font-bold text-[#4a3f8c] dark:text-[#dcd6f7]">
          Enable 2FA
        </CardTitle>
        <CardDescription className="text-[#5a4ea8] dark:text-[#c5bdf7]">
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-[#5a4ea8] dark:text-[#c5bdf7]">
            <span
              className={
                step === "password"
                  ? "text-[#7b68ee] dark:text-[#b3a7f9] font-medium"
                  : ""
              }
            >
              Verify Password
            </span>
            <span
              className={
                step === "qr"
                  ? "text-[#7b68ee] dark:text-[#b3a7f9] font-medium"
                  : ""
              }
            >
              Scan QR Code
            </span>
          </div>
          <Progress
            value={step === "password" ? 33 : step === "qr" ? 66 : 100}
            className="h-2 bg-[#e8e6f9] dark:bg-[#3b315a]"
          />
        </div>

        {error && (
          <Alert className="bg-[#f6f4ff] dark:bg-[#3b315a] border-[#dcd6f7] dark:border-[#5a4a8a]">
            <AlertCircle className="h-4 w-4 text-[#7b68ee] dark:text-[#b3a7f9]" />
            <AlertDescription className="text-[#5a4ea8] dark:text-[#c5bdf7]">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!showQR ? (
          // Password Verification Step
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#5a4ea8] dark:text-[#c5bdf7]"
              >
                Enter your password to continue
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10 border-[#dcd6f7] dark:border-[#5a4a8a] focus:border-[#7b68ee] text-[#4a3f8c] dark:text-[#e8e6f9] bg-transparent"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7b68ee] dark:text-[#b3a7f9] hover:text-[#6a5bbf] dark:hover:text-[#9d8fdf] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-[#f6f4ff] dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Key className="h-5 w-5 text-[#7b68ee] dark:text-[#b3a7f9] mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#4a3f8c] dark:text-[#dcd6f7]">
                    Security Check
                  </p>
                  <p className="text-xs text-[#5a4ea8] dark:text-[#c5bdf7]">
                    We need to verify your identity before enabling two-factor
                    authentication.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-[#dcd6f7] text-[#7b68ee] hover:bg-[#f6f4ff] dark:border-[#5a4a8a] dark:text-[#b3a7f9] dark:hover:bg-[#3b315a]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={generateQRCode}
                disabled={loading || !password}
                className="flex-1 bg-gradient-to-r from-[#7b68ee] to-[#b3a7f9] hover:from-[#6a5bbf] hover:to-[#9d8fdf] text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // QR Code and Verification Step
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-[#2a243a] rounded-2xl shadow-lg border border-[#e8e6f9] dark:border-[#3b315a]">
                <QRCode
                  value={totpURI}
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#f6f4ff] dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Smartphone className="h-5 w-5 text-[#7b68ee] dark:text-[#b3a7f9] mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#4a3f8c] dark:text-[#dcd6f7]">
                      Scan the QR Code
                    </p>
                    <p className="text-xs text-[#5a4ea8] dark:text-[#c5bdf7]">
                      Use an authenticator app like Google Authenticator, Authy,
                      or Microsoft Authenticator to scan this code.
                    </p>
                  </div>
                </div>
              </div>

              {secret && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#5a4ea8] dark:text-[#c5bdf7]">
                    Can&apos;t scan? Enter this code manually:
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 font-mono text-sm bg-[#f6f4ff] dark:bg-[#3b315a] border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-lg px-3 py-2 truncate text-[#4a3f8c] dark:text-[#e8e6f9]">
                      {secret}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(secret)}
                      className="shrink-0 border-[#dcd6f7] text-[#7b68ee] hover:bg-[#f6f4ff] dark:border-[#5a4a8a] dark:text-[#b3a7f9] dark:hover:bg-[#3b315a]"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-[#82ab7d]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="code"
                  className="text-sm font-medium text-[#5a4ea8] dark:text-[#c5bdf7]"
                >
                  Enter 6-digit verification code
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="h-12 text-center text-xl tracking-widest font-mono border-[#dcd6f7] dark:border-[#5a4a8a] focus:border-[#7b68ee] text-[#4a3f8c] dark:text-[#e8e6f9] bg-transparent"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-[#dcd6f7] text-[#7b68ee] hover:bg-[#f6f4ff] dark:border-[#5a4a8a] dark:text-[#b3a7f9] dark:hover:bg-[#3b315a]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className="flex-1 bg-gradient-to-r from-[#7b68ee] to-[#b3a7f9] hover:from-[#6a5bbf] hover:to-[#9d8fdf] text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
