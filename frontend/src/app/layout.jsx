import "./globals.css";
import Script from "next/script";
import SessionWrapper from "./SessionWrapper";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <Script
                    id="google-translate"
                    strategy="afterInteractive"
                    src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                />
                <Script id="google-translate-init" strategy="afterInteractive">
                    {`
                        function googleTranslateElementInit() {
                            new google.translate.TranslateElement(
                                {
                                    pageLanguage: 'en',
                                    includedLanguages: 'en,es,zh,vi,fr,ko',
                                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                                },
                                'google_translate_element'
                            );
                        }
                    `}
                </Script>
            </head>
            <body>
                <SessionWrapper> {/* ✅ Wrap everything inside this */}
                    {children}
                </SessionWrapper>
            </body>
        </html>
    );
}
