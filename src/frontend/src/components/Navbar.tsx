import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Settings, Shield, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useIsCallerAdmin,
  useListProducts,
} from "../hooks/useQueries";

export default function Navbar() {
  const { data: products } = useListProducts();
  const count = products?.length ?? 0;
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const handleLogin = async () => {
    try {
      await login();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const initials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <nav className="nav-dark sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-teal/20 flex items-center justify-center ring-1 ring-teal/30 group-hover:bg-teal/30 transition-colors">
              <Shield className="w-5 h-5 text-teal" />
            </div>
            <span className="text-white font-display font-bold text-lg tracking-tight">
              VeriProduct
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Home", to: "/" },
              { label: "Verify", to: "/" },
              { label: "History", to: "/" },
              { label: "About", to: "/" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                data-ocid={`nav.${item.label.toLowerCase()}.link`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                data-ocid="nav.admin.link"
                className="text-sm font-medium text-teal hover:text-teal/80 transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {count > 0 && (
              <Badge
                variant="outline"
                className="hidden sm:flex items-center gap-1.5 border-teal/30 text-teal bg-teal/10 text-xs px-2.5 py-0.5"
              >
                <Shield className="w-3 h-3" />
                {count.toLocaleString()} Protected
              </Badge>
            )}

            {/* Auth area */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-ocid="nav.user_menu.button"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[10px] bg-teal/20 text-teal font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white/90 hidden sm:block max-w-[120px] truncate">
                      {userProfile?.name ?? "User"}
                    </span>
                    {isAdmin && (
                      <Badge className="text-[9px] px-1.5 py-0 bg-amber-500/20 text-amber-400 border-amber-500/30 border hidden sm:block">
                        Admin
                      </Badge>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-gray-900 border-white/10"
                  data-ocid="nav.user.dropdown_menu"
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-white">
                      {userProfile?.name ?? "User"}
                    </p>
                    <p className="text-xs text-white/50">
                      {isAdmin ? "Administrator" : "Verified User"}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {isAdmin && (
                    <DropdownMenuItem
                      asChild
                      className="text-white/80 hover:text-white focus:text-white cursor-pointer"
                    >
                      <Link to="/admin" data-ocid="nav.admin_panel.link">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    data-ocid="nav.logout.button"
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                data-ocid="nav.login.button"
                size="sm"
                className="bg-teal/20 hover:bg-teal/30 text-teal border border-teal/30 rounded-full px-4"
                variant="ghost"
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                <LogIn className="w-4 h-4 mr-1" />
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            )}

            {/* Admin link for non-logged-in users */}
            {!isAuthenticated && (
              <Link to="/admin">
                <Button
                  data-ocid="nav.admin_login.button"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-4"
                  variant="ghost"
                >
                  <User className="w-4 h-4 mr-1" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
