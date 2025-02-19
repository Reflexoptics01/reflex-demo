import Navbar from "./components/navbar";

export default function Layout({ children }) {
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
