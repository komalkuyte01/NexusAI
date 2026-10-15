import type { Metadata } from "next";
import { Urbanist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NexusResearch | Autonomous AI Research & Report Agent",
  description: "Enterprise-grade autonomous deep research, multi-source synthesis, and publication-ready reports powered by FastAPI, LangChain, and Tavily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${jetbrainsMono.variable} font-sans h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090a0f] text-neutral-100 font-sans selection:bg-neutral-200 selection:text-black">
        {children}
      </body>
    </html>
  );
}
