import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./app";
import API_BASE_URL from "./api";
  // ✅ Uses deployed backend

function Signup() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {   // ✅ CHANGED FROM LOCALHOST
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setMessage("Account created! Please login.");
        setFormData({ name: "", email: "", password: "" });

        navigate("/login"); // Redirect to login
      } else {
        const errData = await response.json();
        setError(errData.detail || "Signup failed ❌");
      }
    } catch (err) {
      console.error(err);
      setError("Server not reachable ❌");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSignup} style={styles.card}>
        <h2 style={styles.heading}>Create Account</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Sign Up
        </button>

        {message && <p style={{ ...styles.message, color: "green" }}>{message}</p>}
        {error && <p style={{ ...styles.message, color: "red" }}>{error}</p>}

        <p style={styles.switchText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

/* ✅ UI Styles (UNCHANGED) */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    width: "360px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    textAlign: "center",
  },
  heading: {
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    fontSize: "14px",
  },
  switchText: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#6B7280",
  },
  link: {
    color: "#2563EB",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Signup;
