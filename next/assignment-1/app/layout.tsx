import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';

const roboto = Roboto({
  fallback: ['arial', 'system-ui']
});

export const metadata: Metadata = {
  title: "Task Management App",
  description: "Task Manager built using NextJs and Firebase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.className}`}> 
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
