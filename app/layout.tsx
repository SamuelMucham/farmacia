import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FarmaVida 3D | Sua saúde em todas as dimensões",
  description:
    "Farmácia com experiência 3D: medicamentos, dermocosméticos, manipulação e entrega rápida.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
