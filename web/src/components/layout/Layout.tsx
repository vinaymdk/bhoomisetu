import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AIChatButton } from '../home/AIChatButton';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main">
        {children}
      </main>
      <AIChatButton />
      <Footer />
    </div>
  );
};
