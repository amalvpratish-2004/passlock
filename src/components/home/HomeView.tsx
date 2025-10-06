"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, RefreshCw, Save, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PasswordService } from "@/services/passwordServices";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "../theme-toggle";
import { SaveForm } from "./SaveForm";

interface SavePasswordData {
  title: string;
  username: string;
  url: string;
  notes: string;
}

export const HomeView = () => {
  const router = useRouter();
  const [password, setPassword] = useState("aMMFzFEze0s3NTRa");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveData, setSaveData] = useState<SavePasswordData>({
    title: "",
    username: "",
    url: "",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Character sets
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const generatePassword = useCallback(() => {
    let charset = "";

    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    // Ensure at least one character type is selected
    if (charset.length === 0) {
      setPassword("Select character types");
      return;
    }

    let newPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }

    setPassword(newPassword);
    setIsCopied(false);
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  ]);

  // Generate password automatically when any setting changes
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const getPasswordStrength = () => {
    if (length < 8)
      return { text: "Weak", color: "text-red-500", bg: "bg-red-500" };
    if (length < 12)
      return { text: "Medium", color: "text-yellow-500", bg: "bg-yellow-500" };
    if (length < 16)
      return { text: "Strong", color: "text-blue-500", bg: "bg-blue-500" };
    return { text: "Very strong", color: "text-green-500", bg: "bg-green-500" };
  };

  const strength = getPasswordStrength();

  const handleLengthChange = (newLength: number) => {
    setLength(newLength);
  };

  const handleCharacterTypeChange = (type: string, checked: boolean) => {
    switch (type) {
      case "uppercase":
        setIncludeUppercase(checked);
        break;
      case "lowercase":
        setIncludeLowercase(checked);
        break;
      case "numbers":
        setIncludeNumbers(checked);
        break;
      case "symbols":
        setIncludeSymbols(checked);
        break;
    }
  };

  const handleSavePassword = async () => {
    if (!saveData.title.trim()) {
      alert("Please enter a title for the password");
      return;
    }

    if (!saveData.username.trim()) {
      alert("Please enter a username");
      return;
    }

    try {
      setIsSaving(true);

      // Get current user ID - you'll need to replace this with your actual auth user ID
      const userId = await getCurrentUserId();

      // Save to database using the PasswordService
      await PasswordService.createPassword({
        title: saveData.title,
        username: saveData.username,
        password: password, // The generated password
        url: saveData.url,
        notes: saveData.notes,
        userId: userId,
      });

      // Reset form and show success message
      setSaveData({
        title: "",
        username: "",
        url: "",
        notes: "",
      });
      setShowSaveForm(false);

      alert("Password saved successfully to vault!");
    } catch (error) {
      console.error("Error saving password:", error);
      alert("Failed to save password: " + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDataChange = (
    field: keyof SavePasswordData,
    value: string
  ) => {
    setSaveData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const closeSaveModal = () => {
    setShowSaveForm(false);
    setSaveData({
      title: "",
      username: "",
      url: "",
      notes: "",
    });
  };

  const getCurrentUserId = async (): Promise<string> => {
    const session = await authClient.getSession();
    if (!session.data?.user.id) return "";
    return session.data?.user.id; // Replace with actual user ID from your auth system
  };

  return (
    <div className="py-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-900 p-4 transition-colors duration-300 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header with Vault Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Passlock
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Instantly create strong and secure passwords to keep your
                account safe online.
              </p>
            </div>
          </div>

          <div className="flex space-x-10">
            <Button
              onClick={() => router.push("/vault")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl px-6 py-3 flex items-center space-x-1 transition-all duration-300 hover:scale-102 rounded-xl"
            >
              <Lock className="h-5 w-5" />
              <span className="font-medium p-1">Open Vault</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Generated Password */}
          <div className="lg:flex-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                  Generated Password
                </h2>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className={`w-4 h-4 rounded-full ${strength.bg}`}></div>
                  <span className={`font-semibold text-lg ${strength.color}`}>
                    {strength.text}
                  </span>
                </div>
              </div>

              {/* Password Display */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6 transition-all duration-300 hover:shadow-md">
                <div className="font-mono text-2xl font-bold text-gray-800 dark:text-gray-200 text-center break-all leading-relaxed">
                  {password}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={generatePassword}
                  variant="outline"
                  className="flex-1 flex items-center justify-center space-x-2 py-4 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-all duration-300 rounded-xl"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span className="font-medium">Regenerate</span>
                </Button>
                <Button
                  onClick={copyToClipboard}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl transition-all duration-300 ${
                    isCopied
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  } text-white shadow-lg hover:shadow-xl hover:scale-102`}
                >
                  {isCopied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {isCopied ? "Copied!" : "Copy Password"}
                  </span>
                </Button>
              </div>

              {/* Save Password Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <Button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102"
                >
                  <Save className="h-5 w-5 mr-2" />
                  <span className="font-medium">Save Password to Vault</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Settings */}
          <div className="lg:flex-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                Password Settings
              </h2>

              {/* Length Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-semibold text-gray-800 dark:text-white">
                    Password length:{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {length}
                    </span>
                  </label>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  value={length}
                  onChange={(e) => handleLengthChange(parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-lg appearance-none cursor-pointer slider transition-all duration-300"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                      ((length - 4) / 28) * 100
                    }%, #e5e7eb ${((length - 4) / 28) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                  <span>4</span>
                  <span>32</span>
                </div>
              </div>

              {/* Character Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Characters used:
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Uppercase */}
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-300 bg-white/50 dark:bg-gray-700/50 group">
                    <input
                      type="checkbox"
                      checked={includeUppercase}
                      onChange={(e) =>
                        handleCharacterTypeChange("uppercase", e.target.checked)
                      }
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition-colors"
                    />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        ABC
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Uppercase letters
                      </p>
                    </div>
                  </label>

                  {/* Lowercase */}
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-all duration-300 bg-white/50 dark:bg-gray-700/50 group">
                    <input
                      type="checkbox"
                      checked={includeLowercase}
                      onChange={(e) =>
                        handleCharacterTypeChange("lowercase", e.target.checked)
                      }
                      className="h-5 w-5 text-green-600 rounded focus:ring-green-500 transition-colors"
                    />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        abc
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Lowercase letters
                      </p>
                    </div>
                  </label>

                  {/* Numbers */}
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-all duration-300 bg-white/50 dark:bg-gray-700/50 group">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) =>
                        handleCharacterTypeChange("numbers", e.target.checked)
                      }
                      className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500 transition-colors"
                    />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        123
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Numbers
                      </p>
                    </div>
                  </label>

                  {/* Symbols */}
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer transition-all duration-300 bg-white/50 dark:bg-gray-700/50 group">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) =>
                        handleCharacterTypeChange("symbols", e.target.checked)
                      }
                      className="h-5 w-5 text-orange-600 rounded focus:ring-orange-500 transition-colors"
                    />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        @#$%
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Symbols
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Popup Modal */}
      {showSaveForm && (
        <SaveForm
          closeSaveModal={closeSaveModal}
          saveData={saveData}
          isSaving={isSaving}
          handleSaveDataChange={handleSaveDataChange}
          handleSavePassword={handleSavePassword}
          password={password}
        />
      )}
    </div>
  );
};
