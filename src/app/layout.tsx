import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Python5 JobSeeker - Centrum Operacyjne Rekrutacji",
  description: "Zarządzanie ofertami pracy i etapami rekrutacji",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jobseeker",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("jobseeker-theme");
  const currentTheme = themeCookie?.value === "cosmic" ? "theme-cosmic" : "theme-zinc";

  return (
    <html lang="pl" className="dark">
      <body className={`${currentTheme} antialiased min-h-screen text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
