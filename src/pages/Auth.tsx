
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
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
    signUpSuccess,
    setSignUpSuccess,
    handleSubmit,
    handleChange
  } = useAuthForm();

  if (signUpSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthHeader />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Check Your Email
                </CardTitle>
                <Link to="/landing">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Account Created Successfully!
                </h3>
                <p className="text-gray-600">
                  We've sent a confirmation link to your email address. 
                  Please check your inbox and click the link to activate your account.
                </p>
                <p className="text-sm text-gray-500">
                  The email may take a few minutes to arrive. Don't forget to check your spam folder.
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    setSignUpSuccess(false);
                    setIsLogin(true);
                  }}
                  className="w-full"
                >
                  Continue to Sign In
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSignUpSuccess(false)}
                  className="w-full"
                >
                  Create Another Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
