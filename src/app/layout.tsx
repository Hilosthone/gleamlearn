// import type { Metadata } from "next";
// import { Plus_Jakarta_Sans } from "next/font/google";
// import "./globals.css";

// // Load Plus Jakarta Sans font from Google Fonts for clean modern typography
// const jakarta = Plus_Jakarta_Sans({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
//   variable: "--font-jakarta",
// });

// export const metadata: Metadata = {
//   title: "gleamLearn — AI-Powered Personalized Learning, Practice & Examination Platform",
//   description: "Transform your study materials into structured notes, quizzes, flashcards, and personalized AI tutoring sessions.",
//   openGraph: {
//     title: "gleamLearn — AI-Powered Personalized Learning",
//     description: "Transform your study materials into structured notes, quizzes, flashcards, and personalized AI tutoring sessions.",
//     url: "https://gleamlearn.vercel.app",
//     siteName: "gleamLearn",
//     images: [
//       {
//         url: "/gleamlearn-logo.jpg", // Using public folder absolute path string
//         width: 1200,
//         height: 630,
//         alt: "gleamLearn Logo and Platform Preview",
//       },
//     ],
//     locale: "en_US",
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "gleamLearn — AI-Powered Personalized Learning",
//     description: "Transform your study materials into structured notes, quizzes, flashcards, and personalized AI tutoring sessions.",
//     images: ["/gleamlearn-logo.jpg"],
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     // Removed 'dark' class here so it defaults to light mode
//     <html lang="en" className={`${jakarta.variable}`} suppressHydrationWarning>
//       <body className="bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 antialiased selection:bg-brand-blue selection:text-white transition-colors duration-300">
//         {children}
//       </body>
//     </html>
//   );
// }



import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Load Plus Jakarta Sans font from Google Fonts for clean modern typography
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "gleamLearn — AI-Powered Personalized Learning, Practice & Examination Platform",
  description: "Transform your study materials into structured notes, quizzes, flashcards, and personalized AI tutoring sessions.",
  
  // The 'icons' property maps the logo file directly to the browser's tab favicon.
  // Next.js automatically reads this and injects the corresponding <link rel="icon"...> tags into the HTML head.
  icons: {
    icon: "/gleamlearn-logo.jpg",
    shortcut: "/gleamlearn-logo.jpg",
    apple: "/gleamlearn-logo.jpg",
  },

  openGraph: {
    title: "gleamLearn — AI-Powered Personalized Learning",
    description: "Transform your study materials into structured notes, quizzes, flashcards, and personalized AI tutoring sessions.",
    url: "https://gleamlearn.vercel.app",
    siteName: "gleamLearn",
    images: [
      {
        url: "/gleamlearn-logo.jpg", // Using public folder absolute path string
        width: 1200,
        height: 630,
        alt: "gleamLearn Logo and Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "gleamLearn — AI-Powered Personalized Learning",
    description: "Transform your study materials into structured notes, quizzes, flashcards, and personalized AI tutoring sessions.",
    images: ["/gleamlearn-logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Removed 'dark' class here so it defaults to light mode
    <html lang="en" className={`${jakarta.variable}`} suppressHydrationWarning>
      <body className="bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 antialiased selection:bg-brand-blue selection:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}