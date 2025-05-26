import "./globals.css";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <main className="flex flex-col items-center h-screen py-10 max-w-xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
};
export default RootLayout;
