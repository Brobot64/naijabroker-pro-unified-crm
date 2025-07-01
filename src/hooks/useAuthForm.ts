
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const { signIn, signUp, user, organizationId, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for onboarding completion flag
  useEffect(() => {
    const justCompleted = localStorage.getItem('onboarding_just_completed');
    if (justCompleted === 'true') {
      localStorage.removeItem('onboarding_just_completed');
      setIsLogin(true);
      toast({
        title: "Please sign in again",
        description: "Complete your setup by signing in with your credentials.",
      });
    }
  }, [toast]);

  // Handle redirect after successful authentication
  useEffect(() => {
    if (!loading && user && !isLoading) {
      console.log('Auth form redirect check:', { user: user.id, organizationId, loading, isLoading });
      
      // Check for custom redirect
      const redirectTo = localStorage.getItem('redirect_after_signin');
      if (redirectTo) {
        localStorage.removeItem('redirect_after_signin');
        navigate(redirectTo);
        return;
      }
      
      // Default redirect logic
      if (organizationId) {
        navigate('/app');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, organizationId, navigate, loading, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      console.log('Form submission blocked - already loading');
      return;
    }
    
    setIsLoading(true);
    console.log('Form submission started:', isLogin ? 'login' : 'signup');

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          console.error('Sign in error:', error);
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
        // Success redirect will be handled by useEffect above
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password mismatch",
            description: "Passwords do not match. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName
        });

        if (error) {
          console.error('Sign up error:', error);
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setSignUpSuccess(true);
          setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            confirmPassword: ''
          });
        }
      }
    } catch (error) {
      console.error('Auth form error:', error);
      toast({
        title: "An error occurred",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return {
    isLogin,
    setIsLogin,
    formData,
    isLoading,
    signUpSuccess,
    setSignUpSuccess,
    handleSubmit,
    handleChange
  };
};
