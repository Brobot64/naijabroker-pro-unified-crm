
interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

const AuthToggle = ({ isLogin, onToggle }: AuthToggleProps) => {
  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={onToggle}
        className="text-blue-600 hover:text-blue-800 text-sm"
      >
        {isLogin 
          ? "Don't have an account? Sign up" 
          : "Already have an account? Sign in"
        }
      </button>
    </div>
  );
};

export default AuthToggle;
