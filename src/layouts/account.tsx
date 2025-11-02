"use client";

import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import Header from "@/components/organisms/header";
import Sidebar from "@/components/organisms/sidebar";
import Footer from "@/components/organisms/footer";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-30 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <main className="flex-1 max-w-6xl w-full mx-auto mt-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - hidden on mobile, visible on desktop */}
          <aside className="hidden lg:block lg:w-[200px] mt-6 flex-shrink-0">
            <Sidebar isOpen={true} />
          </aside>

          {/* Mobile Sidebar */}
          <div className="lg:hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>

          {/* Main content */}
          <div className="flex-1 w-full lg:w-auto">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
