
import { Shield } from "lucide-react";

const AuthHeader = () => {
  return (
    <div className="flex items-center justify-center mb-8">
      <Shield className="h-12 w-12 text-blue-600 mr-3" />
      <h1 className="text-3xl font-bold text-gray-900">NaijaBroker Pro</h1>
    </div>
  );
};

export default AuthHeader;
