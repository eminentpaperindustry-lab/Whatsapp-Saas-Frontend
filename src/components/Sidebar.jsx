import React from 'react';
import { NavLink } from 'react-router-dom';
// Import professional icons for a modern look
import { 
  LayoutDashboard, Users, Send, FileText, BarChart2, MessageSquare, Menu 
} from 'lucide-react';

// Define the navigation items data
const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/contacts", icon: Users, label: "Contacts" },
  { to: "/campaigns", icon: Send, label: "Campaigns" },
  { to: "/templates", icon: FileText, label: "Templates" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/whatsapp", icon: MessageSquare, label: "WhatsApp" },
];

/**
 * Single Nav Item Component with Icons and significantly larger font/icon size.
 */
function NavItem({ to, children, Icon }) {
  return (
    <NavLink
      to={to}
      // Use Tailwind's group utility and transition for smoothness
      className={({ isActive }) => 
        `group flex items-center gap-4 px-5 py-3 font-semibold text-lg 
         rounded-xl transition-all duration-300 ease-in-out 
         ${isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50' // Active: High-impact Blue block with shadow
          : 'text-gray-300 hover:bg-gray-800 hover:text-white' // Inactive: Rich dark hover
        }`
      }
    >
      {/* Icon Component: Increased size to w-6 h-6 */}
      <Icon className="w-6 h-6 opacity-90 group-hover:text-white transition-colors" />
      {/* Label: Increased text size to text-lg */}
      {children}
    </NavLink>
  );
}

/**
 * Main Sidebar Component
 */
export default function Sidebar() {
  return (
    // Theme: Rich Dark Gray (bg-gray-900)
    <aside className="w-64 bg-gray-900 min-h-screen text-gray-300 flex flex-col shadow-2xl">
      
      {/* Header/Branding Area - Height h-24 for professional vertical spacing */}
      <div className="flex items-center p-6 h-24 border-b border-gray-800">
          <Menu className="w-7 h-7 mr-3 text-blue-500" />
          <span className="text-3xl font-black text-white tracking-widest">WA <span className="text-blue-500">SaaS</span></span>
      </div>

      {/* Navigation Links - Increased padding (p-4) and spacing (space-y-3) */}
      <nav className="p-4 flex-grow space-y-3">
        {navItems.map((item) => (
          <NavItem key={item.to} to={item.to} Icon={item.icon}>
            {item.label}
          </NavItem>
        ))}
      </nav>

      {/* Optional: Footer area for version/user info */}
      <div className="p-6 text-xs text-gray-500 border-t border-gray-800">
        <p className='font-medium'>Version 4.0 (Premium)</p>
        <p>All Rights Reserved © 2024</p>
      </div>

    </aside>
  );
}
