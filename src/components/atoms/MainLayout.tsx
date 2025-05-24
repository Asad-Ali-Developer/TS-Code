import { AuthProvider } from "@/providers";
import { FC, ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <div className="h-[100%] w-[100%]">
        <AuthProvider>
          {/* Navbar component */}
          <Navbar />

          {/* Main content area */}
          <main className="font-sans">{children}</main>

          {/* Conditionally render the footer */}
          <Footer />
        </AuthProvider>
      </div>
    </>
  );
};

export default MainLayout;
