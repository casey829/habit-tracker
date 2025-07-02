import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoadingUser?: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

 // Initialize user state
const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)


// Initialize loading state
const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

// Fetch user on mount
useEffect(() => {
    getUser()
}, []);


const getUser = async () => {
    try {
       const session = await account.get();
       setUser(session) 
    } catch (error) {
        setUser(null);
        if (error instanceof Error) {
          console.error("Error fetching user:", error.message);
        } else {
          console.error("An unexpected error occurred while fetching user.");
        }   
    }
    finally{
        setIsLoadingUser(false);
    }
}


  const signUp = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password);
      await signIn(email, password);
      return null; // Sign up successful, no error message
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "An unexpected error occurred during sign up.";
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession( email, password);
      return null; // Sign up successful, no error message
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "An unexpected error occurred during sign in.";
    }
  };


  return (
     <AuthContext.Provider value={{ user, isLoadingUser, signUp, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
