
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
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const { signIn, signUp, user, organizationId } = useAuth();
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

  // Only redirect after successful authentication action
  useEffect(() => {
    if (user && shouldRedirect) {
      const redirectTo = localStorage.getItem('redirect_after_signin');
      if (redirectTo) {
        localStorage.removeItem('redirect_after_signin');
        navigate(redirectTo);
        return;
      }
      
      if (organizationId) {
        navigate('/app');
      } else {
        navigate('/onboarding');
      }
      setShouldRedirect(false);
    }
  }, [user, organizationId, navigate, shouldRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) {
          setShouldRedirect(true);
          return;
        }
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

        if (!error) {
          setSignUpSuccess(true);
          // Clear form
          setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            confirmPassword: ''
          });
          return;
        }
      }
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
