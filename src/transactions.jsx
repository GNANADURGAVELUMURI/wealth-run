import React, { useEffect, useState, useContext } from "react";
import SidebarLayout from "./sidebar";
import { UserContext } from "./app";
import API_BASE_URL from "./api";

function Transactions({ refreshInvestments, refreshGoals }) {
  const { user } = useContext(UserContext);

  const [transactionType, setTransactionType] = useState("Investment");
  const [list, setList] = useState([]);
  const [goals, setGoals] = useState([]);
  const [goalMap, setGoalMap] = useState({}); // ✅ map goalId -> goalName

  // Investment fields
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState("BUY");
  const [quantity, setQuantity] = useState("");
  const [fees, setFees] = useState("");

  // Goal fields
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [contribution, setContribution] = useState("");

  const indianStocks = [
    { symbol: "ITC", name: "ITC Ltd" },
    { symbol: "RELIANCE", name: "Reliance Industries" },
    { symbol: "INFY", name: "Infosys Ltd" },
    { symbol: "HDFCBANK", name: "HDFC Bank" },
    { symbol: "TCS", name: "Tata Consultancy Services" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
    { symbol: "ICICIBANK", name: "ICICI Bank" },
    { symbol: "SBIN", name: "State Bank of India" },
  ];

  /* -------- FETCH GOALS -------- */
  const fetchGoals = async () => {
    if (!user) return;

    const res = await fetch(`${API_BASE_URL}/goals/${user.id}`);
    const allGoals = await res.json();

    const activeGoals = allGoals.filter((g) => g.status === "Active");
    setGoals(activeGoals);

    // ✅ Build goalId -> goalName mapping
    const map = {};
    allGoals.forEach((g) => {
      map[g.id] = g.goal_type;
    });
    setGoalMap(map);
  };

  /* -------- FETCH BOTH TRANSACTION TYPES -------- */
  const fetchTransactions = async () => {
    if (!user) return;

    const invRes = await fetch(`${API_BASE_URL}/transactions/${user.id}`);
    const invData = await invRes.json();

    const goalRes = await fetch(`${API_BASE_URL}/goal-transactions/${user.id}`);
    const goalData = await goalRes.json();

    const formattedGoals = goalData.map((g) => ({
      ...g,
      isGoal: true,
    }));

    setList([...invData, ...formattedGoals]);
  };

  useEffect(() => {
    fetchGoals();
    fetchTransactions();
  }, [user]);

  const resetForm = () => {
    setSymbol("");
    setType("BUY");
    setQuantity("");
    setFees("");
    setSelectedGoalId("");
    setContribution("");
  };

  /* -------- SUBMIT -------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    let payload = {};
    let url = "";

    if (transactionType === "Investment") {
      payload = {
        symbol,
        type,
        quantity: Number(quantity),
        fees: Number(fees || 0),
        user_id: user.id,
      };
      url = `${API_BASE_URL}/transactions`;
    } else {
      payload = {
        goal_id: Number(selectedGoalId),
        contribution: Number(contribution),
        user_id: user.id,
      };
      url = `${API_BASE_URL}/goal-transactions`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Transaction failed");
      return;
    }

    resetForm();
    fetchTransactions();

    if (refreshInvestments) refreshInvestments();
    if (refreshGoals) refreshGoals();
  };

  /* -------- DELETE -------- */
  const deleteTransaction = async (id, isGoal) => {
    const url = isGoal
      ? `${API_BASE_URL}/goal-transactions/${id}`
      : `${API_BASE_URL}/transactions/${id}`;

    await fetch(url, { method: "DELETE" });
    fetchTransactions();
  };

  return (
    <SidebarLayout>
      <div style={{ padding: "30px" }}>
        <h2>💳 Transactions</h2>

        <div style={{ marginBottom: "20px" }}>
          <label>
            Transaction Type:
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="Investment">Investment</option>
              <option value="Goal">Goal Contribution</option>
            </select>
          </label>
        </div>

        <form onSubmit={handleSubmit} style={card}>
          {transactionType === "Investment" ? (
            <>
              <select style={input} value={symbol} onChange={(e) => setSymbol(e.target.value)} required>
                <option value="">Select Stock</option>
                {indianStocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.name} ({s.symbol})
                  </option>
                ))}
              </select>

              <select style={input} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>

              <input style={input} type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />

              <input style={input} type="number" placeholder="Fees" value={fees} onChange={(e) => setFees(e.target.value)} />
            </>
          ) : (
            <>
              <select style={input} value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)} required>
                <option value="">Select Active Goal</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.goal_type} (Target ₹{g.target_amount})
                  </option>
                ))}
              </select>

              <input style={input} type="number" placeholder="Contribution ₹" value={contribution} onChange={(e) => setContribution(e.target.value)} required />
            </>
          )}

          <button style={primaryBtn}>Add Transaction</button>
        </form>

        {list.map((tx) => (
          <div key={`${tx.isGoal ? "goal" : "inv"}-${tx.id}`} style={card}>

            {tx.isGoal ? (
              <>
                <strong>🎯 {goalMap[tx.goal_id] || "Goal"}</strong>
                <p>Contribution: ₹{tx.contribution}</p>
              </>
            ) : (
              <>
                <strong>{tx.symbol}</strong>
                <p>{tx.type} | Qty: {tx.quantity}</p>
                <p>Fees: ₹{tx.fees}</p>
              </>
            )}

            <button style={deleteBtn} onClick={() => deleteTransaction(tx.id, tx.isGoal)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
}

const input = { padding: "10px", borderRadius: "6px", border: "1px solid #D1D5DB", marginBottom: "12px" };
const primaryBtn = { background: "#2563EB", color: "#fff", padding: "10px", border: "none", borderRadius: "6px" };
const deleteBtn = { background: "#EF4444", color: "#fff", padding: "8px", border: "none", borderRadius: "6px", marginTop: "8px" };
const card = { background: "#fff", padding: "16px", marginBottom: "12px", borderRadius: "10px" };

export default Transactions;
