import type { Metadata } from "next";
import { Poppins, Nunito } from "next/font/google";

import "./globals.css";

import { NextIntlClientProvider } from "next-intl";

import AppProviders from "@/components/AppProviders";

const headingFont = Poppins({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  subsets: ["latin"],
  variable: "--heading-font",
});

const bodyFont = Nunito({
  weight: ["200", "300", "400", "600", "700", "800", "900"],
  display: "swap",
  subsets: ["latin"],
  variable: "--body-font",
});

export const metadata: Metadata = {
  title: "Loading...",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={"en"} className="light">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
