
import { useState } from "react";
<<<<<<< HEAD
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, LayoutGrid, History, Settings, LogOut, Plus, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
=======
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, LayoutGrid, History, Settings, LogOut, Plus, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
>>>>>>> 6c63f50 (sign in)

type MenuItemType = {
  icon: React.ElementType;
  label: string;
  path: string;
  submenu?: MenuItemType[];
};

const menuItems: MenuItemType[] = [
  {
    icon: LayoutGrid,
<<<<<<< HEAD
=======
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: LayoutGrid,
>>>>>>> 6c63f50 (sign in)
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
<<<<<<< HEAD
=======
  const navigate = useNavigate();
>>>>>>> 6c63f50 (sign in)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Menu": true,
  });

<<<<<<< HEAD
=======
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

>>>>>>> 6c63f50 (sign in)
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
<<<<<<< HEAD
      <li key={item.label} className={cn("animate-fade-in", { "mb-1": depth === 0 })}>
        {hasSubmenu ? (
          <>
            <button
              className={cn("menu-button", { "menu-button-active": active })}
              onClick={() => toggleMenu(item.label)}
=======
      <li key={item.label}>
        {hasSubmenu ? (
          <>
            <button
              onClick={() => toggleMenu(item.label)}
              className={cn("menu-button", { "menu-button-active": active })}
>>>>>>> 6c63f50 (sign in)
            >
              <item.icon className="menu-icon" />
              <span className="menu-text">{item.label}</span>
              {isOpen ? (
<<<<<<< HEAD
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </button>
            {isOpen && (
              <ul className={cn("ml-6 mt-1 space-y-1 animate-slide-in")}>
=======
                <ChevronDown className="menu-chevron" />
              ) : (
                <ChevronRight className="menu-chevron" />
              )}
            </button>
            {isOpen && (
              <ul className="pl-4 space-y-1">
>>>>>>> 6c63f50 (sign in)
                {item.submenu.map((subItem) => renderMenuItem(subItem, depth + 1))}
              </ul>
            )}
          </>
        ) : (
<<<<<<< HEAD
          <Link
            to={item.path}
            className={cn("menu-button", { "menu-button-active": active })}
          >
            <item.icon className="menu-icon" />
            <span className="menu-text">{item.label}</span>
          </Link>
=======
          item.label === "Sign Out" ? (
            <button
              onClick={handleSignOut}
              className={cn("menu-button", { "menu-button-active": active })}
            >
              <item.icon className="menu-icon" />
              <span className="menu-text">{item.label}</span>
            </button>
          ) : (
            <Link
              to={item.path}
              className={cn("menu-button", { "menu-button-active": active })}
            >
              <item.icon className="menu-icon" />
              <span className="menu-text">{item.label}</span>
            </Link>
          )
>>>>>>> 6c63f50 (sign in)
        )}
      </li>
    );
  };

  return (
<<<<<<< HEAD
    <div className="w-[18.75%] h-screen border-r bg-sidebar shadow-sm flex flex-col overflow-hidden">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <h1 className="font-bold text-xl text-balance">ECHO</h1>
=======
    <div className="w-[18.75%] h-screen border-r border-slate-700/20 bg-slate-900/80 backdrop-blur-md shadow-sm flex flex-col overflow-hidden">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <h1 className="font-bold text-xl text-slate-100">NetZero</h1>
>>>>>>> 6c63f50 (sign in)
        </Link>
      </div>
      
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-none">
        <ul className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>
      
<<<<<<< HEAD
      <div className="border-t p-3">
=======
      <div className="border-t border-slate-700/20 p-3">
>>>>>>> 6c63f50 (sign in)
        <ul className="space-y-1">
          {bottomItems.map((item) => renderMenuItem(item))}
        </ul>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======




>>>>>>> 6c63f50 (sign in)
