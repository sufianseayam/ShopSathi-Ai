import "./globals.css";

export const metadata = {
  title: "ShopSathi AI | Support that speaks your customers’ language",
  description:
    "A multilingual customer support platform for e-commerce businesses in Bangladesh and beyond.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
