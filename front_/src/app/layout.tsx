import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./style/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const Layout: React.FC = ({ children }) => {
  return (
    <html lang="en" className='dark'>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

export default Layout;