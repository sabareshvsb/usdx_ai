import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel-google",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "USDX AI — USDXSMART Token Intelligence",
    template: "%s · USDX AI",
  },
  description:
    "USDX AI — live intelligence dashboard for USDXSMART (Unique Smart Contract Decentralized Stable Coin) on Base. Real price, 1-hour candlesticks, pool analytics and on-chain data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('usdx-theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-bg-base text-text-primary">
        {children}
      </body>
    </html>
  );
}
