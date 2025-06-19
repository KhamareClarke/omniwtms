// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { AIChatWidget } from "@/components/ui/ai-chat-widget";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      toast.error("Please sign in to access the dashboard");
      router.push("/auth/login");
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (!userData.email) {
        toast.error("Invalid user data. Please sign in again");
        handleLogout();
        return;
      }
      setUsername(userData.email.split("@")[0]);
    } catch (error) {
      console.error("Error parsing user data:", error);
      toast.error("Session error. Please sign in again");
      handleLogout();
      return;
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/auth/login");
  };

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Sidebar */}
        <Sidebar className="h-screen" />

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 md:ml-0 overflow-y-auto">
          {children}
        </div>

        {/* AI Chat Widget */}
        <AIChatWidget />
      </div>
    </div>
  );
}
