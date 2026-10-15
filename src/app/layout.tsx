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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://portfolio-satya-five.vercel.app");

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gede Satya Budi Dharma Wiguna",
  alternateName: ["Satya Dharma", "Gede Satya"],
  url: siteUrl,
  image: `${siteUrl}/satya-square.png`,
  jobTitle: "Web Developer",
  email: "mailto:satyadharma1609@gmail.com",
  sameAs: [
    "https://github.com",
    "https://linkedin.com",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bali",
    addressCountry: "ID",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Gede Satya Budi Dharma Wiguna Portfolio",
  alternateName: "Satya Portfolio",
  url: siteUrl,
  inLanguage: ["id", "en"],
  publisher: {
    "@type": "Person",
    name: "Gede Satya Budi Dharma Wiguna",
    image: `${siteUrl}/satya-square.png`,
  },
  thumbnailUrl: `${siteUrl}/satya-square.png`,
};

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "Gede Satya Budi Dharma Wiguna",
    alternateName: "Satya Dharma",
    image: `${siteUrl}/satya-square.png`,
    description:
      "Web Developer spesialisasi dalam aplikasi web modern, Next.js, TypeScript, dan UI/UX.",
  },
  primaryImageOfPage: {
    "@type": "ImageObject",
    contentUrl: `${siteUrl}/og-image.png`,
    thumbnailUrl: `${siteUrl}/satya-square.png`,
    caption: "Gede Satya Budi Dharma Wiguna - Web Developer",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gede Satya Budi Dharma Wiguna | Web Developer",
    template: "%s | Gede Satya Portfolio",
  },
  description:
    "Portofolio Personal Gede Satya Budi Dharma Wiguna - Web Developer spesialisasi dalam aplikasi web modern, Next.js, TypeScript, dan UI/UX. Membangun sistem web skalabel & pengalaman digital elegan.",
  applicationName: "Gede Satya Portfolio",
  keywords: [
    "Gede Satya Budi Dharma Wiguna",
    "Satya Dharma",
    "Gede Satya",
    "Web Developer Bali",
    "Next.js Developer Indonesia",
    "TypeScript",
    "Tailwind CSS",
    "React",
    "Node.js",
    "Portfolio Web",
    "Full Stack Developer",
  ],
  authors: [{ name: "Gede Satya Budi Dharma Wiguna", url: siteUrl }],
  creator: "Gede Satya Budi Dharma Wiguna",
  publisher: "Gede Satya Budi Dharma Wiguna",
  verification: {
    google: [
      "dm12KXG31DpHW6lyt4EoP4GQ190DnsFGu0aAX89F2hU",
      "UfiIbnl7IxjTLAylzBatwWGr9y7hbUBBPbdqTLfRkhE",
    ],
  },
  alternates: {
    canonical: "/",
    languages: {
      id: "/",
      en: "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "profile",
    url: siteUrl,
    title: "Gede Satya Budi Dharma Wiguna | Web Developer",
    description:
      "Portofolio Personal Gede Satya Budi Dharma Wiguna - Web Developer spesialisasi dalam aplikasi web modern, Next.js, TypeScript, dan UI/UX.",
    siteName: "Gede Satya Portfolio",
    locale: "id_ID",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Gede Satya Budi Dharma Wiguna - Web Developer Portfolio",
      },
      {
        url: "/satya-square.png",
        width: 800,
        height: 800,
        type: "image/png",
        alt: "Foto profil Gede Satya Budi Dharma Wiguna",
      },
      {
        url: "/uploads/foto_wasit_satya-1791865121487.png",
        width: 842,
        height: 1264,
        type: "image/png",
        alt: "Foto profil Gede Satya Budi Dharma Wiguna",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gede Satya Budi Dharma Wiguna | Web Developer",
    description:
      "Portofolio Personal Gede Satya Budi Dharma Wiguna - Web Developer spesialisasi dalam aplikasi web modern, Next.js, TypeScript, dan UI/UX.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    thumbnail: `${siteUrl}/satya-square.png`,
    "thumbnail:image": `${siteUrl}/satya-square.png`,
  },
  category: "portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`dark ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-400">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personJsonLd, websiteJsonLd, profilePageJsonLd]),
          }}
        />
        {children}
      </body>
    </html>
  );
}
