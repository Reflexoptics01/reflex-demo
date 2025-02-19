import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/auth-context";
import Link from "next/link";

export default function SignIn() {
  const { Login, user, authError, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.push("/home");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await Login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
         <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
         {error && <div className="mb-4 text-red-600">{error}</div>}
         <form onSubmit={handleSubmit}>
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
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                   Sign In
              </button>
         </form>
         <p className="mt-4 text-center">
             Don&apos;t have an account? <Link href="/signup" className="text-indigo-600 hover:underline">Sign Up</Link>
         </p>
      </div>
    </div>
  );
} 