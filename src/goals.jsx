import React, { useState, useEffect, useContext, useCallback } from "react";
import SidebarLayout from "./sidebar";
import { UserContext } from "./app";
import API_BASE_URL from "./api";

function Goals() {
  const { user: contextUser } = useContext(UserContext);
  const user = contextUser || JSON.parse(localStorage.getItem("user"));

  const [goals, setGoals] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [simulationMap, setSimulationMap] = useState({});
  const [editGoalId, setEditGoalId] = useState(null);
  const [editData, setEditData] = useState({});

  const [goalType, setGoalType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [targetDate, setTargetDate] = useState("");

  /* -------- FETCH GOALS -------- */
  const fetchGoals = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`${API_BASE_URL}/goals/${user.id}`);
    const data = await res.json();
    setGoals(data);
  }, [user]);

  /* -------- FETCH PROGRESS -------- */
  const fetchProgress = async (goalId) => {
    const res = await fetch(`${API_BASE_URL}/goals/progress/${goalId}`);
    const data = await res.json();
    return data.total_paid || 0;
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    const loadProgress = async () => {
      let map = {};
      for (let g of goals) {
        map[g.id] = await fetchProgress(g.id);
      }
      setProgressMap(map);
    };
    if (goals.length) loadProgress();
  }, [goals]);

  const getActualPercent = (goal) => {
    const paid = progressMap[goal.id] || 0;
    return Math.min((paid / goal.target_amount) * 100, 100);
  };

  const getDisplayedPercent = (goal) => {
    return simulationMap[goal.id] ?? getActualPercent(goal);
  };

  const plannerDetails = (goal, percent) => {
    const amount = (goal.target_amount * percent) / 100;
    const months = Math.ceil(amount / goal.monthly_contribution);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return { amount, months, date: date.toDateString() };
  };

  /* -------- ADD GOAL -------- */
  const addGoal = async (e) => {
    e.preventDefault();

    const payload = {
      goal_type: goalType,
      target_amount: Number(targetAmount),
      monthly_contribution: Number(monthlyContribution),
      target_date: targetDate,
      status: "Active",
      user_id: user.id,
    };

    await fetch(`${API_BASE_URL}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setGoalType("");
    setTargetAmount("");
    setMonthlyContribution("");
    setTargetDate("");
    fetchGoals();
  };

  /* -------- UPDATE GOAL (EDIT SAVE) -------- */
  const updateGoal = async (id) => {
    await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editData, user_id: user.id }),
    });

    setEditGoalId(null);
    fetchGoals();
  };

  /* -------- DELETE GOAL -------- */
  const deleteGoal = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    await fetch(`${API_BASE_URL}/goals/${id}`, { method: "DELETE" });
    fetchGoals();
  };

  return (
    <SidebarLayout>
      <div style={styles.container}>
        <h2>🎯 Financial Goals</h2>

        {/* ADD FORM */}
        <form onSubmit={addGoal} style={styles.addForm}>
          <input style={styles.input} placeholder="Goal Type" value={goalType} onChange={(e) => setGoalType(e.target.value)} />
          <input style={styles.input} type="number" placeholder="Target Amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
          <input style={styles.input} type="number" placeholder="Monthly Contribution" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} />
          <input style={styles.input} type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          <button style={styles.addBtn}>Add Goal</button>
        </form>

        {goals.map((g) => {
          const actualPercent = getActualPercent(g);
          const displayPercent = getDisplayedPercent(g);
          const paid = progressMap[g.id] || 0;
          const planner = plannerDetails(g, displayPercent);

          return (
            <div key={g.id} style={styles.card}>

              {/* ===== EDIT MODE ===== */}
              {editGoalId === g.id ? (
                <>
                  <input style={styles.input} value={editData.goal_type}
                    onChange={(e) => setEditData({ ...editData, goal_type: e.target.value })} />

                  <input style={styles.input} type="number" value={editData.target_amount}
                    onChange={(e) => setEditData({ ...editData, target_amount: Number(e.target.value) })} />

                  <input style={styles.input} type="number" value={editData.monthly_contribution}
                    onChange={(e) => setEditData({ ...editData, monthly_contribution: Number(e.target.value) })} />

                  <button style={styles.saveBtn} onClick={() => updateGoal(g.id)}>Save</button>
                </>
              ) : (
                <>
                  <h4>🎯 {g.goal_type}</h4>
                  <p>🎯 Target Amount: ₹{g.target_amount}</p>
                  <p>💰 Saved: ₹{paid}</p>
                  <p>📈 Monthly Contribution: ₹{g.monthly_contribution}</p>
                  <p>✅ Achieved: {actualPercent.toFixed(1)}%</p>

                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${displayPercent}%` }} />
                  </div>

                  <input
                    type="range"
                    min={actualPercent}
                    max="100"
                    value={displayPercent}
                    onChange={(e) =>
                      setSimulationMap({ ...simulationMap, [g.id]: Number(e.target.value) })
                    }
                  />

                  <small>
                    Future Projection → ₹{planner.amount.toFixed(0)} | {planner.months} months | {planner.date}
                  </small>

                  <br />

                  <button style={styles.editBtn} onClick={() => {
                    setEditGoalId(g.id);
                    setEditData(g);
                  }}>Edit</button>

                  <button style={styles.deleteBtn} onClick={() => deleteGoal(g.id)}>Delete</button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </SidebarLayout>
  );
}

/* -------- STYLES -------- */
const styles = {
  container: { padding: "30px", background: "#f4f6f9", minHeight: "100vh" },
  card: { background: "#fff", padding: "16px", borderRadius: "10px", marginBottom: "15px", boxShadow: "0 3px 8px rgba(0,0,0,0.08)" },
  addForm: { display: "flex", gap: "10px", marginBottom: "20px", background: "#fff", padding: "16px", borderRadius: "10px" },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #D1D5DB", flex: "1", marginBottom: "8px" },
  addBtn: { background: "#2563EB", color: "#fff", padding: "10px", border: "none", borderRadius: "6px" },
  editBtn: { background: "#F59E0B", color: "#fff", padding: "8px", border: "none", borderRadius: "6px", marginRight: "8px" },
  saveBtn: { background: "#10B981", color: "#fff", padding: "8px", border: "none", borderRadius: "6px" },
  deleteBtn: { background: "#EF4444", color: "#fff", padding: "8px", border: "none", borderRadius: "6px" },
  progressBar: { height: "10px", background: "#E5E7EB", borderRadius: "6px", margin: "10px 0" },
  progressFill: { height: "10px", background: "#10B981", borderRadius: "6px" },
};

export default Goals;



