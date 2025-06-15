
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  isLogin: boolean;
  formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
  };
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AuthForm = ({ isLogin, formData, isLoading, onSubmit, onChange }: AuthFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!isLogin && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={onChange}
              required={!isLogin}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={onChange}
              required={!isLogin}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={onChange}
          required
        />
      </div>

      {!isLogin && (
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={onChange}
            required={!isLogin}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
      </Button>
    </form>
  );
};

export default AuthForm;
