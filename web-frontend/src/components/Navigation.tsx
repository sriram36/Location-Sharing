"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bus,
  Users,
  MapPin,
  Settings,
  LogOut,
  Menu,
  Home,
  UserCheck,
  Route,
  UserPlus
} from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  // Hold the client in a ref so it's only created after mount (browser-only)
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabaseRef.current = supabase;

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          setUser(userProfile);
        }
      }
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: { user: { id: string } } | null) => {
        if (!session) {
          setUser(null);
          router.push('/');
        } else {
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userProfile) {
            setUser(userProfile);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const supabase = supabaseRef.current ?? createSupabaseClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      {
        href: `/${user.role}/dashboard`,
        label: 'Dashboard',
        icon: Home,
        active: pathname === `/${user.role}/dashboard`
      }
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { href: '/admin/dashboard/users', label: 'Users', icon: Users, active: pathname === '/admin/dashboard/users' },
          { href: '/admin/dashboard/buses', label: 'Buses', icon: Bus, active: pathname === '/admin/dashboard/buses' },
          { href: '/admin/dashboard/routes', label: 'Routes', icon: Route, active: pathname === '/admin/dashboard/routes' },
          { href: '/admin/dashboard/assignments', label: 'Assignments', icon: UserPlus, active: pathname === '/admin/dashboard/assignments' }
        ];
      case 'parent':
        return [
          ...baseItems,
          { href: '/parent/dashboard/tracking', label: 'Track Bus', icon: MapPin, active: pathname === '/parent/dashboard/tracking' }
        ];
      case 'driver':
        return [
          ...baseItems,
          { href: '/driver/dashboard/location', label: 'Share Location', icon: MapPin, active: pathname === '/driver/dashboard/location' }
        ];
      default:
        return baseItems;
    }
  };

  if (isLoading || !user) {
    return null;
  }

  const navigationItems = getNavigationItems();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bus className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">Bus Tracker</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={item.active ? "default" : "ghost"}
                  onClick={() => router.push(item.href)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span className="hidden md:inline">
                    {user.full_name || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <Bus className="h-5 w-5 text-blue-600" />
                    <span>Navigation</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.href}
                        variant={item.active ? "default" : "ghost"}
                        onClick={() => router.push(item.href)}
                        className="w-full justify-start flex items-center space-x-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
