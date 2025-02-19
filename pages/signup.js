import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/auth-context";
import Link from "next/link";

export default function SignUp() {
  const { SignUp, user } = useAuth();
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      // Pass additional data, here just the full name, adjust as needed
      await SignUp(email, password, { name: fullName });
      router.push("/signin");
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
         <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
         {error && <div className="mb-4 text-red-600">{error}</div>}
         <form onSubmit={handleSubmit}>
             <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
             </div>
             <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
             </div>
             <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
             </div>
             <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
             </div>
             <button 
               type="submit" 
               className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
             >
               Sign Up
             </button>
         </form>
         <p className="mt-4 text-center">
            Already have an account? <Link href="/signin" className="text-indigo-600 hover:underline">Sign In</Link>
         </p>
      </div>
    </div>
  );
} 