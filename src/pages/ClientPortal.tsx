
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ClientDashboard } from "@/components/client/ClientDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

export const ClientPortal = () => {
  const [searchParams] = useSearchParams();
  const [clientEmail, setClientEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if client email is provided in URL params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setClientEmail(emailParam);
      setIsAuthenticated(true);
    }
  }, [searchParams]);

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputEmail.trim()) {
      setClientEmail(inputEmail);
      setIsAuthenticated(true);
      // Update URL to include email param
      navigate(`/client-portal?email=${encodeURIComponent(inputEmail)}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Client Portal</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address to access your insurance information
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Access Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClientLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Access Portal
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <ClientDashboard clientEmail={clientEmail} />
      </div>
    </div>
  );
};

export default ClientPortal;
