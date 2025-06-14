
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">NaijaBroker Pro</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/app" className="text-gray-700 hover:text-blue-600">Features</Link>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
            <Link to="/app">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/app">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
