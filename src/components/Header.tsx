import React from 'react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-white via-yellow-50 to-white shadow-lg border-b-2 border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-6">
            <div className="flex items-center justify-center p-2 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg transform hover:scale-105 transition-transform duration-200">
              <img 
                src="https://toyegzbckmtrvnfxbign.supabase.co/storage/v1/object/public/branding/logo.png" 
                alt="Alpha Logo" 
                className="w-14 h-14 object-contain drop-shadow-lg"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                LionChat
              </h1>
              <p className="text-sm text-gray-600 font-semibold tracking-wide">
                Assessoria Alpha
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="px-4 py-2 bg-yellow-100 rounded-full border border-yellow-200">
              <span className="text-sm font-medium text-yellow-800">WhatsApp Business</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
}