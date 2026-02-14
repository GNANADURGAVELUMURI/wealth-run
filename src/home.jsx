import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          width: "380px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#1E3A8A", marginBottom: "10px" }}>
          Wealth Tracker
        </h2>
        <p style={{ color: "#6B7280", marginBottom: "30px" }}>
          Manage your investments and goals easily
        </p>

        <button
          onClick={() => navigate("/login")}
          style={buttonStyle("#2563EB")}
        >
          Sign In
        </button>

        <button
          onClick={() => navigate("/signup")}
          style={{ ...buttonStyle("#10B981"), marginTop: "12px" }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

const buttonStyle = (bg) => ({
  width: "100%",
  padding: "12px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
});

export default Home;
