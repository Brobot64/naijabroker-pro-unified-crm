
import { Dashboard } from "../components/dashboard/Dashboard";
import { Header } from "../components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { userRole } = useAuth();

  console.log('Index page - Rendering with userRole:', userRole);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        <Dashboard userRole={userRole || 'User'} />
      </div>
    </div>
  );
};

export default Index;
