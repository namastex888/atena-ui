import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import './globals.css';
import { config } from "@/lib/config/environment";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Atena - Tutora de Estudos | Universidade Cruzeiro do Sul',
  description: 'Assistente inteligente de estudos com IA para alunos da Cruzeiro do Sul',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}