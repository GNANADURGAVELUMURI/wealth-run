import React, { useEffect, useState, useContext } from "react";
import SidebarLayout from "./sidebar";
import { UserContext } from "./app";
import API_BASE_URL from "./api";
   // ✅ ADDED

function Transactions({ refreshInvestments, refreshGoals }) {
  const { user } = useContext(UserContext);

  const [transactionType, setTransactionType] = useState("Investment");
  const [list, setList] = useState([]);
  const [goals, setGoals] = useState([]);

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

  /* -------- FETCH TRANSACTIONS -------- */
  const fetchTransactions = async () => {
    if (!user) return;
    const res = await fetch(`${API_BASE_URL}/transactions/${user.id}`); // ✅ CHANGED
    setList(await res.json());
  };

  /* -------- FETCH GOALS -------- */
  const fetchGoals = async () => {
    if (!user) return;
    const res = await fetch(`${API_BASE_URL}/goals/${user.id}`); // ✅ CHANGED
    const allGoals = await res.json();
    const activeGoals = allGoals.filter((g) => g.status === "Active");
    setGoals(activeGoals);
  };

  useEffect(() => {
    fetchTransactions();
    fetchGoals();
  }, [user]);

  const resetForm = () => {
    setSymbol("");
    setType("BUY");
    setQuantity("");
    setFees("");
    setSelectedGoalId("");
    setContribution("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    let payload = {};

    if (transactionType === "Investment") {
      if (type === "SELL") {
        const invRes = await fetch(`${API_BASE_URL}/investments/${user.id}`); // ✅ CHANGED
        const investments = await invRes.json();
        const inv = investments.find((i) => i.symbol === symbol.toUpperCase());
        if (!inv || Number(quantity) > inv.units) {
          alert("Cannot SELL more units than available!");
          return;
        }
      }

      payload = {
        symbol,
        type,
        quantity: Number(quantity),
        fees: Number(fees || 0),
        user_id: user.id,
      };
    } else if (transactionType === "Goal") {
      payload = {
        goal_id: Number(selectedGoalId),
        contribution: Number(contribution),
        user_id: user.id,
      };
    }

    const url =
      transactionType === "Investment"
        ? `${API_BASE_URL}/transactions`         // ✅ CHANGED
        : `${API_BASE_URL}/goal-transactions`;   // ✅ CHANGED

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    alert(text);

    if (!res.ok) return;

    resetForm();
    fetchTransactions();
    if (transactionType === "Investment" && refreshInvestments) refreshInvestments();
    if (transactionType === "Goal" && refreshGoals) refreshGoals();
  };

  const deleteTransaction = async (id) => {
    await fetch(`${API_BASE_URL}/transactions/${id}`, { method: "DELETE" }); // ✅ CHANGED
    fetchTransactions();
    if (refreshInvestments) refreshInvestments();
    if (refreshGoals) refreshGoals();
  };

  return (
    <SidebarLayout>
      {!user ? (
        <p>Loading...</p>
      ) : (
        <div style={{ padding: "30px" }}>
          <h2>💳 Transactions</h2>

          <div style={{ marginBottom: "20px" }}>
            <label>
              Transaction Type:{" "}
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
                      {g.goal_type} (Target: ₹{g.target_amount})
                    </option>
                  ))}
                </select>

                <input style={input} type="number" placeholder="Contribution Amount (₹)" value={contribution} onChange={(e) => setContribution(e.target.value)} required />
              </>
            )}

            <button style={primaryBtn}>Add Transaction</button>
          </form>

          {list.map((tx) => (
            <div key={tx.id} style={card}>
              {tx.goal_id ? (
                <>
                  <strong>Goal Contribution</strong>
                  <p>₹{tx.contribution}</p>
                </>
              ) : (
                <>
                  <strong>{tx.symbol}</strong>
                  <p>{tx.type} | Qty: {tx.quantity} @ ₹{tx.price}</p>
                  <p>Fees: ₹{tx.fees}</p>
                </>
              )}

              <button style={deleteBtn} onClick={() => deleteTransaction(tx.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </SidebarLayout>
  );
}

const input = { padding: "10px", borderRadius: "6px", border: "1px solid #D1D5DB", marginBottom: "12px" };
const primaryBtn = { background: "#2563EB", color: "#fff", padding: "10px", border: "none", borderRadius: "6px" };
const deleteBtn = { background: "#EF4444", color: "#fff", padding: "8px", border: "none", borderRadius: "6px", marginTop: "8px" };
const card = { background: "#fff", padding: "16px", marginBottom: "12px", borderRadius: "10px" };

export default Transactions;

