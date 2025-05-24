import { UserDetails } from "@/types";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface AuthContextType {
  userDetails: UserDetails | null;
  setUserDetails: (user: UserDetails | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [userDetails, setUserDetailsState] = useState<UserDetails | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("userDetails");
    if (stored) {
      try {
        setUserDetailsState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("userDetails");
      }
    }
  }, []);

  // Save to localStorage on change
  const setUserDetails = (user: UserDetails | null) => {
    setUserDetailsState(user);
    if (user) {
      localStorage.setItem("userDetails", JSON.stringify(user));
    } else {
      localStorage.removeItem("userDetails");
    }
  };

  return (
    <AuthContext.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to consume context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
