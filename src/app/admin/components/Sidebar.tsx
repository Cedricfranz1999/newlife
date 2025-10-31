"use client";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Users } from "lucide-react";
import { Label } from "~/components/ui/label";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="hidden border-r border-gray-200 bg-white md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* Header */}
        <div className="flex h-14 items-center border-b border-gray-200 px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="NLCM Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <Label className="text-2xl font-bold text-[#267959]">NLCM</Label>
          </Link>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex-1">
          <nav className="grid items-start gap-2 px-3 text-sm font-medium lg:px-4">
            {/* Dashboard */}
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                isActive("/admin/dashboard")
                  ? "bg-[#267959] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>

            {/* Users */}
            <Link
              href="/admin/users"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                isActive("/admin/users")
                  ? "bg-[#267959] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="h-5 w-5" />
              Users
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
