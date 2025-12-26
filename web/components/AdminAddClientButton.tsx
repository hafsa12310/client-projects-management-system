"use client";

import React from "react";
import { Plus } from "lucide-react";

interface AdminAddClientButtonProps {
  onClick?: () => void;
}

export function AdminAddClientButton({ onClick }: AdminAddClientButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 z-50 flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-200"
      aria-label="Add Client"
    
    >
      <Plus size={20} />
      <span className="font-medium">Add Client</span>
    </button>
  );
}
