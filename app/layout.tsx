import type { Metadata } from "next";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Zest.fun - Solana Meme Coin Launchpad",
  description: "Launch your meme coin on Solana with Zest.fun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
