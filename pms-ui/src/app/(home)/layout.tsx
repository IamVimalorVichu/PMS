import type { Metadata } from "next";
import "app/globals.css"
import { ToastContainer } from "react-toastify";



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
        {/* Navigation Bar */}

        <main className="flex min-h-screen "> {/* pt-16 to avoid overlap with NavBar */}



          <div className="flex-1 z-20">
            {children}
                       <ToastContainer />
          </div>
        </main>
      </body>
    </html>
  );
}

