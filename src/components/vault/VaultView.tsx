"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
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
  Shield,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { PasswordService } from "@/services/passwordServices";
import { ThemeToggle } from "../theme-toggle";
import { SearchBar } from "./SearchBar";
import { getAccountProvider } from "@/services/accountServices";

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

interface VaultViewProps {
  userId: string,
  twoFactorEnabled: boolean
}

interface EditFormData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export const VaultView = ({userId, twoFactorEnabled}: VaultViewProps) => {
  const router = useRouter();
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null);
  const [copiedUsernameId, setCopiedUsernameId] = useState<string | null>(null);
  const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [show2FA, setShow2FA] = useState(false);
  useEffect(() => {
    const fun = async () => {
      const provider = await getAccountProvider(userId);
      if (provider == "credential" && !twoFactorEnabled) {
        setShow2FA(true);
      }
    };
    fun();
  }, [userId, twoFactorEnabled]);

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = await getCurrentUserId();

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
    return session.data?.user.id;
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

  const startEditing = (password: PasswordItem) => {
    setEditingId(password.id);
    setEditFormData({
      title: password.title,
      username: password.username,
      password: password.password,
      url: password.url || "",
      notes: password.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({
      title: "",
      username: "",
      password: "",
      url: "",
      notes: "",
    });
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdatePassword = async (id: string) => {
    if (!editFormData.title.trim() || !editFormData.username.trim()) {
      alert("Title and username are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const userId = await getCurrentUserId();
      
      const updatedPassword = await PasswordService.updatePassword(id, userId, {
        title: editFormData.title,
        username: editFormData.username,
        password: editFormData.password,
        url: editFormData.url || undefined,
        notes: editFormData.notes || undefined,
      });

      // Update local state
      setPasswords(prev => prev.map(p => 
        p.id === id ? { ...p, ...updatedPassword } : p
      ));

      setEditingId(null);
      setEditFormData({
        title: "",
        username: "",
        password: "",
        url: "",
        notes: "",
      });

    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
          <p className="mt-4">Loading your passwords...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex space-x-3 justify-center">
            <Button onClick={handleRefresh}>Try Again</Button>
            <Button onClick={() => router.push("/")} variant="outline">
              Go to Generator
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-900 p-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Password Vault
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 font-medium">
                {passwords.length} password{passwords.length !== 1 ? "s" : ""}{" "}
                stored securely
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <ThemeToggle />

            {show2FA && (
              <Button 
                onClick={() => router.push("/2fa/enable")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"  
              >
                Enable 2FA
              </Button>
            )}

            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate New
            </Button>

            <Button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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

        {/* Search */}
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Passwords Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasswords.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl inline-block mb-6">
                <Lock className="h-16 w-16 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                {searchTerm ? "No passwords found" : "Your vault is empty"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto text-lg">
                {searchTerm
                  ? "Try adjusting your search terms or generate a new password."
                  : "Start securing your digital life by generating and storing your first password."}
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {searchTerm ? "Generate Password" : "Create First Password"}
              </Button>
            </div>
          ) : (
            filteredPasswords.map((password) => (
              <div
                key={password.id}
                className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-blue-200 dark:hover:border-blue-800"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl">
                        <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      {editingId === password.id ? (
                        <Input
                          value={editFormData.title}
                          onChange={(e) => handleEditFormChange("title", e.target.value)}
                          className="font-bold text-lg border-blue-200 focus:border-blue-500"
                          placeholder="Title"
                        />
                      ) : (
                        <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-tight">
                          {password.title}
                        </h3>
                      )}
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      {editingId === password.id ? (
                        <Input
                          value={editFormData.username}
                          onChange={(e) => handleEditFormChange("username", e.target.value)}
                          className="flex-1 border-blue-200 focus:border-blue-500"
                          placeholder="Username/Email"
                        />
                      ) : (
                        <>
                          <div className="flex items-center text-gray-600 dark:text-gray-300 flex-1">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="truncate font-medium">
                              {password.username}
                            </span>
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
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors rounded-lg"
                          >
                            {copiedUsernameId === password.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    {editingId === password.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdatePassword(password.id)}
                          disabled={isSubmitting}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors rounded-lg"
                        >
                          {isSubmitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(password)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors rounded-lg"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePassword(password.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* URL */}
                {editingId === password.id ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website URL
                    </label>
                    <Input
                      value={editFormData.url}
                      onChange={(e) => handleEditFormChange("url", e.target.value)}
                      placeholder="https://example.com"
                      className="w-full border-blue-200 focus:border-blue-500"
                    />
                  </div>
                ) : password.url && (
                  <div className="mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <Globe className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">Website</span>
                    </div>
                    <a
                      href={password.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 transition-colors font-medium"
                    >
                      {password.url.replace(/(^\w+:|^)\/\//, "")}
                    </a>
                  </div>
                )}

                {/* Password Field */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Password
                  </label>
                  <div className="flex items-center space-x-2">
                    {editingId === password.id ? (
                      <Input
                        type="text"
                        value={editFormData.password}
                        onChange={(e) => handleEditFormChange("password", e.target.value)}
                        className="flex-1 font-mono border-blue-200 focus:border-blue-500"
                        placeholder="Password"
                      />
                    ) : (
                      <div className="flex-1 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl px-4 py-3 font-mono text-sm border border-gray-200 dark:border-gray-600 overflow-x-auto scrollbar-hide">
                        {showPasswordId === password.id
                          ? password.password
                          : "•".repeat(Math.min(password.password.length, 12))}
                      </div>
                    )}
                    <div className="flex space-x-1">
                      {editingId !== password.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(password.id)}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors rounded-lg"
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
                              copyPasswordToClipboard(
                                password.password,
                                password.id
                              )
                            }
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors rounded-lg"
                          >
                            {copiedPasswordId === password.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {editingId === password.id ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => handleEditFormChange("notes", e.target.value)}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 bg-transparent"
                    />
                  </div>
                ) : password.notes && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 mb-2">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="font-medium">Notes</span>
                      </div>
                      {password.notes.length > 100 && (
                        <button
                          onClick={() => toggleNoteExpansion(password.id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                          {expandedNoteId === password.id
                            ? "Show less"
                            : "Show more"}
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800/30">
                      {expandedNoteId === password.id
                        ? password.notes
                        : password.notes.length > 100
                        ? `${password.notes.substring(0, 100)}...`
                        : password.notes}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Modified:{" "}
                    {new Date(password.lastModified).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
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