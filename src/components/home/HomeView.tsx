"use client";

import { authClient } from "@/lib/auth-client"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"

export const HomeView = () => {
    const router = useRouter();
    
    // State for password generator
    const [password, setPassword] = useState("");
    const [length, setLength] = useState(12);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeLetters, setIncludeLetters] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(false);
    const [excludeLookAlikes, setExcludeLookAlikes] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    // Character sets
    const numbers = "0123456789";
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const lookAlikes = "0Oo1lI";

    // Generate password function
    const generatePassword = useCallback(() => {
        let charset = "";
        
        if (includeNumbers) charset += numbers;
        if (includeLetters) charset += letters;
        if (includeSymbols) charset += symbols;
        
        // Remove look-alikes if needed
        if (excludeLookAlikes) {
            for (const char of lookAlikes) {
                charset = charset.replace(char, '');
            }
        }
        
        // Ensure at least one character type is selected
        if (charset.length === 0) {
            setPassword("Select at least one character type");
            return;
        }
        
        let newPassword = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            newPassword += charset[randomIndex];
        }
        
        setPassword(newPassword);
        setIsCopied(false);
    }, [length, includeNumbers, includeLetters, includeSymbols, excludeLookAlikes]);

    // Copy to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(password).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
            {/* Header with Sign Out Button */}
            <div className="w-full max-w-md flex justify-end mb-4">
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
            
            {/* Password Generator Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    Password Generator
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Create strong and secure passwords
                </p>
                
                {/* Password Display */}
                <div className="mb-6">
                    <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex-1 overflow-hidden">
                            <p className="text-lg font-mono truncate">
                                {password || "Your password will appear here"}
                            </p>
                        </div>
                        <Button
                            onClick={copyToClipboard}
                            disabled={!password}
                            className={`ml-2 ${isCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                        >
                            {isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                    </div>
                </div>
                
                {/* Length Slider */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-gray-700 font-medium">
                            Password Length: <span className="text-blue-600">{length}</span>
                        </label>
                    </div>
                    <input
                        type="range"
                        min="6"
                        max="30"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>6</span>
                        <span>30</span>
                    </div>
                </div>
                
                {/* Character Options */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="includeNumbers"
                            checked={includeNumbers}
                            onChange={(e) => setIncludeNumbers(e.target.checked)}
                            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="includeNumbers" className="ml-2 text-gray-700">
                            Include Numbers (0-9)
                        </label>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="includeLetters"
                            checked={includeLetters}
                            onChange={(e) => setIncludeLetters(e.target.checked)}
                            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="includeLetters" className="ml-2 text-gray-700">
                            Include Letters (a-z, A-Z)
                        </label>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="includeSymbols"
                            checked={includeSymbols}
                            onChange={(e) => setIncludeSymbols(e.target.checked)}
                            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="includeSymbols" className="ml-2 text-gray-700">
                            Include Symbols (!@#$%^&*)
                        </label>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="excludeLookAlikes"
                            checked={excludeLookAlikes}
                            onChange={(e) => setExcludeLookAlikes(e.target.checked)}
                            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="excludeLookAlikes" className="ml-2 text-gray-700">
                            Exclude Look-alikes (0, O, 1, l, I)
                        </label>
                    </div>
                </div>
                
                {/* Generate Button */}
                <Button
                    onClick={generatePassword}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-lg"
                >
                    Generate Password
                </Button>
                
                {/* Password Strength Indicator */}
                <div className="mt-6">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Password Strength</span>
                        <span className="text-sm font-medium text-gray-700">
                            {password.length < 8 ? "Weak" : 
                             password.length < 12 ? "Medium" : 
                             password.length < 16 ? "Strong" : "Very Strong"}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full ${
                                password.length < 8 ? "bg-red-500 w-1/4" : 
                                password.length < 12 ? "bg-yellow-500 w-1/2" : 
                                password.length < 16 ? "bg-blue-500 w-3/4" : "bg-green-500 w-full"
                            }`}
                        ></div>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <div className="mt-6 text-center text-gray-500 text-sm">
                <p>Keep your passwords safe and secure</p>
            </div>
        </div>
    );
}