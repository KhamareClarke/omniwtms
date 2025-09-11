import "./globals.css";
import type { Metadata } from "next";
import LiveChatWidget from "@/components/LiveChatWidget";

export const metadata: Metadata = {
  title: "OmniDeploy",
  description: "Modern warehouse and delivery management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="app">
          {children}
          <LiveChatWidget />
        </div>
      </body>
    </html>
  );
}
