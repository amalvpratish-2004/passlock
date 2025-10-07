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
      setTimeout(() => setIsCopied(false), 15000);
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

      const userId = await getCurrentUserId();
      if (!userId) {
        alert("User not authenticated");
        return;
      }

      // Save to database using the updated PasswordService
      await PasswordService.createPassword({
        title: saveData.title,
        username: saveData.username,
        password: password, 
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
    if (!session.data?.user.id) {
      throw new Error("User not authenticated");
    }
    return session.data.user.id; 
  };

  return (
    <div className="py-10 bg-gradient-to-br from-[#faf9fe] via-[#f2f0ff] to-[#e8e6f9] dark:from-[#2a243a] dark:via-[#3b315a] dark:to-[#4a3f8c] p-4 transition-colors duration-300 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header with Vault Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-[#7b68ee] to-[#a18aff] rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7b68ee] to-[#a18aff] dark:from-[#b3a7f9] dark:to-[#dcd6f7] bg-clip-text text-transparent">
                Passlock
              </h1>
              <p className="text-[#5a4ea8] dark:text-[#c5bdf7] mt-2 text-lg">
                Instantly create strong and secure passwords to keep your
                account safe online.
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => router.push("/vault")}
              className="bg-gradient-to-r from-[#7b68ee] to-[#b3a7f9] hover:from-[#6a5bbf] hover:to-[#9d8fdf] text-white shadow-lg hover:shadow-xl px-6 py-3 flex items-center space-x-1 transition-all duration-300 hover:scale-102 rounded-xl cursor-pointer"
            >
              <Lock className="h-5 w-5" />
              <span className="font-medium p-1">Open Vault</span>
            </Button>
            <ThemeToggle />
            <Button
              className="bg-gradient-to-r from-[#7b68ee] to-[#b3a7f9] hover:from-[#6a5bbf] hover:to-[#9d8fdf] text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => router.push("/signin"),
                  },
                })
              }
            >
              Sign out
            </Button>
          </div>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Generated Password */}
          <div className="lg:flex-1">
            <div className="bg-[#faf9fe] dark:bg-[#2a243a] backdrop-blur-sm rounded-2xl p-8 border border-[#e8e6f9] dark:border-[#3b315a] shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#4a3f8c] dark:text-[#dcd6f7] mb-3">
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
              <div className="bg-gradient-to-r from-[#f6f4ff] to-[#e8e6f9] dark:from-[#3b315a] dark:to-[#4a3f8c] rounded-xl p-6 border border-[#dcd6f7] dark:border-[#5a4a8a] mb-6 transition-all duration-300 hover:shadow-md">
                <div className="font-mono text-2xl font-bold text-[#4a3f8c] dark:text-[#e8e6f9] text-center break-all leading-relaxed">
                  {password}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={generatePassword}
                  variant="outline"
                  className="flex-1 flex items-center justify-center space-x-2 py-4 border-[#dcd6f7] text-[#7b68ee] hover:bg-[#f6f4ff] dark:border-[#5a4a8a] dark:text-[#b3a7f9] dark:hover:bg-[#3b315a] transition-all duration-300 rounded-xl cursor-pointer"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span className="font-medium">Regenerate</span>
                </Button>
                <Button
                  onClick={copyToClipboard}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl transition-all duration-15000 ${
                    isCopied
                      ? "bg-gradient-to-r from-[#82ab7d] to-[#82ab7d] hover:from-[#7fa97a] hover:to-[#7fa97a]"
                      : "bg-gradient-to-r from-[#82ab7d] to-[#82ab7d] hover:from-[#7fa97a] hover:to-[#7fa97a] cursor-pointer"
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
              <div className="mt-8 pt-6 border-t border-[#dcd6f7] dark:border-[#5a4a8a]">
                <Button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full bg-gradient-to-r from-[#7b68ee] to-[#b3a7f9] hover:from-[#6a5bbf] hover:to-[#9d8fdf] text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 cursor-pointer"
                >
                  <Save className="h-5 w-5 mr-2" />
                  <span className="font-medium">Save Password to Vault</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Settings */}
          <div className="lg:flex-1">
            <div className="bg-[#faf9fe] dark:bg-[#2a243a] backdrop-blur-sm rounded-2xl p-8 border border-[#e8e6f9] dark:border-[#3b315a] shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <h2 className="text-2xl font-bold text-[#4a3f8c] dark:text-[#dcd6f7] mb-6 text-center">
                Password Settings
              </h2>

              {/* Length Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-semibold text-[#4a3f8c] dark:text-[#dcd6f7]">
                    Password length:{" "}
                    <span className="text-[#7b68ee] dark:text-[#b3a7f9] font-bold">
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
                  className="w-full h-3 bg-gradient-to-r from-[#dcd6f7] to-[#e8e6f9] dark:from-[#5a4a8a] dark:to-[#6a5bbf] rounded-lg appearance-none cursor-pointer slider transition-all duration-300"
                  style={{
                    background: `linear-gradient(to right, #82ab7d 0%, #82ab7d ${
                      ((length - 4) / 28) * 100
                    }%, #e8e6f9 ${((length - 4) / 28) * 100}%, #e8e6f9 100%)`,
                  }}
                />
                <div className="flex justify-between text-sm text-[#7b68ee] dark:text-[#b3a7f9] mt-2 font-medium">
                  <span>4</span>
                  <span>32</span>
                </div>
              </div>

              {/* Character Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#4a3f8c] dark:text-[#dcd6f7] mb-4">
                  Characters used:
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Uppercase */}
                  <label className="flex items-center space-x-3 p-4 border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-xl hover:bg-[#f6f4ff] dark:hover:bg-[#3b315a] cursor-pointer transition-all duration-300 bg-white/50 dark:bg-[#3b315a]/50 group">
                    <input
                      type="checkbox"
                      checked={includeUppercase}
                      onChange={(e) =>
                        handleCharacterTypeChange("uppercase", e.target.checked)
                      }
                      className="h-5 w-5 text-[#7b68ee] rounded focus:ring-[#7b68ee] transition-colors"
                    />
                    <div>
                      <span className="font-bold text-[#4a3f8c] dark:text-[#e8e6f9] group-hover:text-[#7b68ee] dark:group-hover:text-[#b3a7f9] transition-colors">
                        ABC
                      </span>
                      <p className="text-sm text-[#7b68ee] dark:text-[#b3a7f9]">
                        Uppercase letters
                      </p>
                    </div>
                  </label>

                  {/* Lowercase */}
                  <label className="flex items-center space-x-3 p-4 border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-xl hover:bg-[#f6f4ff] dark:hover:bg-[#3b315a] cursor-pointer transition-all duration-300 bg-white/50 dark:bg-[#3b315a]/50 group">
                    <input
                      type="checkbox"
                      checked={includeLowercase}
                      onChange={(e) =>
                        handleCharacterTypeChange("lowercase", e.target.checked)
                      }
                      className="h-5 w-5 text-[#7b68ee] rounded focus:ring-[#7b68ee] transition-colors"
                    />
                    <div>
                      <span className="font-bold text-[#4a3f8c] dark:text-[#e8e6f9] group-hover:text-[#7b68ee] dark:group-hover:text-[#b3a7f9] transition-colors">
                        abc
                      </span>
                      <p className="text-sm text-[#7b68ee] dark:text-[#b3a7f9]">
                        Lowercase letters
                      </p>
                    </div>
                  </label>

                  {/* Numbers */}
                  <label className="flex items-center space-x-3 p-4 border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-xl hover:bg-[#f6f4ff] dark:hover:bg-[#3b315a] cursor-pointer transition-all duration-300 bg-white/50 dark:bg-[#3b315a]/50 group">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) =>
                        handleCharacterTypeChange("numbers", e.target.checked)
                      }
                      className="h-5 w-5 text-[#7b68ee] rounded focus:ring-[#7b68ee] transition-colors"
                    />
                    <div>
                      <span className="font-bold text-[#4a3f8c] dark:text-[#e8e6f9] group-hover:text-[#7b68ee] dark:group-hover:text-[#b3a7f9] transition-colors">
                        123
                      </span>
                      <p className="text-sm text-[#7b68ee] dark:text-[#b3a7f9]">
                        Numbers
                      </p>
                    </div>
                  </label>

                  {/* Symbols */}
                  <label className="flex items-center space-x-3 p-4 border border-[#dcd6f7] dark:border-[#5a4a8a] rounded-xl hover:bg-[#f6f4ff] dark:hover:bg-[#3b315a] cursor-pointer transition-all duration-300 bg-white/50 dark:bg-[#3b315a]/50 group">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) =>
                        handleCharacterTypeChange("symbols", e.target.checked)
                      }
                      className="h-5 w-5 text-[#7b68ee] rounded focus:ring-[#7b68ee] transition-colors"
                    />
                    <div>
                      <span className="font-bold text-[#4a3f8c] dark:text-[#e8e6f9] group-hover:text-[#7b68ee] dark:group-hover:text-[#b3a7f9] transition-colors">
                        @#$%
                      </span>
                      <p className="text-sm text-[#7b68ee] dark:text-[#b3a7f9]">
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