import React, { createContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./home";
import Login from "./login";
import Signup from "./signup";
import Dashboard from "./dashboard";
import Goals from "./goals";
import Profile from "./profile";
import Portfolio from "./portfolio";
import ReportsAnalysis from "./reportsanalysis";
import Investments from "./investments";
import Transactions from "./transactions";



export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);

  // ✅ restore login on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/goals" element={<Goals />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/portfolio" element={<Portfolio />} />
  <Route path="/reports" element={<ReportsAnalysis />} />
  <Route path="/investments" element={<Investments />} />
  <Route path="/transactions" element={<Transactions />} />


</Routes>

      </Router>
    </UserContext.Provider>
  );
}

export default App;
