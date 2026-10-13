import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://satyadharma.dev"),
  title: "Gede Satya Budi Dharma Wiguna | Web Developer",
  description:
    "Portofolio Personal Gede Satya Budi Dharma Wiguna - Web Developer spesialisasi dalam aplikasi web modern, Next.js, TypeScript, dan UI/UX.",
  keywords: [
    "Gede Satya Budi Dharma Wiguna",
    "Satya Dharma",
    "Web Developer Bali",
    "Next.js Developer Indonesia",
    "TypeScript",
    "Tailwind CSS",
    "React",
    "Node.js",
    "Portfolio Web",
  ],
  authors: [{ name: "Gede Satya Budi Dharma Wiguna" }],
  openGraph: {
    title: "Gede Satya Budi Dharma Wiguna | Web Developer",
    description:
      "Personal portfolio showcasing scalable web applications, modern UI/UX, and cloud-ready architectures.",
    images: ["/assets/img/project-saas.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`dark ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-400">
        {children}
      </body>
    </html>
  );
}
