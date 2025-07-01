
import { Navigation } from "../components/landing/Navigation";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import InteractiveDemoSection from "../components/landing/InteractiveDemoSection";
import TeamSection from "../components/landing/TeamSection";
import CaseStudiesSection from "../components/landing/CaseStudiesSection";
import DeveloperPortalSection from "../components/landing/DeveloperPortalSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import PricingSection from "../components/landing/PricingSection";
import TeamCollaborationSection from "../components/landing/TeamCollaborationSection";
import FAQSection from "../components/landing/FAQSection";
import NewsletterSection from "../components/landing/NewsletterSection";
import ContactSection from "../components/landing/ContactSection";
import Footer from "../components/landing/Footer";
import FloatingGraphics from "../components/landing/FloatingGraphics";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <FloatingGraphics />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <InteractiveDemoSection />
      <TeamSection />
      <CaseStudiesSection />
      <DeveloperPortalSection />
      <TestimonialsSection />
      <PricingSection />
      <TeamCollaborationSection />
      <FAQSection />
      <NewsletterSection />
      <ContactSection />
      <Footer />
    </motion.div>
  );
};

export default Landing;
