import { AuthProvider } from "../context/auth-context";
import Navbar from "./components/navbar";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { initializeReminderScheduler } from './utils/reminderScheduler';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize the reminder scheduler when the app starts
    initializeReminderScheduler();
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default MyApp; 