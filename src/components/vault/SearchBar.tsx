"use client"

import { Search } from "lucide-react"
import { Input } from "../ui/input"

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchBar = ({ searchTerm,setSearchTerm }: SearchBarProps) => {
    return(
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50 mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by title, username, URL, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 w-full bg-transparent border-blue-200 dark:border-blue-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 rounded-xl"
            />
          </div>
        </div>
    )
}