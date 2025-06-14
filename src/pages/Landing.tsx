
import Navigation from "../components/landing/Navigation";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import TeamSection from "../components/landing/TeamSection";
import DeveloperPortalSection from "../components/landing/DeveloperPortalSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import PricingSection from "../components/landing/PricingSection";
import TeamCollaborationSection from "../components/landing/TeamCollaborationSection";
import Footer from "../components/landing/Footer";
import FloatingGraphics from "../components/landing/FloatingGraphics";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <FloatingGraphics />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <TeamSection />
      <DeveloperPortalSection />
      <TestimonialsSection />
      <PricingSection />
      <TeamCollaborationSection />
      <Footer />
    </div>
  );
};

export default Landing;
