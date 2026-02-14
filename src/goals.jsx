import React, { useState, useEffect, useContext, useCallback } from "react";
import SidebarLayout from "./sidebar";
import { UserContext } from "./app";
import API_BASE_URL from "../api";   // ✅ ADDED

function Goals() {
  const { user: contextUser } = useContext(UserContext);
  const user = contextUser || JSON.parse(localStorage.getItem("user"));

  const [goals, setGoals] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [plannerMap, setPlannerMap] = useState({});
  const [editGoalId, setEditGoalId] = useState(null);
  const [editData, setEditData] = useState({});

  const [goalType, setGoalType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [targetDate, setTargetDate] = useState("");

  /* -------- FETCH GOALS -------- */
  const fetchGoals = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`${API_BASE_URL}/goals/${user.id}`);   // ✅ CHANGED
    const data = await res.json();
    setGoals(data);
  }, [user]);

  /* -------- FETCH PROGRESS -------- */
  const fetchProgress = async (goalId) => {
    const res = await fetch(`${API_BASE_URL}/goals/progress/${goalId}`);  // ✅ CHANGED
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

  const calculateProgress = (goal) => {
    const paid = progressMap[goal.id] || 0;
    return Math.min(((paid / goal.target_amount) * 100).toFixed(1), 100);
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

    await fetch(`${API_BASE_URL}/goals`, {   // ✅ CHANGED
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

  /* -------- UPDATE GOAL -------- */
  const updateGoal = async (id) => {
    await fetch(`${API_BASE_URL}/goals/${id}`, {   // ✅ CHANGED
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
    await fetch(`${API_BASE_URL}/goals/${id}`, { method: "DELETE" });   // ✅ CHANGED
    fetchGoals();
  };

  return (
    <SidebarLayout>
      <div style={styles.container}>
        <h2>🎯 Financial Goals</h2>

        <form onSubmit={addGoal} style={styles.addForm}>
          <input style={styles.input} placeholder="Goal Type" value={goalType} onChange={(e) => setGoalType(e.target.value)} />
          <input style={styles.input} type="number" placeholder="Target Amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
          <input style={styles.input} type="number" placeholder="Monthly Contribution" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} />
          <input style={styles.input} type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          <button style={styles.addBtn}>Add Goal</button>
        </form>

        {goals.map((g) => {
          const progress = calculateProgress(g);
          const paid = progressMap[g.id] || 0;
          const planner = plannerMap[g.id] || plannerDetails(g, progress);

          return (
            <div key={g.id} style={styles.card}>
              <h4>{g.goal_type}</h4>
              <p>Status: <strong style={{ color: "green" }}>Active</strong></p>
              <p>🎯 Target: ₹{g.target_amount}</p>
              <p>💰 Paid: ₹{paid}</p>
              <p>📈 Monthly: ₹{g.monthly_contribution}</p>

              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setPlannerMap({ ...plannerMap, [g.id]: plannerDetails(g, p) });
                }}
                style={{ width: "100%" }}
              />

              <small>
                ₹{planner.amount.toFixed(0)} | {planner.months} months | {planner.date}
              </small>
              <br />
              <button style={styles.deleteBtn} onClick={() => deleteGoal(g.id)}>Delete</button>
            </div>
          );
        })}
      </div>
    </SidebarLayout>
  );
}

export default Goals;
