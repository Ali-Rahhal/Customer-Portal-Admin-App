import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { useRouter } from "next/router";
import en from "../../locales/en.json";
import fr from "../../locales/fr.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CustomerPortalAdminApp",
  description: "CustomerPortalAdminApp",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const router = useRouter();
  const { locale } = router;
  const messages = locale === "fr" ? fr : en;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="UTC"
        >
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
