
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

  // Redirect logic for authenticated users
  useEffect(() => {
    if (user) {
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
    }
  }, [user, organizationId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) {
          return;
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName
        });

        if (!error) {
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
    handleSubmit,
    handleChange
  };
};
