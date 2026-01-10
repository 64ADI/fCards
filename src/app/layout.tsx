import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Button} from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer";
import "./globals.css";
import Providers from "@/components/providers";
import { DefaultToggle } from "@/components/default-toggle";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cards App",
  description: "Learn with flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${poppins.variable} antialiased flex flex-col min-h-screen`}>
          <Providers>
          <header className="border-b border-border">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-1">
                <Image
                  src="/images/fCards_LogoWhite.png"
                  alt="fcards Logo (white)"
                  width={220}
                  height={40}
                  className="h-8 w-auto block dark:hidden"
                  priority
                />
                <Image
                  src="/images/fCards_Logo.png"
                  alt="fcards Logo"
                  width={220}
                  height={40}
                  className="h-8 w-auto hidden dark:block"
                  priority
                />
                <h1 className="text-xl font-semibold">Cards</h1>
              </Link>
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm" className="hover:bg-accent/10 dark:hover:bg-input/30 transition-colors">
                  <Link href="/pricing" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 1v22" />
                      <path d="M17 5H9a3 3 0 1 0 0 6h6a3 3 0 1 1 0 6H7" />
                    </svg>
                    <span>Pricing</span>
                  </Link>
                </Button>
                <DefaultToggle />
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="secondary">Sign in</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                  <Button variant="default">Sign up</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="bottom-right" />
          <Analytics />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
