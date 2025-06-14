
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

const DeveloperPortalSection = () => {
  return (
    <section className="py-20 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
          </div>
          
          <div className="relative z-10">
            <Settings className="h-16 w-16 mx-auto mb-6 animate-spin-slow" />
            <h2 className="text-3xl font-bold mb-4">Developer Portal</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Advanced configuration, API access, and system monitoring tools for technical teams. 
              Build custom integrations and manage multi-tenant deployments.
            </p>
            <Link to="/app">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-3 hover:scale-105 transition-transform">
                Access Developer Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeveloperPortalSection;
