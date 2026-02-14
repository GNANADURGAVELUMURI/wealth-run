import React, { useEffect, useState } from "react";
import SidebarLayout from "./sidebar";
import API_BASE_URL from "./api";
   // ✅ ADDED

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const userName = user?.name || "N/A";
const userEmail = user?.email || "N/A";
  const [risk, setRisk] = useState({
    level: "Low",
    percent: 20,
    color: "#22C55E",
    label: "Low risk with stable planning",
  });

  /* ================= RISK CALCULATION ================= */
  useEffect(() => {
    if (!user) return;

    const calculateRisk = async () => {
      try {
        const goalsRes = await fetch(`${API_BASE_URL}/goals/${user.id}`);         // ✅ CHANGED
        const invRes = await fetch(`${API_BASE_URL}/investments/${user.id}`);     // ✅ CHANGED

        const goals = await goalsRes.json();
        const investments = await invRes.json();

        let riskScore = 0;

        /* ---------- GOAL PRESSURE ---------- */
        goals.forEach((g) => {
          const months =
            (new Date(g.target_date) - new Date()) /
            (1000 * 60 * 60 * 24 * 30);

          if (months <= 12) riskScore += 20;
          else if (months <= 36) riskScore += 10;
        });

        /* ---------- INVESTMENT EXPOSURE ---------- */
        investments.forEach((inv) => {
          if (inv.current_value > 200000) riskScore += 25;
          else if (inv.current_value > 50000) riskScore += 15;
          else riskScore += 5;
        });

        riskScore = Math.min(100, Math.round(riskScore));

        if (riskScore <= 40) {
          setRisk({
            level: "Low",
            percent: riskScore,
            color: "#22C55E",
            label: "Conservative & stable planning",
          });
        } else if (riskScore <= 70) {
          setRisk({
            level: "Medium",
            percent: riskScore,
            color: "#F59E0B",
            label: "Balanced risk with growth focus",
          });
        } else {
          setRisk({
            level: "High",
            percent: riskScore,
            color: "#EF4444",
            label: "Aggressive growth-oriented strategy",
          });
        }
      } catch (err) {
        console.error("Risk calculation failed", err);
      }
    };

    calculateRisk();
  }, [user]);

  return (
    <SidebarLayout>
      <div
        style={{
          padding: "20px",
          background: "#F3F4F6",
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2 style={{ color: "#1E3A8A", marginBottom: "15px" }}>
          Profile
        </h2>

        {/* PERSONAL DETAILS */}
        <div style={cardStyle}>
          <div style={headerStyle}>Personal Details</div>
          <div>
            <div style={rowStyle}>
              <strong>Name:</strong> {userName}
            </div>
            <div style={rowStyle}>
              <strong>Email:</strong> {userEmail}
            </div>
            <div style={rowStyle}>
              <strong>Occupation:</strong> Software Engineer
            </div>
          </div>
        </div>

        {/* RISK PROFILE */}
        <div style={cardStyle}>
          <div style={headerStyle}>Risk Profile</div>

          <div style={{ padding: "12px 16px" }}>
            <div style={{ marginBottom: "6px" }}>
              <strong>Risk Level:</strong>{" "}
              <span style={{ color: risk.color }}>
                {risk.level}
              </span>
            </div>

            <div style={{ marginBottom: "6px" }}>
              <strong>Risk Score:</strong> {risk.percent} / 100
            </div>

            <div style={{
              background: "#E5E7EB",
              height: "8px",
              borderRadius: "6px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${risk.percent}%`,
                height: "8px",
                background: risk.color,
              }} />
            </div>

            <small style={{ color: "#6B7280" }}>
              {risk.label}
            </small>
          </div>
        </div>

        {/* KYC STATUS */}
        <div style={cardStyle}>
          <div style={headerStyle}>KYC Status</div>
          <div>
            <div style={rowStyle}>✅ Aadhar Verified</div>
            <div style={rowStyle}>✅ PAN Verified</div>
            <div style={rowStyle}>✅ Bank Account Verified</div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

/* STYLES */
const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginBottom: "16px",
  overflow: "hidden",
};

const headerStyle = {
  backgroundColor: "#2563EB",
  color: "#ffffff",
  padding: "12px 16px",
  fontWeight: "600",
};

const rowStyle = {
  padding: "12px 16px",
  borderBottom: "1px solid #E5E7EB",
};

export default Profile;



