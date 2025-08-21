import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "RJ Media Agency Token",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full content-between">
        <ThirdwebProvider>{children}</ThirdwebProvider>
        <footer className="footer footer-center text-primary-content text-center">
          <aside>
            <p className="font-bold">Powered by</p>
            <div className="flex justify-center">
              <Image
                src="/rjmeta.png"
                className="w-1/2 lg:w-1/12 sm:w-1/2"
                width="250"
                height="500"
                alt=""
              />
              {/* <img
                src="rjmeta.png"
                alt="Placeholder Image"
                className="w-1/2 lg:w-1/12 sm:w-1/2"
                //width="150px"
              /> */}
            </div>
            <p>
              Copyright © 2024 -{" "}
              <a href="https://www.rjmediastudios.com">RJ Media Studios Inc.</a>
            </p>
          </aside>
        </footer>
      </body>
    </html>
  );
}
