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
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
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
  const [showPassword, setShowPassword] = useState(false); // Add this state
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
      setError(err instanceof Error ? err.message : "Failed to enable 2FA. Please check your password.");
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
      console.error('Failed to copy:', err);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              2FA Enabled Successfully!
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Your account is now protected with two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Enhanced Security Active</span>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">
              <p>Redirecting you to your vault in 3 seconds...</p>
            </div>
            <Button 
              onClick={() => router.push("/vault")} 
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Go to Vault Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl py-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Enable 2FA
          </CardTitle>
          <CardDescription className="text-gray-600">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span className={step === "password" ? "text-blue-600 font-medium" : ""}>
                Verify Password
              </span>
              <span className={step === "qr" ? "text-blue-600 font-medium" : ""}>
                Scan QR Code
              </span>
            </div>
            <Progress 
              value={step === "password" ? 33 : step === "qr" ? 66 : 100} 
              className="h-2"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showQR ? (
            // Password Verification Step
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Enter your password to continue
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">Security Check</p>
                    <p className="text-xs text-blue-700">
                      We need to verify your identity before enabling two-factor authentication.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleBack}
                  variant="outline" 
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={generateQRCode} 
                  disabled={loading || !password}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg border">
                  <QRCode 
                    value={totpURI} 
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-orange-900">Scan the QR Code</p>
                      <p className="text-xs text-orange-700">
                        Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this code.
                      </p>
                    </div>
                  </div>
                </div>

                {secret && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Can&apos;t scan? Enter this code manually:
                    </label>
                    <div className="flex space-x-2">
                      <div className="flex-1 font-mono text-sm bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 truncate">
                        {secret}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(secret)}
                        className="shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium text-gray-700">
                    Enter 6-digit verification code
                  </label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-12 text-center text-xl tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleBack}
                  variant="outline" 
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={verifyCode} 
                  disabled={loading || code.length !== 6}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
    </div>
  );
};