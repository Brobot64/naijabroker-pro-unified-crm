
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthMethods = () => {
  const { toast } = useToast();

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata || {}
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created successfully! 🎉",
        description: `Please check your email (${email}) for a confirmation link to activate your account. The email may take a few minutes to arrive.`,
        duration: 8000,
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { signUp, signIn, signOut };
};
