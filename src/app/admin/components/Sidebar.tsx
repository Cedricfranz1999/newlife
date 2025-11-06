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
    <div className="hidden border-r bg-[#267959] md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b border-white px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="NLCM Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <Label className="text-2xl font-bold text-white">NLCM</Label>
          </Link>
        </div>

        <div className="mt-6 flex-1">
          <nav className="grid items-start gap-2 px-3 text-sm font-medium lg:px-4">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                isActive("/admin/dashboard")
                  ? "bg-white text-[#267959] shadow-sm"
                  : "text-gray-200 hover:bg-white hover:text-[#267959]"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/admin/users"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                isActive("/admin/users")
                  ? "bg-white text-[#267959] shadow-sm"
                  : "text-gray-200 hover:bg-white hover:text-[#267959]"
              }`}
            >
              <Users className="h-5 w-5" />
              Users
            </Link>

            <Link
              href="/admin/attendance"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                isActive("/admin/attendance")
                  ? "bg-white text-[#267959] shadow-sm"
                  : "text-gray-200 hover:bg-white hover:text-[#267959]"
              }`}
            >
              <Users className="h-5 w-5" />
              Attendance
            </Link>

            <Link
              href="/admin/offering"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                isActive("/admin/offering")
                  ? "bg-white text-[#267959] shadow-sm"
                  : "text-gray-200 hover:bg-white hover:text-[#267959]"
              }`}
            >
              <Users className="h-5 w-5" />
              Offering
            </Link>

            <Link
              href="/admin/prayerRequest"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                isActive("/admin/prayerRequest")
                  ? "bg-white text-[#267959] shadow-sm"
                  : "text-gray-200 hover:bg-white hover:text-[#267959]"
              }`}
            >
              <Users className="h-5 w-5" />
              Prayer Request
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
