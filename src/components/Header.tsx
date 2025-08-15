import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center">
              <img 
                src="https://toyegzbckmtrvnfxbign.supabase.co/storage/v1/object/public/branding/logo.png" 
                alt="Alpha Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-yellow-600">LionChat</h1>
              <p className="text-sm text-gray-600 font-medium">Assessoria Alpha</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}