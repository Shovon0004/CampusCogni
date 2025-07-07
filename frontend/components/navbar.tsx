"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
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
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, Briefcase, User, LogOut, Settings, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NavbarProps {
  userRole?: "student" | "recruiter" | null
  userName?: string
  userAvatar?: string
}

export function Navbar({ userRole, userName, userAvatar }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    // Mock logout - redirect to home
    router.push("/")
  }

  const studentNavItems = [
    { href: "/student/dashboard", label: "Dashboard" },
    { href: "/student/applications", label: "My Applications" },
    { href: "/student/profile", label: "Profile" },
  ]

  const recruiterNavItems = [
    { href: "/recruiter/dashboard", label: "Dashboard" },
    { href: "/recruiter/post-job", label: "Post Job" },
    { href: "/recruiter/applications", label: "Applications" },
  ]

  const navItems = userRole === "student" ? studentNavItems : recruiterNavItems

  const NavContent = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => setIsOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </>
  )

  if (!userRole) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6" />
            <span className="font-bold text-xl">CampusCogni</span>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6" />
            <span className="font-bold text-xl">CampusCogni</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <NavContent />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
                  <AvatarFallback>{userName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{userName}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {userRole === "student" ? "Student" : "Recruiter"}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${userRole}/profile`}>
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
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-6">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
