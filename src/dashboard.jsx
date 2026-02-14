import React, { useEffect, useState, useCallback } from "react";
import SidebarLayout from "./sidebar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import API_BASE_URL from "./api";
// ✅ ADDED

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function Dashboard({ refreshTrigger }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "User";

  const [activeGoalsCount, setActiveGoalsCount] = useState(0);
  const [investedAmount, setInvestedAmount] = useState(0);
  const [totalWealth, setTotalWealth] = useState(0);
  const [portfolioGrowth, setPortfolioGrowth] = useState(0);
  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [{ data: [], borderColor: "#10B981", backgroundColor: "rgba(16,185,129,0.2)", tension: 0.4 }]
  });

  /* -------- FETCH GOALS -------- */
  const fetchActiveGoals = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`${API_BASE_URL}/goals/${user.id}`);   // ✅ CHANGED
    const data = await res.json();
    const activeCount = data.filter(g => g.status === "Active").length;
    setActiveGoalsCount(activeCount);
  }, [user]);

  /* -------- FETCH INVESTMENTS -------- */
  const fetchInvestments = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`${API_BASE_URL}/investments/${user.id}`);  // ✅ CHANGED
    const data = await res.json();

    const totalCurrentValue = data.reduce((sum, inv) => sum + Number(inv.current_value || 0), 0);
    const totalCost = data.reduce((sum, inv) => sum + Number(inv.cost_basis || 0), 0);

    setInvestedAmount(totalCurrentValue);
    setTotalWealth(totalCurrentValue);
    setPortfolioGrowth(totalCost > 0 ? ((totalCurrentValue - totalCost) / totalCost * 100).toFixed(2) : 0);

    // Simulated growth line chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const simulatedValues = months.map((_, idx) => totalCurrentValue * (0.9 + 0.02 * idx));

    setLineData({
      labels: months,
      datasets: [{
        data: simulatedValues,
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.4
      }]
    });
  }, [user]);

  useEffect(() => {
    fetchActiveGoals();
    fetchInvestments();
  }, [fetchActiveGoals, fetchInvestments, refreshTrigger]);

  const cardStyle = {
    flex: "1 1 180px",
    padding: "15px",
    borderRadius: "10px",
    color: "#fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  };

  return (
    <SidebarLayout>
      <div style={{ padding: "20px", background: "#F3F4F6", minHeight: "100vh" }}>
        <h1 style={{ color: "#1E3A8A", marginBottom: "5px" }}>Welcome {userName}</h1>
        <h3 style={{ marginBottom: "20px", color: "#374151" }}>Dashboard</h3>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <div style={{ ...cardStyle, background: "#2563EB" }}>
            <h4>Total Wealth</h4>
            <p>₹{totalWealth.toLocaleString()}</p>
          </div>

          <div style={{ ...cardStyle, background: "#F59E0B" }}>
            <h4>Invested Amount</h4>
            <p>₹{investedAmount.toLocaleString()}</p>
          </div>

          <div style={{ ...cardStyle, background: "#10B981" }}>
            <h4>Portfolio Growth</h4>
            <p>{portfolioGrowth}%</p>
          </div>

          <div style={{ ...cardStyle, background: "#EF4444" }}>
            <h4>Active Goals</h4>
            <p>{activeGoalsCount}</p>
          </div>
        </div>

        {/* Line chart */}
        <div style={{ background: "#fff", marginTop: "20px", padding: "20px", borderRadius: "12px", height: "260px" }}>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </SidebarLayout>
  );
}

export default Dashboard;
