import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Kalkulator HPP F&B",
  description: "Kalkulator HPP profesional untuk F&B — hitung, simpan, dan bandingkan menu.",
};

const customLocalization = {
  formFieldLabel__username: 'ID Pengguna',
  formFieldPlaceholder__username: 'Masukkan ID Anda',
  formFieldLabel__password: 'Password',
  formFieldPlaceholder__password: 'Masukkan Password Anda',
  signIn: {
    start: {
      title: 'Masuk Akun',
      subtitle: 'Masukkan ID dan Password untuk melanjutkan',
    }
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <ClerkProvider 
          appearance={{ theme: shadcn }}
          localization={customLocalization}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
