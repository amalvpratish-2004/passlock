import { Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SaveFormProps {
    closeSaveModal: () => void;
    saveData: {
        title: string;
        username: string;
        url?: string;
        notes?: string;
    };
    isSaving: boolean;
    handleSaveDataChange: (field: keyof SaveFormProps['saveData'], value: string) => void;
    handleSavePassword: () => void;
    password: string;
}

export const SaveForm = ({
    closeSaveModal,
    saveData,
    isSaving,
    handleSaveDataChange,
    handleSavePassword,
    password
}: SaveFormProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-fade-in border border-white/20 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Save Password
          </h3>
          <Button
            onClick={closeSaveModal}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <Input
              type="text"
              value={saveData.title}
              onChange={(e) => handleSaveDataChange("title", e.target.value)}
              placeholder="e.g., Gmail Account"
              className="w-full bg-transparent border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username/Email *
            </label>
            <Input
              type="text"
              value={saveData.username}
              onChange={(e) => handleSaveDataChange("username", e.target.value)}
              placeholder="e.g., john.doe@gmail.com"
              className="w-full bg-transparent border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL
            </label>
            <Input
              type="url"
              value={saveData.url || ""}
              onChange={(e) => handleSaveDataChange("url", e.target.value)}
              placeholder="e.g., https://gmail.com"
              className="w-full bg-transparent border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={saveData.notes || ""}
              onChange={(e) => handleSaveDataChange("notes", e.target.value)}
              placeholder="Additional notes about this password..."
              rows={3}
              className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
            />
          </div>

          {/* Generated Password Preview */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Generated Password
            </label>
            <div className="font-mono text-sm bg-white/50 dark:bg-gray-600/50 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-500 break-all text-gray-800 dark:text-gray-200">
              {password}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={closeSaveModal}
            variant="outline"
            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePassword}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
  );
};