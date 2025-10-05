"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Lock,
  Globe,
  FileText,
  User,
  Check,
  RefreshCw, // Added missing import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { PasswordService } from "@/services/passwordServices";
import { ThemeToggle } from "../theme-toggle";

interface PasswordItem {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  lastModified: string;
  created: string;
}

export const VaultView = () => {
  const router = useRouter();
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null);
  const [copiedUsernameId, setCopiedUsernameId] = useState<string | null>(null);
  const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch passwords from API
  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user ID - replace with your actual auth implementation
        const userId = await getCurrentUserId();

        // Fetch passwords from the API
        const response = await PasswordService.getUserPasswords(userId);
        setPasswords(response.passwords);
      } catch (error) {
        console.error("Error fetching passwords:", error);
        setError("Failed to load passwords from the server");
      } finally {
        setLoading(false);
      }
    };

    fetchPasswords();
  }, []);

  const getCurrentUserId = async (): Promise<string> => {
    const session = await authClient.getSession();
    if (!session.data?.user.id) return "";
    return session.data?.user.id; // Replace with actual user ID from your auth system
  };

  const copyUsernameToClipboard = async (username: string, id: string) => {
    try {
      await navigator.clipboard.writeText(username);
      setCopiedUsernameId(id);
      setTimeout(() => setCopiedUsernameId(null), 15000);
    } catch (err) {
      console.error("Failed to copy username: ", err);
    }
  };

  const copyPasswordToClipboard = async (password: string, id: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPasswordId(id);
      setTimeout(() => setCopiedPasswordId(null), 2000);
    } catch (err) {
      console.error("Failed to copy password: ", err);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordId(showPasswordId === id ? null : id);
  };

  const toggleNoteExpansion = (id: string) => {
    setExpandedNoteId(expandedNoteId === id ? null : id);
  };

  const filteredPasswords = passwords.filter((password) => {
    return (
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDeletePassword = async (id: string) => {
    if (confirm("Are you sure you want to delete this password?")) {
      try {
        const userId = await getCurrentUserId();
        await PasswordService.deletePassword(id, userId);

        // Remove from local state
        setPasswords(passwords.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting password:", error);
        alert("Failed to delete password");
      }
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await getCurrentUserId();
      const response = await PasswordService.getUserPasswords(userId);
      setPasswords(response.passwords);
    } catch (error) {
      console.error("Error refreshing passwords:", error);
      setError("Failed to refresh passwords");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your passwords...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex space-x-3 justify-center">
            <Button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
            <Button onClick={() => router.push("/")} variant="outline">
              Go to Generator
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Password Vault</h1>
            <p className="text-gray-600 mt-2">
              {passwords.length} password{passwords.length !== 1 ? "s" : ""}{" "}
              stored securely
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate New Password
            </Button>
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
            <ThemeToggle />
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by title, username, URL, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Passwords Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasswords.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No passwords found" : "No passwords yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "No passwords match your search. Try different keywords."
                  : "Get started by generating and saving your first password."}
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {searchTerm
                  ? "Generate New Password"
                  : "Add Your First Password"}
              </Button>
            </div>
          ) : (
            filteredPasswords.map((password) => (
              <div
                key={password.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {password.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500 flex-1">
                        <User className="h-3 w-3 mr-1" />
                        <span className="truncate">{password.username}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyUsernameToClipboard(
                            password.username,
                            password.id
                          )
                        }
                        className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                      >
                        {copiedUsernameId === password.id ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePassword(password.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* URL */}
                {password.url && (
                  <div className="mb-3">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Globe className="h-3 w-3 mr-1" />
                      <span>Website</span>
                    </div>
                    <a
                      href={password.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                    >
                      {password.url.replace("https://", "")}
                    </a>
                  </div>
                )}

                {/* Password Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 font-mono text-sm truncate group relative">
                      {showPasswordId === password.id
                        ? password.password
                        : "•".repeat(Math.min(password.password.length, 12))}
                      {/* Tooltip on hover for long passwords */}
                      {showPasswordId === password.id &&
                        password.password.length > 20 && (
                          <div className="absolute inset-0 bg-gray-50 rounded-lg px-3 py-2 hidden group-hover:block z-10 shadow-lg border">
                            {password.password}
                          </div>
                        )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      {showPasswordId === password.id ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyPasswordToClipboard(password.password, password.id)
                      }
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      {copiedPasswordId === password.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {password.notes && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <div className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>Notes</span>
                      </div>
                      {password.notes.length > 100 && (
                        <button
                          onClick={() => toggleNoteExpansion(password.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          {expandedNoteId === password.id
                            ? "Show less"
                            : "Show more"}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      {expandedNoteId === password.id
                        ? password.notes
                        : password.notes.length > 100
                        ? `${password.notes.substring(0, 100)}...`
                        : password.notes}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Modified:{" "}
                    {new Date(password.lastModified).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    Created: {new Date(password.created).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
