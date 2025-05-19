import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TV Show Tracker",
  description: "Urmărește ce seriale vezi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-800 text-cyan-600`}>{children}</body>

    </html>
  );
}
