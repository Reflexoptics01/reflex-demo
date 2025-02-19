import { createContext, useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, data } from "../firebase/firebaseConfig";

const AuthContext = createContext({
  user: null,
  loading: true,
  Login: async () => {},
  Logout: async () => {},
  SignUp: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Immediately set a basic user state
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email
        });
        try {
          const userDoc = await getDoc(doc(data, "reflex", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              ...userDoc.data(),
              id: firebaseUser.uid,
              email: firebaseUser.email
            });
          } else {
            // For demo: if user exists in Auth but not in Firestore, create a basic admin record
            const adminUserData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              access: "Admin",
              category: "Admin",
              status: "active",
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(data, "reflex", firebaseUser.uid), adminUserData);
            setUser(adminUserData);
          }
        } catch (error) {
          console.error("Error accessing Firestore for user data:", error);
          // Fallback: user remains as the basic info set above
          setAuthError(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const SignUp = async (email, password, userData) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create the admin user data
      const adminUserData = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        access: "Admin",
        category: "Admin",
        status: "active",
        createdAt: new Date().toISOString(),
        ...userData // Include any additional user data
      };
      
      // Save to Firestore
      await setDoc(doc(data, "reflex", userCredential.user.uid), adminUserData);
      
      return userCredential;
    } catch (error) {
      console.error("Signup error:", error);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const Login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const Logout = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    authError,
    Login,
    Logout,
    SignUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider; 