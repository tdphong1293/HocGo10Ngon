import type { Metadata } from "next";
import {
    Geist,
    Geist_Mono,
    Inter,
    Roboto,
    Poppins,
    Open_Sans,
    Source_Code_Pro,
    Comfortaa,
    Patrick_Hand,
    Space_Mono,
    Paytone_One,
    Righteous,
    Lato,
    Merriweather,
    Nunito,
    Ubuntu,
    Playfair_Display,
    Work_Sans
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeSelector } from "@/components/ThemeSelector";
import { menuConfig } from "@/config/menuConfig";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { Bounce, ToastContainer } from "react-toastify";
import Script from "next/script";

const geistSans = Geist({
    variable: "--font-geist",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const roboto = Roboto({
    variable: "--font-roboto",
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
});

const poppins = Poppins({
    variable: "--font-poppins",
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
});

const openSans = Open_Sans({
    variable: "--font-openSans",
    subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
    variable: "--font-sourceCodePro",
    subsets: ["latin"],
});

const comfortaa = Comfortaa({
    variable: "--font-comfortaa",
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
    variable: "--font-patrickHand",
    weight: ["400"],
    subsets: ["latin"],
});

const spaceMono = Space_Mono({
    variable: "--font-spaceMono",
    weight: ["400", "700"],
    subsets: ["latin"],
});

const paytoneOne = Paytone_One({
    variable: "--font-paytoneOne",
    weight: ["400"],
    subsets: ["latin"],
});

const righteous = Righteous({
    variable: "--font-righteous",
    weight: ["400"],
    subsets: ["latin"],
});
const lato = Lato({
    variable: "--font-lato",
    weight: ["300", "400", "700"],
    subsets: ["latin"],
});

const merriweather = Merriweather({
    variable: "--font-merriweather",
    weight: ["300", "400", "700"],
    subsets: ["latin"],
});

const nunito = Nunito({
    variable: "--font-nunito",
    weight: ["300", "400", "700"],
    subsets: ["latin"],
});

const ubuntu = Ubuntu({
    variable: "--font-ubuntu",
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
    variable: "--font-playfairDisplay",
    weight: ["400", "700"],
    subsets: ["latin"],
});

const workSans = Work_Sans({
    variable: "--font-workSans",
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Học Gõ 10 Ngón",
    description: "Trang web giúp bạn luyện tập và cải thiện kỹ năng gõ 10 ngón một cách hiệu quả.",
    icons: {
        icon: [
            {
                url: '/favicon.svg',
                type: 'image/svg+xml',
            },
            {
                url: '/favicon.ico',
                type: 'image/x-icon',
                sizes: '32x32',
            }
        ],
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <Script id="theme-script" strategy="beforeInteractive">{`
                    (function() {
                       try {
                           var theme = document.cookie.split('; ').find(row => row.startsWith('theme=')).split('=')[1];
                           var font = document.cookie.split('; ').find(row => row.startsWith('font=')).split('=')[1];
                            if (theme) {
                                document.documentElement.setAttribute('data-theme', decodeURIComponent(theme));
                            }
                            if (font) {
                                document.documentElement.setAttribute('data-font', decodeURIComponent(font));
                            }
                       } catch (error) {
                           console.error('Error reading cookies:', error);
                       }
                    })();
                `}</Script>
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} ${openSans.variable} ${sourceCodePro.variable} ${comfortaa.variable} ${patrickHand.variable} ${spaceMono.variable} ${paytoneOne.variable} ${righteous.variable} ${lato.variable} ${merriweather.variable} ${nunito.variable} ${ubuntu.variable} ${playfairDisplay.variable} ${workSans.variable} antialiased min-h-screen grid grid-rows-[auto_1fr]`}
            >
                <AuthProvider>
                    <ThemeProvider>
                        <Navbar
                            menuConfig={menuConfig}
                        />
                        <main className="overflow-auto">
                            <ThemeSelector />
                            {children}
                        </main>
                        <ToastContainer
                            position="top-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="colored"
                            transition={Bounce}
                        />
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
