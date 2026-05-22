import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useState, useEffect } from "react";
import { initializeAnonymousSession, testConnection } from "./lib/firebase";

export default function App() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // Simple auth persistence (session based) & Firebase session boot
  useEffect(() => {
    initializeAnonymousSession().then(() => {
      testConnection();
    });

    const savedUser = localStorage.getItem("bk_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: { name: string; role: string }) => {
    setUser(userData);
    localStorage.setItem("bk_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("bk_user");
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard/*" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}
