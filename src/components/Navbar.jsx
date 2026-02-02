import React, { useState } from 'react';
import { PowerIcon, ChatBubbleOvalLeftEllipsisIcon, UserCircleIcon, Cog8ToothIcon, BellIcon } from '@heroicons/react/24/outline';


function ProfileDropdown({ username, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-white text-white rounded-full hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-800"
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <UserCircleIcon className="w-5 h-5" />
          <span className="hidden sm:inline-block">{username || 'Admin'}</span>
        </button>
      </div>


      {isOpen && (
        <div 
          className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex="-1"
        >
          <div className="py-1" role="none">
            <a 
              href="/settings" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" 
              role="menuitem"
              tabIndex="-1"
            >
              <Cog8ToothIcon className="w-5 h-5" />
          Settings
            </a>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
              role="menuitem"
              tabIndex="-1"
            >
              <PowerIcon className="w-5 h-5" />
            Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default function Navbar() {
  
  function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return (
    <header className="flex items-center justify-between bg-indigo-800 shadow-2xl px-4 sm:px-8 py-3 sticky top-0 z-10 text-white border-b-4 border-orange-400">

      <div className="flex items-center space-x-2">
        <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7 text-white" />
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
          WhatsApp <span className="text-orange-400 font-light hidden sm:inline">SaaS</span>
        </span>
      </div>
      <div className="flex items-center space-x-4">

        <button className="relative p-2 rounded-full hover:bg-indigo-700 transition-colors">
            <BellIcon className="w-6 h-6 text-white" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-indigo-800"></span>
        </button>

        <ProfileDropdown 
          username="Admin" 
          onLogout={logout} 
        />
        
      </div>
    </header>
  )
}
