import type { Metadata } from "next";
import "app/globals.css"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from "../components/nav/NavBar";
import StudentSidebar from "../components/side/StudentSideBar";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "PMS",
  description: "Oh you've dragged here too!!!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        {/* Navigation Bar */}
        <NavBar />

        <main className="flex min-h-screen "> {/* pt-16 to avoid overlap with NavBar */}
          {/* Sidebar (Fixed Width & Non-Overlapping) */}
          <StudentSidebar />
          {/* Main Content (Margin to Avoid Overlap) */}
          <div className="flex-1 ml-48 mt-20 z-20">
            {children}
            <ToastContainer position="bottom-left" autoClose={3000} />
          </div>
        </main>
      </body>
    </html>
  );
}

