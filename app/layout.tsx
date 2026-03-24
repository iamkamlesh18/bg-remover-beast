import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Background Remover",
  description: "Ultra open source background remover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}