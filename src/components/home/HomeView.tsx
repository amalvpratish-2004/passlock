"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, RefreshCw, Save, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { PasswordService } from "@/services/passwordServices";
import { authClient } from "@/lib/auth-client";

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
      const result = await PasswordService.createPassword({
        title: saveData.title,
        username: saveData.username,
        password: password, // The generated password
        url: saveData.url,
        notes: saveData.notes,
        userId: userId,
      });
      console.log(result);

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
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10">
      <Button
        onClick={() => router.push("/vault")}
        className="absolute bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-md px-5 py-2 flex items-center space-x-2 transition-all duration-300 hover:scale-105"
      >
        <Lock className="h-4 w-4" />
        <span className="font-medium text-sm">Open Vault</span>
      </Button>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Passlock</h1>
        <p className="text-gray-600 text-lg">
          Instantly create strong and secure passwords to keep your account safe
          online.
        </p>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Generated Password */}
        <div className="lg:flex-1">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 h-full">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Generated Password
              </h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${strength.bg}`}></div>
                <span className={`font-semibold ${strength.color}`}>
                  {strength.text}
                </span>
              </div>
            </div>

            {/* Password Display */}
            <div className="bg-white rounded-lg p-6 border border-gray-300 mb-6">
              <div className="font-mono text-2xl font-bold text-gray-800 text-center break-all leading-relaxed">
                {password}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={generatePassword}
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-2 py-3"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Regenerate</span>
              </Button>
              <Button
                onClick={copyToClipboard}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 ${
                  isCopied
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {isCopied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
                <span>{isCopied ? "Copied!" : "Copy Password"}</span>
              </Button>
            </div>

            {/* Save Password Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowSaveForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Password to Vault
              </Button>

              {/* Popup Modal */}
              {showSaveForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Save Password
                      </h3>
                      <Button
                        onClick={closeSaveModal}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <Input
                          type="text"
                          value={saveData.title}
                          onChange={(e) =>
                            handleSaveDataChange("title", e.target.value)
                          }
                          placeholder="e.g., Gmail Account"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username/Email *
                        </label>
                        <Input
                          type="text"
                          value={saveData.username}
                          onChange={(e) =>
                            handleSaveDataChange("username", e.target.value)
                          }
                          placeholder="e.g., john.doe@gmail.com"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website URL
                        </label>
                        <Input
                          type="url"
                          value={saveData.url}
                          onChange={(e) =>
                            handleSaveDataChange("url", e.target.value)
                          }
                          placeholder="e.g., https://gmail.com"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={saveData.notes}
                          onChange={(e) =>
                            handleSaveDataChange("notes", e.target.value)
                          }
                          placeholder="Additional notes about this password..."
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Generated Password Preview */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Generated Password
                        </label>
                        <div className="font-mono text-sm bg-white rounded px-2 py-1 border break-all">
                          {password}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-5">
                      <Button
                        onClick={closeSaveModal}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSavePassword}
                        disabled={isSaving}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Password
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Settings */}
        <div className="lg:flex-1">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 h-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Password Settings
            </h2>

            {/* Length Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-medium text-gray-900">
                  Password length:{" "}
                  <span className="text-blue-600 font-bold">{length}</span>
                </label>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                value={length}
                onChange={(e) => handleLengthChange(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>4</span>
                <span>32</span>
              </div>
            </div>

            {/* Character Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Characters used:
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Uppercase */}
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) =>
                      handleCharacterTypeChange("uppercase", e.target.checked)
                    }
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">ABC</span>
                    <p className="text-sm text-gray-500">Uppercase letters</p>
                  </div>
                </label>

                {/* Lowercase */}
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) =>
                      handleCharacterTypeChange("lowercase", e.target.checked)
                    }
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">abc</span>
                    <p className="text-sm text-gray-500">Lowercase letters</p>
                  </div>
                </label>

                {/* Numbers */}
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) =>
                      handleCharacterTypeChange("numbers", e.target.checked)
                    }
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">123</span>
                    <p className="text-sm text-gray-500">Numbers</p>
                  </div>
                </label>

                {/* Symbols */}
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) =>
                      handleCharacterTypeChange("symbols", e.target.checked)
                    }
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">@#$%</span>
                    <p className="text-sm text-gray-500">Symbols</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
