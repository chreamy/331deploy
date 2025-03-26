import "./globals.css";
import Nav from "./nav";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Nav />
                {children}
            </body>
        </html>
    );
}
