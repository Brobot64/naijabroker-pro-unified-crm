
import { Check } from "lucide-react";

const TeamSection = () => {
  return (
    <section className="py-20 bg-gray-50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=faces"
                  alt="Professional Nigerian businessman in formal suit"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent"></div>
              </div>
              <div className="relative overflow-hidden rounded-lg shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop&crop=faces"
                  alt="Professional African businesswoman in formal attire"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/30 to-transparent"></div>
              </div>
            </div>
            
            <div className="absolute -z-10 top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50 animate-ping"></div>
            <div className="absolute -z-10 bottom-10 right-10 w-16 h-16 bg-indigo-200 rounded-full opacity-40 animate-pulse"></div>
          </div>
          
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Built by Insurance Professionals, for Insurance Professionals
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our team understands the unique challenges of the Nigerian insurance market. 
              We've built NaijaBroker Pro from the ground up to address real-world problems 
              faced by brokers every day.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Check className="h-6 w-6 text-green-500" />
                <span className="text-gray-700">20+ years combined industry experience</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-6 w-6 text-green-500" />
                <span className="text-gray-700">Built for Nigerian regulatory compliance</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-6 w-6 text-green-500" />
                <span className="text-gray-700">Continuous updates based on user feedback</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
