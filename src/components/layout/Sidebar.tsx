
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, LayoutGrid, History, Settings, LogOut, Plus, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItemType = {
  icon: React.ElementType;
  label: string;
  path: string;
  submenu?: MenuItemType[];
};

const menuItems: MenuItemType[] = [
  {
    icon: LayoutGrid,
    label: "Menu",
    path: "#",
    submenu: [
      {
        icon: LayoutGrid,
        label: "Cases",
        path: "/",
      },
      {
        icon: Newspaper,
        label: "News",
        path: "/news",
      },
      {
        icon: History,
        label: "History",
        path: "/history",
      },
    ],
  },
];

const bottomItems: MenuItemType[] = [
  {
    icon: Plus,
    label: "Create Case",
    path: "/create-case",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
  {
    icon: LogOut,
    label: "Sign Out",
    path: "#",
  },
];

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
