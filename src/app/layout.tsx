import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <main className="flex flex-col items-center h-screen py-10 max-w-xl mx-auto gap-4 px-4 mobile:px-6">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
