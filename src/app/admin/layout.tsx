"use client";
import { Toaster } from "~/components/ui/toaster";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 bg-gray-50 p-4 lg:gap-6 lg:p-6">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;