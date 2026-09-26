// MoneyMap frontend logic
// This page talks to the MoneyMap backend, deployed separately on Render:
// https://github.com/david555787/moneymap-backend
const API_BASE = "https://moneymap-backend-es0y.onrender.com";

const form = document.getElementById("expense-form");
const errorMessage = document.getElementById("error-message");
const expenseList = document.getElementById("expense-list");
const summaryList = document.getElementById("summary-list");

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

async function loadExpenses() {
  try {
    const res = await fetch(`${API_BASE}/expenses`);
    if (!res.ok) throw new Error("Failed to load expenses");
    const expenses = await res.json();
    renderExpenses(expenses);
  } catch (err) {
    showError("Could not load expenses. The backend may be waking up — try again in a moment.");
  }
}

async function loadSummary() {
  try {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error("Failed to load summary");
    const summary = await res.json();
    renderSummary(summary);
  } catch (err) {
    // Summary failing quietly is fine; the expense list error already covers it.
  }
}

function renderExpenses(expenses) {
  expenseList.innerHTML = "";
  if (expenses.length === 0) {
    expenseList.innerHTML = "<li class='empty'>No expenses yet.</li>";
    return;
  }
  for (const e of expenses) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="amount">$${e.amount.toFixed(2)}</span>
      <span class="category">${e.category}</span>
      <span class="note">${e.note || ""}</span>
      <span class="date">${e.date}</span>
      <button class="delete-btn" data-id="${e.id}">×</button>
    `;
    expenseList.appendChild(li);
  }
}

function renderSummary(summary) {
  summaryList.innerHTML = "";
  const categories = Object.keys(summary);
  if (categories.length === 0) {
    summaryList.innerHTML = "<li class='empty'>No spending yet.</li>";
    return;
  }
  for (const category of categories) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${category}</span><span>$${summary[category].toFixed(2)}</span>`;
    summaryList.appendChild(li);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;
  const date = document.getElementById("date").value;

  try {
    const res = await fetch(`${API_BASE}/add_expense`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, category, note, date }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to add expense");
    }

    form.reset();
    await loadExpenses();
    await loadSummary();
  } catch (err) {
    showError(err.message || "Something went wrong adding that expense.");
  }
});

expenseList.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-btn")) return;
  const id = e.target.dataset.id;

  try {
    const res = await fetch(`${API_BASE}/expense/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete expense");
    await loadExpenses();
    await loadSummary();
  } catch (err) {
    showError("Could not delete that expense.");
  }
});

loadExpenses();
loadSummary();
