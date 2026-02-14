import React, { useEffect, useState } from "react";
import SidebarLayout from "./sidebar";
import API_BASE_URL from "../api";   // ✅ ADDED
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function ReportsAnalysis() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [investments, setInvestments] = useState([]);
  const [goals, setGoals] = useState([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE_URL}/investments/${user.id}`)   // ✅ CHANGED
      .then((res) => res.json())
      .then(setInvestments)
      .catch(console.error);

    fetch(`${API_BASE_URL}/goals/${user.id}`)         // ✅ CHANGED
      .then((res) => res.json())
      .then(setGoals)
      .catch(() => setGoals([]));
  }, [user]);

  /* ================= CALCULATIONS ================= */
  const totalCost = investments.reduce(
    (a, b) => a + Number(b.cost_basis || 0),
    0
  );

  const totalValue = investments.reduce(
    (a, b) => a + Number(b.current_value || 0),
    0
  );

  const totalReturn = totalValue - totalCost;

  const bestAsset =
    investments.length === 0
      ? "-"
      : investments.reduce((best, cur) =>
          cur.current_value - cur.cost_basis >
          best.current_value - best.cost_basis
            ? cur
            : best
        ).symbol || "-";

  const riskProfile =
    investments.length === 0
      ? "Low"
      : totalValue > totalCost * 1.5
      ? "High"
      : "Medium";

  /* ================= MONTHLY GRAPH ================= */
  const monthlyMap = {};

  investments.forEach((i) => {
    const date = i.last_price_at ? new Date(i.last_price_at) : new Date();

    const month = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    monthlyMap[month] = (monthlyMap[month] || 0) + Number(i.cost_basis || 0);
  });

  const chartData = {
    labels: Object.keys(monthlyMap),
    datasets: [
      {
        label: "Investment Amount",
        data: Object.values(monthlyMap),
        backgroundColor: "#2563EB",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  /* ================= PDF ================= */
  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Wealth Tracker Report", 105, y, { align: "center" });

    y += 12;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Name: ${String(user?.name || "N/A")}`, 20, y);
    y += 6;
    doc.text(`Email: ${String(user?.email || "N/A")}`, 20, y);

    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Portfolio Summary", 20, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Total Invested: ₹${totalCost.toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Total Wealth: ₹${totalValue.toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Profit / Loss: ₹${totalReturn.toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Best Asset: ${bestAsset}`, 20, y);
    y += 6;
    doc.text(`Risk Profile: ${riskProfile}`, 20, y);

    y += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Investments", 20, y);
    y += 7;

    doc.setFont("helvetica", "normal");

    investments.forEach((i, idx) => {
      const invested = Number(i.cost_basis || 0).toFixed(2);
      const current = Number(i.current_value || 0).toFixed(2);
      const pnl = (current - invested).toFixed(2);

      doc.text(
        `${idx + 1}. ${String(i.symbol || "-")} | ₹${invested} | ₹${current} | ₹${pnl}`,
        20,
        y
      );
      y += 6;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("wealth-tracker-report.pdf");
  };

  return (
    <SidebarLayout>
      <div style={{ padding: "30px", background: "#F3F4F6", minHeight: "100vh" }}>
        <h2 style={{ color: "#1E3A8A", marginBottom: "20px" }}>Reports</h2>

        <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
          <div style={{ background: "#2563EB", color: "#fff", padding: "16px", borderRadius: "12px" }}>
            ₹{totalCost.toFixed(0)}<div>Total Invested</div>
          </div>

          <div style={{ background: "#10B981", color: "#fff", padding: "16px", borderRadius: "12px" }}>
            ₹{totalReturn.toFixed(0)}<div>Return Earned</div>
          </div>

          <div style={{ background: "#2563EB", color: "#fff", padding: "16px", borderRadius: "12px" }}>
            {bestAsset}<div>Best Asset</div>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "20px", borderRadius: "14px", height: "420px" }}>
          <Bar data={chartData} options={options} />
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button onClick={downloadPDF}>
            Download PDF Report
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
}

export default ReportsAnalysis;
