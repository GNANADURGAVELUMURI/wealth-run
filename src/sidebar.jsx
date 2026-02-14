import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./app";

function SidebarLayout({ children }) {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // ✅ Restore user from localStorage on refresh
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [user, setUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#1E3A8A",
          color: "#ffffff",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>Wealth Tracker</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <Link style={linkStyle} to="/dashboard">Dashboard</Link>
          <Link style={linkStyle} to="/profile">Profile</Link>
          <Link style={linkStyle} to="/portfolio">Portfolio</Link>
          <Link style={linkStyle} to="/goals">Goals</Link>
          <Link style={linkStyle} to="/reports">Reports</Link>
          <Link style={linkStyle} to="/investments">Investments</Link>
          <Link style={linkStyle} to="/transactions">Transactions</Link>


        </nav>

        {user && (
          <button
            onClick={handleLogout}
            style={{
              marginTop: "40px",
              padding: "10px",
              width: "100%",
              background: "#EF4444",
              border: "none",
              color: "#fff",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: "#F9FAFB" }}>{children}</div>
    </div>
  );
}

const linkStyle = {
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "500",
};

export default SidebarLayout;

