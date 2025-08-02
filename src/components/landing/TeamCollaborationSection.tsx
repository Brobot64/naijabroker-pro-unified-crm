
import { Users, FileText, Shield } from "lucide-react";

const TeamCollaborationSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Collaborate Seamlessly with Your Team
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Real-time collaboration tools that keep your entire brokerage team connected, 
              informed, and working efficiently towards common goals.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-500" />
                <span className="text-gray-700">Multi-user workspace with role-based access</span>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-500" />
                <span className="text-gray-700">Shared document management and templates</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-blue-500" />
                <span className="text-gray-700">Secure client data sharing and compliance</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop&crop=center"
                alt="African business professionals collaborating in modern office meeting"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent"></div>
            </div>
            
            {/* <div className="absolute -top-6 -left-6 bg-white rounded-full p-4 shadow-lg animate-bounce">
              <Users className="h-8 w-8 text-indigo-600" />
            </div> */}
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-full p-4 shadow-lg animate-pulse">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamCollaborationSection;
