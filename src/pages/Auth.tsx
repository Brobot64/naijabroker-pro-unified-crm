
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuthForm } from "@/hooks/useAuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthForm from "@/components/auth/AuthForm";
import AuthToggle from "@/components/auth/AuthToggle";
import SignupInfo from "@/components/auth/SignupInfo";

const Auth = () => {
  const {
    isLogin,
    setIsLogin,
    formData,
    isLoading,
    handleSubmit,
    handleChange
  } = useAuthForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {isLogin ? 'Sign In' : 'Create Account'}
              </CardTitle>
              <Link to="/landing">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <AuthForm
              isLogin={isLogin}
              formData={formData}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onChange={handleChange}
            />

            <AuthToggle
              isLogin={isLogin}
              onToggle={() => setIsLogin(!isLogin)}
            />

            {!isLogin && <SignupInfo />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
