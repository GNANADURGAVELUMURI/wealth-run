import React, { useEffect, useState } from "react";
import SidebarLayout from "./sidebar";
import API_BASE_URL from "./api";
  // ✅ ADDED

function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  /* -------- FETCH INVESTMENTS -------- */
  const fetchInvestments = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE_URL}/investments/${user.id}`); // ✅ CHANGED
      const data = await res.json();
      setInvestments(data);
    } catch (err) {
      console.error("Failed to fetch investments", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------- REFRESH PRICES -------- */
  const refreshPrices = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/investments/refresh/${user.id}` // ✅ CHANGED
      );

      if (!res.ok) throw new Error("Refresh failed");

      await fetchInvestments();
      alert("Prices refreshed successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to refresh prices");
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  /* -------- DELETE INVESTMENT -------- */
  const deleteInvestment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this investment?")) return;

    try {
      await fetch(`${API_BASE_URL}/investments/${id}`, {  // ✅ CHANGED
        method: "DELETE",
      });

      await fetchInvestments();
    } catch (err) {
      console.error("Failed to delete investment", err);
    }
  };

  /* -------- RISK CALCULATION -------- */
  const getRiskProfile = (inv) => {
    const value = inv.current_value;

    if (value < 50000) {
      return { label: "Low", color: "green" };
    } else if (value < 200000) {
      return { label: "Medium", color: "#F59E0B" };
    } else {
      return { label: "High", color: "#EF4444" };
    }
  };

  if (!user) {
    return (
      <SidebarLayout>
        <p style={{ padding: "30px" }}>Please login</p>
      </SidebarLayout>
    );
  }

  if (loading) {
    return (
      <SidebarLayout>
        <p style={{ padding: "30px" }}>Loading investments...</p>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div style={{ padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>📈 Investments</h2>

          <button onClick={refreshPrices} style={refreshBtn}>
            🔄 Refresh Prices
          </button>
        </div>

        {investments.length === 0 && (
          <p>No investments yet. Add BUY transactions to create them.</p>
        )}

        {investments.map((inv) => {
          const risk = getRiskProfile(inv);

          return (
            <div key={inv.id} style={card}>
              <h3>{inv.symbol}</h3>

              <p>
                Status:{" "}
                <strong style={{ color: inv.units > 0 ? "green" : "gray" }}>
                  {inv.units > 0 ? "Active" : "Inactive"}
                </strong>
              </p>

              <p>Units: <strong>{inv.units}</strong></p>
              <p>Avg Buy Price: ₹{inv.avg_buy_price.toFixed(2)}</p>
              <p>Cost Basis: ₹{inv.cost_basis.toFixed(2)}</p>
              <p>Current Value: ₹{inv.current_value.toFixed(2)}</p>
              <p>Last Price: ₹{inv.last_price.toFixed(2)}</p>

              <p>
                Last Price Time:{" "}
                <strong>
                  {inv.last_price_at
                    ? new Date(inv.last_price_at).toLocaleString()
                    : "-"}
                </strong>
              </p>

              {/* ✅ RISK PROFILE */}
              <p>
                Risk Level:{" "}
                <strong style={{ color: risk.color }}>
                  {risk.label}
                </strong>
              </p>

              <button style={deleteBtn} onClick={() => deleteInvestment(inv.id)}>
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </SidebarLayout>
  );
}

/* -------- STYLES -------- */
const card = {
  background: "#fff",
  padding: "16px",
  marginBottom: "12px",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
};

const refreshBtn = {
  padding: "2px 8px",
  height: "28px",
  lineHeight: "18px",
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontSize: "12px",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#EF4444",
  color: "#fff",
  padding: "10px",
  border: "none",
  borderRadius: "6px",
  marginTop: "8px",
  cursor: "pointer",
};

export default Investments;
