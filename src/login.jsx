import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./app";
import API_BASE_URL from "./api";


function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};


  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Login failed");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);

    navigate("/dashboard");
  } catch (error) {
    alert("Server error. Please try again.");
  }
};


  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.heading}>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
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

        <button type="submit" style={styles.loginButton}>
          Login
        </button>

        <button
          type="button"
          onClick={() => navigate("/signup")}
          style={styles.signupButton}
        >
          Create Account
        </button>
      </form>
    </div>
  );
}

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
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    backgroundColor: "#ffffff",
  },
  heading: {
    marginBottom: "25px",
    fontSize: "26px",
    color: "#1E3A8A", // deep blue
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "14px",
  },
  loginButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563EB", // blue
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "12px",
  },
  signupButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#10B981", // green
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Login;
