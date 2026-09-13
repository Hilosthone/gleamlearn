// import type { Metadata } from "next";
// import { Plus_Jakarta_Sans } from "next/font/google";
// import "./globals.css";
// import greenlearnLogo from './gleamlearn-logo.jpg'

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
//     url: "https://gleamlearn.vercel.app", // Replace with your actual domain when deploying
//     siteName: "gleamLearn",
//     images: [
//       {
//         // url: "/greamlearn-logo.jpg",
//         url: greenlearnLogo.src,
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
//     images: ["/greamlearn-logo.jpg"],
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className={`${jakarta.variable} dark`} suppressHydrationWarning>
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