"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { RandomThemeToggle } from "@/components/ui/random-theme-toggle"
import { Menu, Briefcase, User, LogOut, Settings, Bell, CheckCircle2 } from "lucide-react"
import { fetchNotifications, markNotificationRead } from "@/lib/notification-api"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { useUserProfile } from "@/hooks/use-user-profile"

interface FloatingNavbarProps {
  userRole?: "USER" | "RECRUITER" | "BOTH" | null
  userName?: string
  userAvatar?: string
}

export function FloatingNavbar({ userRole: propUserRole, userName: propUserName, userAvatar: propUserAvatar }: FloatingNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const notifDropdownRef = useRef<HTMLDivElement>(null)

  // Get user from auth context
  const { user, loading, logout } = useAuth()
  
  // Use auth context data with fallback to props
  const userRole = user?.role || propUserRole
  const userName = user?.email || propUserName
  const userAvatar = propUserAvatar
  // Fetch notifications for current user
  useEffect(() => {
    if (!user?.id) return;
    setNotifLoading(true);
    fetchNotifications(user.id).then((notifs) => {
      setNotifications(notifs || []);
      setNotifLoading(false);
    });
  }, [user, notifOpen])

  // Close dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev: any) => prev.map((n: any) => n.id === id ? { ...n, read: true } : n));
  };
  
  // Get user profile data for avatar
  const { profileData } = useUserProfile()
  
  // Use profile picture from hook if available, otherwise fall back to prop
  const displayAvatar = profileData?.profilePic || userAvatar || "/placeholder.svg"

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const userNavItems = [
    { href: "/user/dashboard", label: "Dashboard" },
    { href: "/user/applications", label: "My Applications" },
    { href: "/user/profile", label: "Profile" },
  ]

  const recruiterNavItems = [
    { href: "/recruiter/dashboard", label: "Dashboard" },
    { href: "/recruiter/applications", label: "Applications" },
    { href: "/recruiter/profile", label: "Profile" },
  ]

  // Determine which navigation to show based on current route for BOTH role
  const getNavItems = () => {
    if (userRole === "BOTH") {
      // Show appropriate nav based on current route
      if (pathname.startsWith("/recruiter")) {
        return recruiterNavItems
      } else {
        return userNavItems
      }
    }
    return userRole === "USER" ? userNavItems : recruiterNavItems
  }

  const navItems = getNavItems()

  const NavContent = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-medium transition-all duration-200 hover:text-primary relative ${
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => setIsOpen(false)}
        >
          {item.label}
          {pathname === item.href && (
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
              layoutId="activeTab"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </Link>
      ))}
    </>
  )

  if (loading) {
    // Show a loading state while auth is being determined
    return (
      <motion.nav
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg" : "bg-transparent"
        } rounded-2xl`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <Briefcase className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              CampusCogni
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <RandomThemeToggle />
            <div className="w-16 h-8 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
      </motion.nav>
    )
  }

  if (!user || !userRole) {
    return (
      <motion.nav
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg" : "bg-transparent"
        } rounded-2xl`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <Briefcase className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              CampusCogni
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <RandomThemeToggle />
            <Button asChild variant="ghost" className="hover:bg-muted/50">
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </motion.nav>
    )
  }

  return (
    <motion.nav
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg"
          : "bg-background/60 backdrop-blur-md border border-border/30"
      } rounded-2xl`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <Briefcase className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              CampusCogni
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <NavContent />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <RandomThemeToggle />

          {/* Notification Bell and Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <Button variant="ghost" size="icon" className="relative hover:bg-muted/50" onClick={() => setNotifOpen((v) => !v)}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 bg-background border border-border/50 rounded-xl shadow-xl z-50 overflow-y-auto animate-in fade-in slide-in-from-top-2 p-2">
                <div className="font-semibold text-base px-2 py-1">Notifications</div>
                {notifLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No notifications</div>
                ) : (
                  notifications.map((notif: any) => (
                    <div key={notif.id} className={`flex items-start gap-2 px-2 py-2 rounded-lg mb-1 ${notif.read ? 'bg-muted/30' : 'bg-primary/10'}`}>
                      <div className="flex-shrink-0 pt-1">
                        {notif.read ? <CheckCircle2 className="h-5 w-5 text-muted-foreground" /> : <Bell className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{notif.title}</div>
                        <div className="text-xs text-muted-foreground">{notif.message}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                      </div>
                      {!notif.read && (
                        <button className="ml-2 text-xs text-primary underline" onClick={() => handleMarkRead(notif.id)}>Mark as read</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={displayAvatar} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {userName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-background/95 backdrop-blur-xl border-border/50"
              align="end"
              forceMount
            >
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{userName}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {userRole === "BOTH" 
                      ? (pathname.startsWith("/recruiter") ? "Recruiter Mode" : "Student Mode")
                      : userRole === "USER" ? "Student" : "Recruiter"}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              
              {/* Role Switcher for users with BOTH roles */}
              {userRole === "BOTH" && (
                <>
                  {/* Show Switch to Student Mode only when in recruiter context */}
                  {pathname.startsWith("/recruiter") && (
                    <DropdownMenuItem asChild>
                      <Link href="/user/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Switch to Student Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* Show Switch to Recruiter Mode only when in user context */}
                  {!pathname.startsWith("/recruiter") && (
                    <DropdownMenuItem asChild>
                      <Link href="/recruiter/dashboard">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Switch to Recruiter Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem asChild>
                <Link href={userRole === "BOTH" 
                  ? (pathname.startsWith("/recruiter") ? "/recruiter/profile" : "/user/profile")
                  : userRole === "USER" ? "/user/profile" : "/recruiter/profile"}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-muted/50">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl">
              <div className="flex flex-col space-y-6 mt-8">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  )
}

export default FloatingNavbar;