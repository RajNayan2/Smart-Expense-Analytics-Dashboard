/**************** STORAGE ****************/
function getData() {
    return JSON.parse(localStorage.getItem("financeData")) || [];
}

function saveData(data) {
    localStorage.setItem("financeData", JSON.stringify(data));
}

/**************** GLOBAL ****************/
let pieChart, barChart, monthPieChart;
let hiddenTransactions = [];

/**************** TAB SWITCH ****************/
function showTab(tabId) {
    document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
    document.getElementById(tabId).style.display = "block";
}

/**************** ADD EXPENSE ****************/
function addExpense() {
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (!amount || !date) return alert("Enter amount and date");

    const data = getData();
    data.push({
        id: Date.now(),
        amount,
        category: category.value,
        date,
        description: description.value,
        type: "expense"
    });

    saveData(data);
    clearExpenseInputs();
    loadExpenses();
}

/**************** ADD INCOME ****************/
function addIncome() {
    const amount = Number(incomeAmount.value);
    if (!amount) return alert("Enter income");

    const data = getData();
    data.push({
        id: Date.now(),
        amount,
        date: new Date().toISOString(),
        type: "income"
    });

    saveData(data);
    incomeAmount.value = "";
    loadExpenses();
}

/**************** ADD LENDING ****************/
function addLend() {
    const name = lendName.value.trim();
    const amount = Number(lendAmount.value);

    if (!name || !amount) return alert("Enter name & amount");

    const data = getData();
    data.push({
        id: Date.now(),
        amount,
        date: new Date().toISOString(),
        description: "Lent to " + name,
        type: "lend"
    });

    saveData(data);
    lendName.value = "";
    lendAmount.value = "";
    loadExpenses();
}

/**************** HISTORY DELETE (UI ONLY) ****************/
function deleteExpense(id) {
    hiddenTransactions.push(id);
    loadExpenses();
}

function clearHistory() {
    hiddenTransactions = getData().map(i => i.id);
    loadExpenses();
}

/**************** RESET (REAL DELETE) ****************/
function resetAllData() {
    if (!confirm("Delete ALL data permanently?")) return;
    if (!confirm("This cannot be undone. Continue?")) return;

    localStorage.removeItem("financeData");
    hiddenTransactions = [];
    loadExpenses();
}

/**************** GOAL ****************/
function setGoal() {
    const goal = Number(goalAmount.value);
    if (!goal) return alert("Enter goal amount");

    localStorage.setItem("goalAmount", goal);
    goalAmount.value = "";
    updateGoal();
}

function updateGoal() {
    const goal = Number(localStorage.getItem("goalAmount")) || 0;
    const data = getData();

    let income = 0, expense = 0;
    data.forEach(i => {
        if (i.type === "income") income += i.amount;
        if (i.type === "expense") expense += i.amount;
    });

    const saved = income - expense;
    goalSaved.innerText = saved;
    goalTarget.innerText = goal;
    goalBar.style.width = goal ? Math.min(100, (saved / goal) * 100) + "%" : "0%";
}

/**************** LOAD ****************/
function loadExpenses() {
    const data = getData();

    let totalExpense = 0, totalIncome = 0;
    let monthExpense = 0, monthIncome = 0, yearExpense = 0;
    let categoryData = {}, monthlyData = {};
    let historyHTML = "";

    const now = new Date();

    data.forEach(item => {
        const amt = item.amount;
        const d = new Date(item.date);

        if (item.type === "expense") {
            totalExpense += amt;
            yearExpense += amt;
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
                monthExpense += amt;
            categoryData[item.category] = (categoryData[item.category] || 0) + amt;
        }

        if (item.type === "income") {
            totalIncome += amt;
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
                monthIncome += amt;
        }

        const m = d.toLocaleString("default", { month: "short" });
        monthlyData[m] = (monthlyData[m] || 0) + amt;

        if (!hiddenTransactions.includes(item.id)) {
            historyHTML += `
                <li>
                    ₹${amt} - ${item.description || item.category || item.type}
                    <button onclick="deleteExpense(${item.id})">Remove</button>
                </li>`;
        }
    });

    total.innerText = totalExpense;
    incomeTotal.innerText = totalIncome;
    profitLoss.innerText = totalIncome - totalExpense;
    remainingMonth.innerText = monthIncome - monthExpense;
    earnedMonth.innerText = monthIncome;
    spentMonth.innerText = monthExpense;
    leftMonth.innerText = monthIncome - monthExpense;
    spentYear.innerText = yearExpense;

    expenseList.innerHTML = historyHTML;

    renderCharts(categoryData, monthlyData);
    updateGoal();
}

/**************** CHARTS ****************/
function renderCharts(cat, mon) {
    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();
    if (monthPieChart) monthPieChart.destroy();

    pieChart = new Chart(pieChartCanvas, {
        type: "pie",
        data: { labels: Object.keys(cat), datasets: [{ data: Object.values(cat) }] }
    });

    monthPieChart = new Chart(monthPieChartCanvas, {
        type: "pie",
        data: { labels: Object.keys(mon), datasets: [{ data: Object.values(mon) }] }
    });

    barChart = new Chart(barChartCanvas, {
        type: "bar",
        data: { labels: Object.keys(mon), datasets: [{ data: Object.values(mon) }] }
    });
}

/**************** UTIL ****************/
function clearExpenseInputs() {
    amountInput.value = "";
    description.value = "";
    dateInput.value = "";
}

/**************** INIT ****************/
const amountInput = document.getElementById("amount");
const category = document.getElementById("category");
const dateInput = document.getElementById("date");
const description = document.getElementById("description");
const incomeAmount = document.getElementById("incomeAmount");
const lendName = document.getElementById("lendName");
const lendAmount = document.getElementById("lendAmount");

const total = document.getElementById("total");
const incomeTotal = document.getElementById("incomeTotal");
const profitLoss = document.getElementById("profitLoss");
const remainingMonth = document.getElementById("remainingMonth");
const earnedMonth = document.getElementById("earnedMonth");
const spentMonth = document.getElementById("spentMonth");
const leftMonth = document.getElementById("leftMonth");
const spentYear = document.getElementById("spentYear");

const goalAmount = document.getElementById("goalAmount");
const goalSaved = document.getElementById("goalSaved");
const goalTarget = document.getElementById("goalTarget");
const goalBar = document.getElementById("goalBar");

const expenseList = document.getElementById("expenseList");
const pieChartCanvas = document.getElementById("pieChart");
const monthPieChartCanvas = document.getElementById("monthPieChart");
const barChartCanvas = document.getElementById("barChart");

loadExpenses();
/**************** THEME ****************/

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById("themeBtn");

    body.classList.toggle("light-mode");

    if (body.classList.contains("light-mode")) {
        btn.innerText = "🌞";
        localStorage.setItem("themeMode", "light");
    } else {
        btn.innerText = "🌙";
        localStorage.setItem("themeMode", "dark");
    }
}

function applySavedTheme() {
    const saved = localStorage.getItem("themeMode");
    const btn = document.getElementById("themeBtn");

    if (saved === "light") {
        document.body.classList.add("light-mode");
        btn.innerText = "🌞";
    } else {
        document.body.classList.remove("light-mode");
        btn.innerText = "🌙";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    applySavedTheme();
});

const text = "RAJ-NAYAN.exe";
    const typingElement = document.getElementById("typing-name");

    let index = 0;

    function typeEffect() {
        if (index < text.length) {
            typingElement.innerHTML += text.charAt(index);
            index++;
            setTimeout(typeEffect, 120);
        }
    }
    typeEffect();
