import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  File,
  Settings,
  ChevronRight,
  ChevronDown,
  History,
  Newspaper,
  Users,
  UserCircle,
  MessageSquare,
  Award
} from 'lucide-react';

// Type definition for menu items
type MenuItemType = {
  label: string;
  path: string;
  icon: React.ElementType;
  submenu?: MenuItemType[];
};

// Define menu items
const menuItems: MenuItemType[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home
  },
  {
    label: 'Cases',
    path: '/cases',
    icon: File
  },
  {
    label: 'Chat',
    path: '/chat',
    icon: MessageSquare
  },
  {
    label: 'Friends',
    path: '/friends',
    icon: Users
  },
  {
    label: 'History',
    path: '/history',
    icon: History
  },
  {
    label: 'Badges',
    path: '/badges',
    icon: Award
  },
  {
    label: 'News',
    path: '/news',
    icon: Newspaper
  }
];

// Bottom menu items
const bottomItems: MenuItemType[] = [
  {
    label: 'Profile',
    path: '/profile/edit',
    icon: UserCircle
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings
  }
];

// Utility styles
const menuButtonStyles = {
  base: 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-hover',
  active: 'bg-sidebar-hover text-sidebar-foreground-active',
  inactive: 'text-sidebar-foreground'
};

export function Sidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Menu": true,
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItemType, depth = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isOpen = openMenus[item.label];
    const active = isActive(item.path);

    return (
      <li key={item.label} className={cn("animate-fade-in", { "mb-1": depth === 0 })}>
        {hasSubmenu ? (
          <>
            <button
              className={cn("menu-button", { "menu-button-active": active })}
              onClick={() => toggleMenu(item.label)}
            >
              <item.icon className="menu-icon" />
              <span className="menu-text">{item.label}</span>
              {isOpen ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </button>
            {isOpen && (
              <ul className={cn("ml-6 mt-1 space-y-1 animate-slide-in")}>
                {item.submenu.map((subItem) => renderMenuItem(subItem, depth + 1))}
              </ul>
            )}
          </>
        ) : (
          <Link
            to={item.path}
            className={cn("menu-button", { "menu-button-active": active })}
          >
            <item.icon className="menu-icon" />
            <span className="menu-text">{item.label}</span>
          </Link>
        )}
      </li>
    );
  };

  return (
    <div className="w-[18.75%] h-screen border-r bg-sidebar shadow-sm flex flex-col overflow-hidden">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <h1 className="font-bold text-xl text-balance">ECHO</h1>
        </Link>
      </div>
      
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-none">
        <ul className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>
      
      <div className="border-t p-3">
        <ul className="space-y-1">
          {bottomItems.map((item) => renderMenuItem(item))}
        </ul>
      </div>
    </div>
  );
}