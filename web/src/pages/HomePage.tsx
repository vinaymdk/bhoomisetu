import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { homeService } from '../services/home.service';
import type { HomeData, DashboardData } from '../types/property';
import { PremiumBanner } from '../components/home/PremiumBanner';
import { AISearchBar } from '../components/home/AISearchBar';
import { NewPropertiesSection } from '../components/home/NewPropertiesSection';
import { FeaturedPropertiesSection } from '../components/home/FeaturedPropertiesSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { AIChatButton } from '../components/home/AIChatButton';
import './HomePage.css';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [homeData, setHomeData] = useState<HomeData | DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatError = (message: string) => {
    if (message.toLowerCase().includes('request timed out') || message.toLowerCase().includes('timeout')) {
      return 'No properties available at the moment. Please try again later.';
    }
    if (message.toLowerCase().includes('econnrefused') || message.toLowerCase().includes('network')) {
      return 'Connection error. Please check your internet connection.';
    }
    return message;
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = isAuthenticated
          ? await homeService.getDashboardData()
          : await homeService.getHomeData();
        setHomeData(data);
      } catch (err: any) {
        console.error('Error fetching home data:', err);
        setError(err.message || 'Failed to load home data');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-loading">
          <div className="home-loading-spinner"></div>
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="home-error">
          <p>⚠️ {formatError(error)}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Premium Subscription Banner (only for authenticated users) */}
      {isAuthenticated && <PremiumBanner />}

      {/* AI Search Bar */}
      <section className="home-search-section">
        <AISearchBar />
      </section>

      {/* Featured Properties Section */}
      {homeData?.featuredProperties && homeData.featuredProperties.length > 0 && (
        <FeaturedPropertiesSection properties={homeData.featuredProperties} />
      )}

      {/* New Properties Section */}
      {homeData?.newProperties && homeData.newProperties.length > 0 && (
        <NewPropertiesSection properties={homeData.newProperties} />
      )}

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* AI Chat Button (Floating) */}
      <AIChatButton />
    </div>
  );
};