import React, { useEffect, useState, useContext } from "react";
import SidebarLayout from "./sidebar";
import API_BASE_URL from "./api";
  // ✅ Use deployed backend URL
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { UserContext } from "./app";

ChartJS.register(ArcElement, Tooltip, Legend);

function Portfolio() {
  const { user } = useContext(UserContext);
  const [investments, setInvestments] = useState([]);
  const [totalPortfolio, setTotalPortfolio] = useState(0);
  const [loading, setLoading] = useState(false); // For refresh button

  /* ================= FETCH INVESTMENTS ================= */
  const fetchInvestments = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE_URL}/investments/${user.id}`);
      const data = await res.json();
      setInvestments(data);

      // Compute total portfolio
      let total = 0;
      data.forEach((i) => {
        total += i.current_value || 0;
      });
      setTotalPortfolio(total);
    } catch (err) {
      console.error("Failed to fetch investments:", err);
    }
  };

  /* ================= REFRESH PRICES ================= */
  const refreshPrices = async () => {
    if (!user) return;
    setLoading(true);

    try {
      await fetch(`${API_BASE_URL}/investments/refresh/${user.id}`, {
        method: "GET",
      });

      // Reload investments after refresh
      await fetchInvestments();

      alert("Prices refreshed successfully");
    } catch (err) {
      console.error("Failed to refresh prices:", err);
      alert("Failed to refresh prices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  /* ================= PIE CHART DATA ================= */
  const pieData = {
    labels: investments.map((i) => i.symbol),
    datasets: [
      {
        data: investments.map((i) => i.current_value || 0),
        backgroundColor: [
          "#2563EB",
          "#10B981",
          "#F59E0B",
          "#8B5CF6",
          "#EF4444",
          "#F97316",
        ],
        hoverOffset: 10,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "left", labels: { boxWidth: 12, padding: 12 } },
    },
  };

  /* ================= STYLES ================= */
  const cardStyle = {
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    marginBottom: "25px",
  };

  return (
    <SidebarLayout>
      <div style={{ minHeight: "100vh", padding: "30px", background: "#F3F4F6" }}>
        <h2 style={{ marginBottom: "30px", color: "#1E40AF" }}>
          My Portfolio
        </h2>

        {/* ================= REFRESH BUTTON ================= */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <button
            onClick={refreshPrices}
            disabled={loading}
            style={{
              background: "#2563EB",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Refreshing..." : "🔄 Refresh Prices"}
          </button>
        </div>

        {/* ================= TOTAL PORTFOLIO ================= */}
        <div style={{ ...cardStyle, textAlign: "center", marginBottom: "40px" }}>
          <h3>Total Portfolio Value</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            ₹{totalPortfolio.toLocaleString()}
          </p>
        </div>

        {/* ================= ASSET ALLOCATION ================= */}
        <div style={cardStyle}>
          <h4 style={{ marginBottom: "20px", color: "#1E3A8A" }}>
            Asset Allocation
          </h4>

          <div
            style={{
              display: "flex",
              gap: "40px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ width: "300px", height: "300px" }}>
              <Pie data={pieData} options={pieOptions} />
            </div>

            {/* Asset Table */}
            <div style={{ flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Asset</th>
                    <th style={thStyle}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((i, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={tdStyle}>{i.symbol}</td>
                      <td style={tdStyle}>
                        ₹{Number(i.current_value || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= HOLDINGS ================= */}
        <div style={cardStyle}>
          <h4 style={{ marginBottom: "15px", color: "#1E3A8A" }}>Holdings</h4>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#E0F2FE" }}>
                <th style={thStyle}>Asset</th>
                <th style={thStyle}>Units</th>
                <th style={thStyle}>Current Value</th>
                <th style={thStyle}>Avg Buy Price</th>
                <th style={thStyle}>P&L</th>
              </tr>
            </thead>

            <tbody>
              {investments.map((i, idx) => {
                const pnl = (i.current_value || 0) - (i.cost_basis || 0);

                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #E5E7EB" }}>
                    <td style={tdStyle}>{i.symbol}</td>
                    <td style={tdStyle}>{i.units}</td>
                    <td style={tdStyle}>
                      ₹{Number(i.current_value || 0).toFixed(2)}
                    </td>
                    <td style={tdStyle}>
                      ₹{Number(i.avg_buy_price || 0).toFixed(2)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        color: pnl >= 0 ? "#10B981" : "#EF4444",
                      }}
                    >
                      ₹{pnl.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}

/* ================= TABLE STYLES ================= */
const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "2px solid #E5E7EB",
  color: "#1E3A8A",
};

const tdStyle = {
  padding: "12px",
};

export default Portfolio;
