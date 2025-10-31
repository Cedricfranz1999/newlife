"use client";
import Image from "next/image";
import Link from "next/link";
import { CircleUser, Menu, Users, LayoutDashboard } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { DialogTitle } from "~/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAdminStore } from "~/app/store/adminStore";
import { Label } from "~/components/ui/label";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const username = useAdminStore((state) => state.username);
  const clearUsername = useAdminStore((state) => state.logout);

  const handleLogout = () => {
    clearUsername();
    router.push("/sign-in");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:h-[60px] lg:px-6">
      {/* Left Section (Menu + Logo) */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle (mobile only) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-gray-300 text-gray-700 hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>

          {/* Mobile drawer */}
          <SheetContent side="left" className="flex flex-col bg-white">
            <VisuallyHidden>
              <DialogTitle>Navigation Menu</DialogTitle>
            </VisuallyHidden>

            <nav className="grid gap-2 text-base font-medium">
              {/* Logo and title in mobile drawer */}
              <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-4">
                <Image
                  src="/logo.png"
                  alt="NLCM Logo"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
                <Label className="text-2xl font-bold text-[#267959]">NLCM</Label>
              </div>

              {[
                {
                  href: "/admin/dashboard",
                  icon: <LayoutDashboard className="h-5 w-5" />,
                  label: "Dashboard",
                },
                {
                  href: "/admin/users",
                  icon: <Users className="h-5 w-5" />,
                  label: "Users",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-gray-700 transition-all hover:bg-[#267959] hover:text-white"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Show logo + NLCM only in mobile view */}
        <div className="flex items-center gap-2 md:hidden">
          <Image
            src="/logo.png"
            alt="NLCM Logo"
            width={32}
            height={32}
            className="rounded-md"
          />
          <Label className="text-xl font-bold text-[#267959]">NLCM</Label>
        </div>
      </div>

      {/* Right Section (User menu) */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-2 border-[#267959] bg-white text-[#267959] hover:bg-[#267959] hover:text-white"
            >
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <DropdownMenuLabel className="text-sm">
              <div className="flex items-center justify-start gap-2 text-gray-700">
                <CircleUser size={16} className="text-[#267959]" />
                <Label className="font-medium">{username}</Label>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem
              className="cursor-pointer text-gray-700 hover:bg-[#267959] hover:text-white focus:bg-[#267959] focus:text-white"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
