import type { Metadata } from "next";
import "./globals.css";
import "@copilotkit/react-core/v2/styles.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://jobbattle.pixelnest.pl"),
  title: {
    default: "Job Battle – Przeżyj Absurdalną Rozmowę Rekrutacyjną z AI",
    template: "%s | Job Battle",
  },
  description:
    "Gra, w której AI wcieli się w Twojego rekrutera. Odpowiadaj na absurdalne pytania, przetrwaj rozmowę i sprawdź, czy dostaniesz tę wymarzoną pracę.",
  keywords: [
    "gra rekrutacyjna",
    "absurdalna rozmowa kwalifikacyjna",
    "gra AI",
    "symulator rekrutera",
    "zabawna gra o pracę",
    "job interview game",
    "humor rekrutacyjny",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Job Battle – Przeżyj Absurdalną Rozmowę Rekrutacyjną z AI",
    description:
      "Gra, w której AI wcieli się w Twojego rekrutera. Odpowiadaj na absurdalne pytania, przetrwaj rozmowę i sprawdź, czy dostaniesz tę wymarzoną pracę.",
    url: "https://jobbattle.pixelnest.pl",
    type: "website",
    locale: "pl_PL",
    siteName: "Job Battle",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Job Battle – Gra z absurdalną rozmową rekrutacyjną prowadzoną przez AI.",
      },
    ],
  },
  other: {
    "og:logo": "https://jobbattle.pixelnest.pl/logo.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Job Battle – Przeżyj Absurdalną Rozmowę Rekrutacyjną z AI",
    description:
      "Gra, w której AI wcieli się w Twojego rekrutera. Odpowiadaj na absurdalne pytania i sprawdź, czy przetrwasz rozmowę kwalifikacyjną.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body className={`antialiased h-screen overflow-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
