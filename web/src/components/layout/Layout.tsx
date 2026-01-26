import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AIChatButton } from '../home/AIChatButton';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const hiddenChatRoutes = [
    '/properties',
    '/search',
    '/buyer-requirements',
    '/mediation/my-interests',
    '/mediation/property-interests',
    '/saved',
    '/cs/dashboard',
    '/cs/properties',
    '/notifications',
  ];
  const shouldHideChat = hiddenChatRoutes.some((route) => location.pathname.startsWith(route));

  return (
    <div className="layout">
      <Header />
      <main className="layout-main">
        {children}
      </main>
      {!shouldHideChat && <AIChatButton />}
      <Footer />
    </div>
  );
};
