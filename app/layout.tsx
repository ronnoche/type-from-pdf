import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Type from PDF",
  description: "Upload a PDF and practice typing its content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${mono.className} min-h-screen antialiased`}>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <footer className="px-6 py-4">
            <div className="max-w-6xl mx-auto flex justify-end text-sm text-[var(--text-muted)]">
              <a
                href="https://github.com/ronnoche"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--accent)] transition-colors"
              >
                made by @ronnoche
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
