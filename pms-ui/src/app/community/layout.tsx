import type { Metadata } from "next";
import "app/globals.css";
import NavBar from "@/components/nav/NavBar";
import { ToastContainer } from "react-toastify";
import AlumniSidebar from "@/app/components/side/AlumniSideBar";
import { AuthProvider } from '@/app/components/services/AuthContext';


export const metadata: Metadata = {
  title: "PMS",
  description: "Placement Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        <AuthProvider>
        {/* Navigation Bar */}
        <NavBar />

        <main className="flex min-h-screen "> {/* pt-16 to avoid overlap with NavBar */}
          {/* Sidebar (Fixed Width & Non-Overlapping) */}
          <AlumniSidebar />
          {/* Main Content (Margin to Avoid Overlap) */}
          <div className="flex-1 ml-48 z-20 mt-20">
            {children}
            <ToastContainer position="bottom-left" autoClose={3000} />
          </div>
        </main>
        </AuthProvider>
        {/* Optional: Add any global footer or additional components here */}
      </body>
    </html>
  );
}

