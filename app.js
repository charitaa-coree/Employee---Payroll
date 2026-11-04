"use strict";

const STORAGE_KEY = "peopleos-payroll-v1";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["", "color-1", "color-2", "color-3", "color-4"];
const today = new Date();
const isoToday = today.toISOString().slice(0, 10);
const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: state.admin?.currency || "USD", maximumFractionDigits: 0 }).format(Number(value) || 0);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const initials = (name) => String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

function seedData() {
  const employees = [
    { id: "EMP-1001", name: "Olivia Rhye", email: "olivia.rhye@northstar.io", phone: "+1 (555) 018-2041", department: "Design", role: "Senior Product Designer", type: "Permanent", status: "Active", salary: 7800, hraRate: 0.2, daRate: 0.1, allowances: 500, deductions: 160, joinDate: "2021-03-15", location: "New York" },
    { id: "EMP-1002", name: "Phoenix Baker", email: "phoenix.baker@northstar.io", phone: "+1 (555) 018-2042", department: "Engineering", role: "Engineering Lead", type: "Permanent", status: "Active", salary: 9200, hraRate: 0.2, daRate: 0.1, allowances: 800, deductions: 250, joinDate: "2020-07-12", location: "San Francisco" },
    { id: "EMP-1003", name: "Lana Steiner", email: "lana.steiner@northstar.io", phone: "+1 (555) 018-2043", department: "Marketing", role: "Brand Strategist", type: "Permanent", status: "Active", salary: 6400, hraRate: 0.2, daRate: 0.1, allowances: 350, deductions: 130, joinDate: "2022-01-08", location: "Austin" },
    { id: "EMP-1004", name: "Demi Wilkinson", email: "demi.wilkinson@northstar.io", phone: "+1 (555) 018-2044", department: "Engineering", role: "Software Engineer", type: "Permanent", status: "Active", salary: 7400, hraRate: 0.2, daRate: 0.1, allowances: 600, deductions: 175, joinDate: "2022-09-22", location: "New York" },
    { id: "EMP-1005", name: "Candice Wu", email: "candice.wu@northstar.io", phone: "+1 (555) 018-2045", department: "Human Resources", role: "People Operations", type: "Permanent", status: "Active", salary: 5800, hraRate: 0.2, daRate: 0.1, allowances: 300, deductions: 110, joinDate: "2023-02-13", location: "Chicago" },
    { id: "EMP-1006", name: "Natali Craig", email: "natali.craig@northstar.io", phone: "+1 (555) 018-2046", department: "Design", role: "UX Researcher", type: "Contract", status: "Active", salary: 5200, hraRate: 0.15, daRate: 0.05, allowances: 250, deductions: 75, joinDate: "2024-01-18", location: "Remote" },
    { id: "EMP-1007", name: "Drew Cano", email: "drew.cano@northstar.io", phone: "+1 (555) 018-2047", department: "Finance", role: "Financial Analyst", type: "Permanent", status: "Active", salary: 6100, hraRate: 0.2, daRate: 0.1, allowances: 400, deductions: 140, joinDate: "2021-11-03", location: "Boston" },
    { id: "EMP-1008", name: "Orlando Diggs", email: "orlando.diggs@northstar.io", phone: "+1 (555) 018-2048", department: "Engineering", role: "Frontend Developer", type: "Contract", status: "Active", salary: 6800, hraRate: 0.15, daRate: 0.05, allowances: 450, deductions: 90, joinDate: "2024-04-02", location: "Remote" },
    { id: "EMP-1009", name: "Andi Lane", email: "andi.lane@northstar.io", phone: "+1 (555) 018-2049", department: "Marketing", role: "Content Designer", type: "Permanent", status: "Active", salary: 5600, hraRate: 0.2, daRate: 0.1, allowances: 275, deductions: 105, joinDate: "2023-06-26", location: "Austin" },
    { id: "EMP-1010", name: "Kate Morrison", email: "kate.morrison@northstar.io", phone: "+1 (555) 018-2050", department: "Sales", role: "Account Executive", type: "Contract", status: "Active", salary: 6300, hraRate: 0.15, daRate: 0.05, allowances: 700, deductions: 80, joinDate: "2024-06-10", location: "New York" },
    { id: "EMP-1011", name: "Eleanor Pena", email: "eleanor.pena@northstar.io", phone: "+1 (555) 018-2051", department: "Human Resources", role: "HR Coordinator", type: "Permanent", status: "Active", salary: 4900, hraRate: 0.2, daRate: 0.1, allowances: 250, deductions: 100, joinDate: "2023-08-14", location: "Chicago" },
    { id: "EMP-1012", name: "Courtney Henry", email: "courtney.henry@northstar.io", phone: "+1 (555) 018-2052", department: "Sales", role: "Sales Consultant", type: "Contract", status: "Active", salary: 5500, hraRate: 0.15, daRate: 0.05, allowances: 500, deductions: 65, joinDate: "2024-08-05", location: "Remote" },
  ];
  const attendance = {};
  employees.forEach((employee, index) => {
    const weekday = today.getDay();
    const workday = weekday === 0 || weekday === 6 ? "Present" : (index % 10 === 4 ? "On Leave" : index % 12 === 8 ? "Absent" : "Present");
    attendance[`${isoToday}:${employee.id}`] = workday;
  });
  return {
    employees,
    attendance,
    leaves: [
      { id: "LV-2401", employeeId: "EMP-1003", type: "Annual leave", start: addDays(5), end: addDays(7), days: 3, reason: "Family vacation", status: "Pending" },
      { id: "LV-2402", employeeId: "EMP-1006", type: "Sick leave", start: addDays(-8), end: addDays(-7), days: 2, reason: "Not feeling well", status: "Approved" },
      { id: "LV-2403", employeeId: "EMP-1009", type: "Personal leave", start: addDays(12), end: addDays(12), days: 1, reason: "Personal appointment", status: "Pending" },
      { id: "LV-2404", employeeId: "EMP-1002", type: "Annual leave", start: addDays(20), end: addDays(24), days: 5, reason: "Summer break", status: "Approved" },
    ],
    payroll: [],
    activities: [
      { icon: "♙", color: "", text: "Olivia Rhye updated their profile", time: "Today at 10:42 AM" },
      { icon: "▤", color: "green", text: "May payroll was successfully processed", time: "Yesterday at 4:18 PM" },
      { icon: "▧", color: "", text: "3 leave requests are awaiting review", time: "Yesterday at 11:06 AM" },
    ],
    settings: { emailReminders: true, payrollApproval: true, attendanceAlerts: false },
    admin: { company: "Northstar Studio", email: "hr@northstar.io", currency: "USD" },
  };
}
function addDays(amount) { const date = new Date(); date.setDate(date.getDate() + amount); return date.toISOString().slice(0, 10); }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.employees)) return { ...seedData(), ...saved };
  } catch (error) { console.error("Could not load saved payroll data.", error); }
  const initial = seedData();
  saveState(initial);
  return initial;
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { console.error("Could not save payroll data.", error); toast("Could not save changes in this browser.", true); }
}
let state = loadState();
let currentPage = "dashboard";
let employeeSearch = "";
let employeeTypeFilter = "All types";
let employeeDepartmentFilter = "All departments";
let attendanceDate = isoToday;
let attendanceSearch = "";
let payrollFilter = "All months";

function persist() { saveState(state); updateBadges(); }
function employeeById(id) { return state.employees.find((employee) => employee.id === id); }
function statusBadge(status) { return `<span class="status status-${String(status).toLowerCase().replace(/\s+/g, "-")}">${esc(status)}</span>`; }
function avatar(employee, index = 0) { return `<span class="employee-avatar ${COLORS[index % COLORS.length]}">${esc(initials(employee.name))}</span>`; }
function employeeCell(employee) { const index = state.employees.indexOf(employee); return `<div class="employee-cell">${avatar(employee, index)}<span class="employee-cell-copy"><strong>${esc(employee.name)}</strong><small>${esc(employee.email)}</small></span></div>`; }
function dateLabel(date, options = { month: "short", day: "numeric", year: "numeric" }) { const parsed = new Date(`${date}T12:00:00`); return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("en-US", options); }
function updateBadges() {
  const empCount = document.getElementById("employee-nav-count");
  const leaveCount = document.getElementById("leave-nav-count");
  if (empCount) empCount.textContent = state.employees.length;
  if (leaveCount) leaveCount.textContent = state.leaves.filter((leave) => leave.status === "Pending").length;
}
function toast(message, error = false) {
  const root = document.getElementById("toast-root");
  const item = document.createElement("div");
  item.className = `toast${error ? " error" : ""}`;
  item.textContent = message;
  root.appendChild(item);
  window.setTimeout(() => item.remove(), 3200);
}
function navigate(page) {
  if (!["dashboard", "employees", "attendance", "payroll", "leave", "reports", "admin"].includes(page)) return;
  currentPage = page;
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.page === page));
  document.getElementById("breadcrumb-current").textContent = ({ dashboard: "Overview", employees: "Employees", attendance: "Attendance", payroll: "Payroll", leave: "Leave management", reports: "Reports", admin: "Admin & HR" })[page];
  document.getElementById("sidebar").classList.remove("mobile-open");
  renderPage();
}
function pageHeading(title, subtitle, action = "") {
  return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${action}</div></div>`;
}
function renderPage() {
  updateBadges();
  const container = document.getElementById("page-container");
  container.innerHTML = ({
    dashboard: renderDashboard,
    employees: renderEmployees,
    attendance: renderAttendance,
    payroll: renderPayroll,
    leave: renderLeave,
    reports: renderReports,
    admin: renderAdmin,
  })[currentPage]();
  if (currentPage === "dashboard" || currentPage === "reports") drawPayrollChart();
  if (currentPage === "employees") bindEmployeeFilters();
  if (currentPage === "attendance") bindAttendanceFilters();
  if (currentPage === "payroll") bindPayrollFilter();
}
function todayAttendance() {
  const records = state.employees.map((employee) => ({ employee, status: state.attendance[`${isoToday}:${employee.id}`] || "Present" }));
  return { records, present: records.filter((row) => row.status === "Present").length, leave: records.filter((row) => row.status === "On Leave").length, absent: records.filter((row) => row.status === "Absent").length };
}
function currentMonthPayroll() { return state.payroll.filter((record) => record.month === monthKey()); }
function payrollTotal() { return currentMonthPayroll().reduce((sum, record) => sum + record.net, 0); }
function payrollPendingCount() {
  const processed = new Set(currentMonthPayroll().map((record) => record.employeeId));
  return state.employees.filter((employee) => employee.status === "Active" && !processed.has(employee.id)).length;
}
function renderDashboard() {
  const attendance = todayAttendance();
  const totalPayroll = payrollTotal();
  const action = `<span class="date-pill">▣ &nbsp;${dateLabel(isoToday)}</span><button class="button button-primary" data-action="run-payroll">↗ &nbsp;Process payroll</button>`;
  const recent = state.employees.filter((employee) => employee.status === "Active").slice(0, 5);
  const monthName = today.toLocaleDateString("en-US", { month: "long" });
  return `${pageHeading("Good morning, Jordan 👋", "Here's what's happening with your team today.", action)}
    <section class="stats-grid">
      <article class="stat-card"><div class="stat-head"><span>Total employees</span><span class="stat-icon">♙</span></div><div class="stat-value">${state.employees.length}<span class="stat-change">↑ 8.2%</span></div><div class="stat-foot">vs. last month</div></article>
      <article class="stat-card"><div class="stat-head"><span>Present today</span><span class="stat-icon green">◷</span></div><div class="stat-value">${attendance.present}<span class="stat-change">${state.employees.length ? Math.round(attendance.present / state.employees.length * 100) : 0}%</span></div><div class="stat-foot">${attendance.absent} absent · ${attendance.leave} on leave</div></article>
      <article class="stat-card"><div class="stat-head"><span>Pending payroll</span><span class="stat-icon orange">▤</span></div><div class="stat-value">${payrollPendingCount()}<span class="stat-change neutral">employees</span></div><div class="stat-foot">${currentMonthPayroll().length} processed for ${monthName}</div></article>
      <article class="stat-card"><div class="stat-head"><span>Monthly payroll</span><span class="stat-icon blue">$</span></div><div class="stat-value">${money(totalPayroll)}<span class="stat-change">${currentMonthPayroll().length ? "processed" : "not yet run"}</span></div><div class="stat-foot">Net pay · ${monthName} ${today.getFullYear()}</div></article>
    </section>
    <section class="overview-grid">
      <article class="chart-card"><div class="panel-heading"><div><div class="panel-title">Payroll overview</div><div class="panel-subtitle">Monthly salary disbursements</div></div><select class="select-small" id="dashboard-chart-period"><option value="6">Last 6 months</option><option value="12">Last 12 months</option></select></div><div class="chart-area"><canvas id="payroll-chart" aria-label="Monthly payroll bar chart"></canvas></div><div class="legend"><span><i class="legend-dot"></i> Payroll processed</span><span><i class="legend-dot alt"></i> Pending payroll</span></div></article>
      <article class="panel"><div class="panel-heading"><div><div class="panel-title">Team overview</div><div class="panel-subtitle">Employees by department</div></div><button class="button button-sm" data-page="employees">View all</button></div><div class="department-content">${renderDepartmentChart()}</div></article>
    </section>
    <section class="bottom-grid">
      <article class="panel"><div class="panel-heading"><div><div class="panel-title">Team members</div><div class="panel-subtitle">Your newest additions to the team</div></div><button class="button button-sm" data-page="employees">See all members →</button></div>${employeeTable(recent, "dashboard")}</article>
      <article class="panel"><div class="panel-heading"><div><div class="panel-title">Quick actions</div><div class="panel-subtitle">Common tasks, one click away</div></div></div><div class="payroll-banner"><span class="payroll-banner-icon">▤</span><span class="payroll-banner-copy"><strong>Monthly payroll</strong><span>${payrollPendingCount()} employees to process</span></span><button class="button button-primary button-sm" data-action="run-payroll">Run →</button></div><div class="activity-list">${state.activities.slice(0, 3).map((activity) => `<div class="activity-item"><span class="activity-mark ${activity.color}">${esc(activity.icon)}</span><span class="activity-copy">${esc(activity.text)}<small>${esc(activity.time)}</small></span></div>`).join("")}</div></article>
    </section>`;
}
function renderDepartmentChart() {
  const departments = ["Engineering", "Design", "Marketing", "Other"];
  const counts = departments.map((department) => department === "Other" ? state.employees.filter((employee) => !["Engineering", "Design", "Marketing"].includes(employee.department)).length : state.employees.filter((employee) => employee.department === department).length);
  const total = state.employees.length;
  let offset = 0;
  const circumference = 2 * Math.PI * 42;
  const segments = counts.map((count, index) => {
    const length = total ? count / total * circumference : 0;
    const element = `<circle class="donut-segment ${index ? `seg-${index + 1}` : ""}" cx="77" cy="77" r="42" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}"></circle>`;
    offset += length;
    return element;
  }).join("");
  return `<div class="donut-wrap"><svg viewBox="0 0 154 154" role="img" aria-label="Employees by department"><circle class="donut-track" cx="77" cy="77" r="42"></circle>${segments}</svg><div class="donut-center"><strong>${total}</strong><span>Employees</span></div></div><div class="department-legend">${departments.map((department, index) => `<div class="dept-item"><i class="dept-swatch ${["", "blue", "orange", "green"][index]}"></i>${department}<span class="dept-value">${counts[index]}</span></div>`).join("")}</div>`;
}
function employeeTable(employees, mode = "full") {
  if (!employees.length) return `<div class="empty-state"><div class="empty-icon">♙</div>No employees found. Try adjusting your search or filters.</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Employment</th><th>Status</th>${mode !== "dashboard" ? "<th>Monthly salary</th><th>Actions</th>" : ""}</tr></thead><tbody>${employees.map((employee) => `<tr><td>${employeeCell(employee)}</td><td>${esc(employee.department)}</td><td>${esc(employee.type)}</td><td>${statusBadge(employee.status)}</td>${mode !== "dashboard" ? `<td>${money(employee.salary)}</td><td><button class="button button-sm" data-action="view-employee" data-id="${esc(employee.id)}">View</button> <button class="button button-sm" data-action="edit-employee" data-id="${esc(employee.id)}">Edit</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}
function renderEmployees() {
  const departments = [...new Set(state.employees.map((employee) => employee.department))].sort();
  const actions = `<button class="button" data-action="export-employees">↓ &nbsp;Export</button><button class="button button-primary" data-action="add-employee">＋ &nbsp;Add employee</button>`;
  return `${pageHeading("Employees", "Manage your people, profiles, and employment details.", actions)}
    <section class="metric-strip"><div class="metric-mini"><span>Total employees</span><strong>${state.employees.length}</strong></div><div class="metric-mini"><span>Permanent</span><strong>${state.employees.filter((e) => e.type === "Permanent").length}</strong></div><div class="metric-mini"><span>Contract</span><strong>${state.employees.filter((e) => e.type === "Contract").length}</strong></div></section>
    <div class="toolbar"><input class="search-field" id="employee-search" type="search" placeholder="⌕  Search employees by name, role, or email" value="${esc(employeeSearch)}"><select id="employee-type-filter" class="field-select filter-select"><option>All types</option><option${employeeTypeFilter === "Permanent" ? " selected" : ""}>Permanent</option><option${employeeTypeFilter === "Contract" ? " selected" : ""}>Contract</option></select><select id="employee-dept-filter" class="field-select filter-select"><option>All departments</option>${departments.map((department) => `<option${department === employeeDepartmentFilter ? " selected" : ""}>${esc(department)}</option>`).join("")}</select></div>
    <section class="panel page-card"><div class="panel-heading"><div><div class="panel-title">All employees <span class="nav-count">${state.employees.length}</span></div><div class="panel-subtitle">A directory of everyone in your workspace</div></div><span class="date-pill">▣ &nbsp;${state.employees.filter((e) => e.status === "Active").length} active</span></div><div id="employee-table">${employeeTable(filterEmployees(), "full")}</div><div class="table-footer"><span id="employee-result-count">Showing ${filterEmployees().length} of ${state.employees.length} employees</span><div class="pagination"><button aria-label="Previous page">‹</button><button class="current">1</button><button aria-label="Next page">›</button></div></div></section>`;
}
function filterEmployees() {
  const query = employeeSearch.toLowerCase().trim();
  return state.employees.filter((employee) => (employeeTypeFilter === "All types" || employee.type === employeeTypeFilter) && (employeeDepartmentFilter === "All departments" || employee.department === employeeDepartmentFilter) && (!query || `${employee.name} ${employee.email} ${employee.role} ${employee.department} ${employee.id}`.toLowerCase().includes(query)));
}
function bindEmployeeFilters() {
  document.getElementById("employee-search").addEventListener("input", (event) => { employeeSearch = event.target.value; updateEmployeeTable(); });
  document.getElementById("employee-type-filter").addEventListener("change", (event) => { employeeTypeFilter = event.target.value; updateEmployeeTable(); });
  document.getElementById("employee-dept-filter").addEventListener("change", (event) => { employeeDepartmentFilter = event.target.value; updateEmployeeTable(); });
}
function updateEmployeeTable() {
  const list = filterEmployees();
  document.getElementById("employee-table").innerHTML = employeeTable(list, "full");
  document.getElementById("employee-result-count").textContent = `Showing ${list.length} of ${state.employees.length} employees`;
}
function renderAttendance() {
  const records = state.employees.filter((employee) => `${employee.name} ${employee.role} ${employee.department}`.toLowerCase().includes(attendanceSearch.toLowerCase())).map((employee) => ({ employee, status: state.attendance[`${attendanceDate}:${employee.id}`] || "Present" }));
  const present = records.filter((row) => row.status === "Present").length;
  const absent = records.filter((row) => row.status === "Absent").length;
  const leave = records.filter((row) => row.status === "On Leave").length;
  const actions = `<button class="button" data-action="export-attendance">↓ &nbsp;Export report</button><button class="button button-primary" data-action="mark-all-present">✓ &nbsp;Mark all present</button>`;
  return `${pageHeading("Attendance", "Track daily attendance and keep your team in sync.", actions)}
    <div class="attendance-hero"><div><strong>Good morning, Jordan</strong><p>Keep attendance records up to date for accurate payroll calculations.</p></div><input class="field-input date-input" type="date" id="attendance-date" value="${esc(attendanceDate)}"></div>
    <section class="metric-strip"><div class="metric-mini"><span>Present</span><strong>${present} <small style="font:10px 'DM Sans';color:#8e97aa">/ ${records.length}</small></strong></div><div class="metric-mini"><span>Absent</span><strong>${absent}</strong></div><div class="metric-mini"><span>On leave</span><strong>${leave}</strong></div></section>
    <div class="toolbar"><input class="search-field" id="attendance-search" type="search" placeholder="⌕  Search employees..." value="${esc(attendanceSearch)}"><span class="date-pill">▣ &nbsp;${dateLabel(attendanceDate)}</span></div>
    <section class="panel page-card"><div class="panel-heading"><div><div class="panel-title">Daily attendance</div><div class="panel-subtitle">Select a status for each employee to keep records accurate.</div></div></div><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Attendance status</th><th>Update status</th></tr></thead><tbody>${records.length ? records.map(({ employee, status }) => `<tr><td>${employeeCell(employee)}</td><td>${esc(employee.department)}</td><td>${statusBadge(status)}</td><td><select class="field-select attendance-status-select" data-id="${esc(employee.id)}" style="min-height:28px;width:125px"><option${status === "Present" ? " selected" : ""}>Present</option><option${status === "Absent" ? " selected" : ""}>Absent</option><option${status === "On Leave" ? " selected" : ""}>On Leave</option></select></td></tr>`).join("") : `<tr><td colspan="4"><div class="empty-state">No employees match your search.</div></td></tr>`}</tbody></table></div><div class="table-footer"><span>Attendance changes are saved automatically</span><span>${dateLabel(attendanceDate)}</span></div></section>`;
}
function bindAttendanceFilters() {
  document.getElementById("attendance-date").addEventListener("change", (event) => { attendanceDate = event.target.value || isoToday; renderPage(); });
  document.getElementById("attendance-search").addEventListener("input", (event) => { attendanceSearch = event.target.value; renderPage(); preserveAttendanceSearch(); });
  document.querySelectorAll(".attendance-status-select").forEach((select) => select.addEventListener("change", (event) => { state.attendance[`${attendanceDate}:${event.target.dataset.id}`] = event.target.value; persist(); renderPage(); toast("Attendance record updated."); }));
}
function preserveAttendanceSearch() {
  const input = document.getElementById("attendance-search");
  if (input) { input.focus(); input.setSelectionRange(attendanceSearch.length, attendanceSearch.length); }
}
function renderPayroll() {
  const months = [...new Set(state.payroll.map((record) => record.month))].sort().reverse();
  const records = state.payroll.filter((record) => payrollFilter === "All months" || record.month === payrollFilter);
  const current = currentMonthPayroll();
  const pending = payrollPendingCount();
  const actions = `<button class="button" data-action="export-payroll">↓ &nbsp;Export report</button><button class="button button-primary" data-action="run-payroll"${pending ? "" : " disabled"}>↗ &nbsp;Process payroll</button>`;
  const total = records.reduce((sum, record) => sum + record.net, 0);
  return `${pageHeading("Payroll", "Calculate salaries, review pay runs, and download payslips.", actions)}
    <section class="metric-strip"><div class="metric-mini"><span>Net payroll this month</span><strong>${money(payrollTotal())}</strong></div><div class="metric-mini"><span>Employees paid</span><strong>${current.length} / ${state.employees.filter((e) => e.status === "Active").length}</strong></div><div class="metric-mini"><span>Pending payroll</span><strong>${pending}</strong></div></section>
    <div class="payroll-banner" style="margin:0 0 15px"><span class="payroll-banner-icon">✦</span><span class="payroll-banner-copy"><strong>Java-powered salary calculations</strong><span>Overridden PermanentEmployee and ContractEmployee salary methods calculate every pay component.</span></span><button class="button button-primary button-sm" data-action="run-payroll">Process →</button></div>
    <div class="toolbar"><select class="field-select filter-select" id="payroll-month-filter" style="margin-left:auto"><option>All months</option>${months.map((month) => `<option value="${esc(month)}"${payrollFilter === month ? " selected" : ""}>${esc(formatMonth(month))}</option>`).join("")}</select></div>
    <section class="panel page-card"><div class="panel-heading"><div><div class="panel-title">Payroll history</div><div class="panel-subtitle">All processed salaries and employee payslips</div></div><span class="date-pill">${records.length} payslip${records.length === 1 ? "" : "s"}</span></div><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Pay period</th><th>Employment</th><th>Gross pay</th><th>Deductions</th><th>Net pay</th><th>Status</th><th>Action</th></tr></thead><tbody>${records.length ? records.slice().reverse().map((record) => { const employee = employeeById(record.employeeId) || record.employee; return `<tr><td>${employee ? employeeCell(employee) : `<span class="employee-cell-copy"><strong>${esc(record.employeeName)}</strong><small>${esc(record.employeeId)}</small></span>`}</td><td>${esc(formatMonth(record.month))}</td><td>${esc(record.type)}</td><td>${money(record.gross)}</td><td>${money(record.totalDeductions)}</td><td><strong style="color:#33405e">${money(record.net)}</strong></td><td>${statusBadge("Paid")}</td><td><button class="button button-sm" data-action="payslip" data-id="${esc(record.id)}">Payslip</button></td></tr>`; }).join("") : `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">▤</div>No payroll history for this period. Process payroll to generate payslips.</div></td></tr>`}</tbody></table></div><div class="table-footer"><span>Showing ${records.length} payslip${records.length === 1 ? "" : "s"}</span><strong>Total net pay: ${money(total)}</strong></div></section>
    <section class="panel"><div class="panel-heading"><div><div class="panel-title">How payroll is calculated</div><div class="panel-subtitle">Java OOP · abstract employee with overridden permanent and contract salary methods</div></div><span class="status status-neutral">Java polymorphism</span></div><div class="table-wrap"><table><thead><tr><th>Salary component</th><th>Permanent employee</th><th>Contract employee</th></tr></thead><tbody><tr><td>Base salary</td><td>Monthly base salary</td><td>Monthly contract rate</td></tr><tr><td>House rent allowance (HRA)</td><td>Base salary × HRA rate</td><td>Base salary × HRA rate</td></tr><tr><td>Dearness allowance (DA)</td><td>Base salary × DA rate</td><td>Base salary × DA rate</td></tr><tr><td>Other allowances</td><td>Added to gross earnings</td><td>Added to gross earnings</td></tr><tr><td>Deductions</td><td>Other deductions + 12% provident fund</td><td>Other deductions (no provident fund)</td></tr></tbody></table></div></section>`;
}
function formatMonth(month) {
  const [year, value] = String(month).split("-").map(Number);
  return Number.isFinite(year) && MONTHS[value - 1] ? `${MONTHS[value - 1]} ${year}` : month;
}
function bindPayrollFilter() {
  const input = document.getElementById("payroll-month-filter");
  input.addEventListener("change", (event) => { payrollFilter = event.target.value; renderPage(); });
}
function renderLeave() {
  const pending = state.leaves.filter((leave) => leave.status === "Pending").length;
  const approved = state.leaves.filter((leave) => leave.status === "Approved").length;
  const leaveDays = state.leaves.filter((leave) => leave.status === "Approved").reduce((sum, leave) => sum + Number(leave.days), 0);
  const actions = `<button class="button button-primary" data-action="request-leave">＋ &nbsp;Request leave</button>`;
  return `${pageHeading("Leave management", "Review time-off requests and support a healthy work-life balance.", actions)}
    <section class="metric-strip"><div class="metric-mini"><span>Pending requests</span><strong>${pending}</strong></div><div class="metric-mini"><span>Approved requests</span><strong>${approved}</strong></div><div class="metric-mini"><span>Approved days taken</span><strong>${leaveDays}</strong></div></section>
    <section class="panel page-card"><div class="panel-heading"><div><div class="panel-title">Leave requests</div><div class="panel-subtitle">Review, approve, or decline employee requests.</div></div><span class="date-pill">◷ &nbsp;${pending} pending</span></div><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Leave type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>${state.leaves.length ? state.leaves.slice().reverse().map((leave) => { const employee = employeeById(leave.employeeId); const person = employee || { id: leave.employeeId, name: leave.employeeName || "Former employee", email: leave.employeeId }; return `<tr><td>${employeeCell(person)}</td><td>${esc(leave.type)}</td><td>${dateLabel(leave.start, { month: "short", day: "numeric" })} – ${dateLabel(leave.end, { month: "short", day: "numeric", year: "numeric" })}</td><td>${Number(leave.days)} ${Number(leave.days) === 1 ? "day" : "days"}</td><td title="${esc(leave.reason)}">${esc(leave.reason)}</td><td>${statusBadge(leave.status)}</td><td>${leave.status === "Pending" ? `<button class="button button-sm button-success" data-action="leave-approve" data-id="${esc(leave.id)}">Approve</button> <button class="button button-sm button-danger" data-action="leave-reject" data-id="${esc(leave.id)}">Decline</button>` : "—"}</td></tr>`; }).join("") : `<tr><td colspan="7"><div class="empty-state">No leave requests yet.</div></td></tr>`}</tbody></table></div></section>
    <div class="content-grid"><section class="panel"><div class="panel-heading"><div><div class="panel-title">Leave balance overview</div><div class="panel-subtitle">A quick look at team time off</div></div></div><div class="leave-balance"><div class="balance-box"><span>Annual leave</span><strong>${Math.max(0, 120 - leaveDays)} <small style="font:9px 'DM Sans';color:#9299aa">days</small></strong></div><div class="balance-box"><span>Sick leave</span><strong>68 <small style="font:9px 'DM Sans';color:#9299aa">days</small></strong></div><div class="balance-box"><span>Personal leave</span><strong>34 <small style="font:9px 'DM Sans';color:#9299aa">days</small></strong></div></div></section><section class="panel summary-card"><div class="panel-title">Leave policy</div><div class="summary-row"><span>Annual entitlement</span><strong>20 days</strong></div><div class="summary-row"><span>Sick leave</span><strong>10 days</strong></div><div class="summary-row"><span>Approval workflow</span><strong>Manager → HR</strong></div></section></div>`;
}
function renderReports() {
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastKey = monthKey(lastMonth);
  const lastTotal = state.payroll.filter((record) => record.month === lastKey).reduce((sum, record) => sum + record.net, 0);
  const thisGross = currentMonthPayroll().reduce((sum, record) => sum + record.gross, 0);
  const departments = [...new Set(state.employees.map((employee) => employee.department))];
  const attendance = todayAttendance();
  const actions = `<button class="button" data-action="export-employees">↓ &nbsp;Employee report</button><button class="button button-primary" data-action="export-payroll">↓ &nbsp;Payroll report</button>`;
  return `${pageHeading("Reports & analytics", "Clear insights into your people, attendance, and payroll.", actions)}
    <section class="metric-strip"><div class="metric-mini"><span>Active employees</span><strong>${state.employees.filter((e) => e.status === "Active").length}</strong></div><div class="metric-mini"><span>Departments</span><strong>${departments.length}</strong></div><div class="metric-mini"><span>Attendance today</span><strong>${state.employees.length ? Math.round(attendance.present / state.employees.length * 100) : 0}%</strong></div></section>
    <section class="overview-grid"><article class="chart-card"><div class="panel-heading"><div><div class="panel-title">Monthly payroll report</div><div class="panel-subtitle">Processed net payroll vs. outstanding payroll</div></div><select class="select-small" id="dashboard-chart-period"><option value="6">Last 6 months</option><option value="12">Last 12 months</option></select></div><div class="chart-area"><canvas id="payroll-chart" aria-label="Monthly payroll bar chart"></canvas></div><div class="legend"><span><i class="legend-dot"></i> Processed</span><span><i class="legend-dot alt"></i> Pending</span></div></article><article class="panel summary-card"><div class="panel-title">Payroll summary · ${formatMonth(monthKey())}</div><div class="summary-row"><span>Gross payroll</span><strong>${money(thisGross)}</strong></div><div class="summary-row"><span>Net payroll</span><strong>${money(payrollTotal())}</strong></div><div class="summary-row"><span>Previous month</span><strong>${money(lastTotal)}</strong></div><div class="summary-row"><span>Employees processed</span><strong>${currentMonthPayroll().length}</strong></div><div class="summary-row"><span>Awaiting payroll</span><strong>${payrollPendingCount()}</strong></div></article></section>
    <section class="panel"><div class="panel-heading"><div><div class="panel-title">Department overview</div><div class="panel-subtitle">Headcount and average monthly base salary by team</div></div></div><div class="table-wrap"><table><thead><tr><th>Department</th><th>Employees</th><th>Permanent</th><th>Contract</th><th>Average base salary</th><th>Total base salary</th></tr></thead><tbody>${departments.map((department) => { const people = state.employees.filter((employee) => employee.department === department); const permanent = people.filter((employee) => employee.type === "Permanent").length; const total = people.reduce((sum, employee) => sum + Number(employee.salary), 0); return `<tr><td><strong style="color:#36415f">${esc(department)}</strong></td><td>${people.length}</td><td>${permanent}</td><td>${people.length - permanent}</td><td>${money(people.length ? total / people.length : 0)}</td><td>${money(total)}</td></tr>`; }).join("")}</tbody></table></div></section>`;
}
function renderAdmin() {
  const actions = `<button class="button button-primary" data-action="save-admin-settings">Save changes</button>`;
  return `${pageHeading("Admin & HR settings", "Manage workspace preferences, payroll policies, and people operations.", actions)}
    <section class="admin-grid">
      <article class="panel"><div class="panel-heading"><div><div class="panel-title">Company profile</div><div class="panel-subtitle">Your organization's basic information</div></div></div><div class="modal-body"><div class="form-grid"><div class="form-field full"><label for="admin-company">Company name</label><input id="admin-company" class="field-input" value="${esc(state.admin.company)}"></div><div class="form-field full"><label for="admin-email">HR contact email</label><input id="admin-email" type="email" class="field-input" value="${esc(state.admin.email)}"></div><div class="form-field"><label for="admin-currency">Payroll currency</label><select id="admin-currency" class="field-select"><option value="USD"${state.admin.currency === "USD" ? " selected" : ""}>USD — US Dollar</option><option value="EUR"${state.admin.currency === "EUR" ? " selected" : ""}>EUR — Euro</option><option value="GBP"${state.admin.currency === "GBP" ? " selected" : ""}>GBP — British Pound</option><option value="INR"${state.admin.currency === "INR" ? " selected" : ""}>INR — Indian Rupee</option></select></div><div class="form-field"><label>Workspace plan</label><div class="date-pill">✦ &nbsp;PeopleOS Premium</div></div></div></div></article>
      <article class="panel"><div class="panel-heading"><div><div class="panel-title">HR & payroll preferences</div><div class="panel-subtitle">Automations and approvals for your team</div></div></div>${settingRow("emailReminders", "Payroll email reminders", "Remind employees when their payslip is ready.")}${settingRow("payrollApproval", "Payroll approval workflow", "Require HR review before finalizing a pay run.")}${settingRow("attendanceAlerts", "Attendance alerts", "Notify admins when attendance is missing.")}</article>
      <article class="panel"><div class="panel-heading"><div><div class="panel-title">Payroll policy</div><div class="panel-subtitle">Default salary rules used by the Java payroll engine</div></div></div><div class="summary-card"><div class="summary-row"><span>Permanent provident fund</span><strong>12% of base salary</strong></div><div class="summary-row"><span>HRA &amp; DA</span><strong>Per employee profile</strong></div><div class="summary-row"><span>Contract provident fund</span><strong>Not deducted</strong></div><div class="summary-row"><span>Payroll calculation</span><strong>Java OOP polymorphism</strong></div></div></article>
      <article class="panel"><div class="panel-heading"><div><div class="panel-title">Workspace overview</div><div class="panel-subtitle">Your current people operations footprint</div></div></div><div class="summary-card"><div class="summary-row"><span>Team members</span><strong>${state.employees.length}</strong></div><div class="summary-row"><span>Departments</span><strong>${new Set(state.employees.map((employee) => employee.department)).size}</strong></div><div class="summary-row"><span>Active leave requests</span><strong>${state.leaves.filter((leave) => leave.status === "Pending").length}</strong></div><div class="summary-row"><span>Processed payslips</span><strong>${state.payroll.length}</strong></div><div style="padding-top:12px"><button class="button button-danger" data-action="reset-data">Restore sample data</button></div></div></article>
    </section>`;
}
function settingRow(key, title, description) { return `<div class="setting-row"><div><strong>${title}</strong><small>${description}</small></div><button class="toggle${state.settings[key] ? " on" : ""}" data-action="toggle-setting" data-key="${key}" aria-label="Toggle ${title}" aria-pressed="${Boolean(state.settings[key])}"></button></div>`; }

function payrollHistoryForChart() {
  return state.payroll.reduce((history, record) => { history[record.month] = (history[record.month] || 0) + record.net; return history; }, {});
}
function drawPayrollChart() {
  const canvas = document.getElementById("payroll-chart");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * scale);
  canvas.height = Math.max(1, rect.height * scale);
  context.scale(scale, scale);
  const width = rect.width;
  const height = rect.height;
  const monthsShown = Number(document.getElementById("dashboard-chart-period")?.value || 6);
  const labels = Array.from({ length: monthsShown }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - monthsShown + 1 + index, 1);
    return { key: monthKey(date), label: date.toLocaleDateString("en-US", { month: "short" }) };
  });
  const history = payrollHistoryForChart();
  const employeeMonthly = state.employees.filter((employee) => employee.status === "Active").reduce((sum, employee) => sum + Number(employee.salary) * (1 + Number(employee.hraRate) + Number(employee.daRate)) + Number(employee.allowances), 0);
  const values = labels.map(({ key }) => Math.max(history[key] || 0, key === monthKey() ? payrollTotal() + payrollPendingCount() * (state.employees.length ? employeeMonthly / state.employees.length * .8 : 0) : 0));
  const max = Math.max(...values, employeeMonthly * .8, 1);
  const padding = { top: 8, right: 6, bottom: 22, left: 43 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const formatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 0 });
  context.clearRect(0, 0, width, height);
  context.font = "9px DM Sans, sans-serif";
  context.textBaseline = "middle";
  for (let line = 0; line < 4; line++) {
    const y = padding.top + plotHeight * line / 3;
    const labelValue = formatter.format(max * (1 - line / 3));
    context.fillStyle = "#a0a6b6";
    context.textAlign = "right";
    context.fillText(labelValue, padding.left - 8, y);
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.strokeStyle = "#f0f1f5";
    context.lineWidth = 1;
    context.stroke();
  }
  const slot = plotWidth / labels.length;
  labels.forEach(({ key, label }, index) => {
    const value = values[index];
    const primaryHeight = Math.max(value ? 2 : 0, (history[key] || 0) / max * plotHeight);
    const outstanding = Math.max(0, value - (history[key] || 0));
    const secondaryHeight = outstanding / max * plotHeight;
    const barWidth = Math.min(24, slot * .46);
    const x = padding.left + index * slot + (slot - barWidth) / 2;
    const baseY = padding.top + plotHeight;
    if (secondaryHeight > 0) {
      context.fillStyle = "#bcd6fb";
      roundedRect(context, x, baseY - primaryHeight - secondaryHeight, barWidth, secondaryHeight, 4);
    }
    if (primaryHeight > 0) {
      context.fillStyle = "#655be3";
      roundedRect(context, x, baseY - primaryHeight, barWidth, primaryHeight, 4);
    }
    context.fillStyle = "#9ca3b2";
    context.textAlign = "center";
    context.fillText(label, x + barWidth / 2, height - 7);
  });
  const selector = document.getElementById("dashboard-chart-period");
  if (selector) selector.addEventListener("change", drawPayrollChart, { once: true });
}
function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
  context.fill();
}
window.addEventListener("resize", () => { if (currentPage === "dashboard" || currentPage === "reports") drawPayrollChart(); });

function showModal(title, body, buttons = [], wide = false) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal${wide ? " wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-heading"><h2>${esc(title)}</h2><button class="modal-close" data-action="close-modal" aria-label="Close dialog">×</button></div><div class="modal-body">${body}</div>${buttons.length ? `<div class="modal-footer">${buttons.join("")}</div>` : ""}</section></div>`;
  root.querySelector(".modal-backdrop").addEventListener("click", (event) => { if (event.target === event.currentTarget) closeModal(); });
  root.querySelector(".modal").addEventListener("submit", (event) => event.preventDefault());
}
function closeModal() { document.getElementById("modal-root").innerHTML = ""; }
function modalButton(text, action, primary = false) { return `<button type="button" class="button${primary ? " button-primary" : ""}" data-action="${action}">${text}</button>`; }
function employeeForm(employee = null) {
  const editing = Boolean(employee);
  showModal(editing ? "Edit employee" : "Add a new employee", `<form id="employee-form" class="form-grid">
    <div class="form-field"><label for="employee-name">Full name *</label><input class="field-input" id="employee-name" name="name" required value="${esc(employee?.name || "")}" placeholder="e.g. Alex Morgan"></div>
    <div class="form-field"><label for="employee-email">Work email *</label><input class="field-input" id="employee-email" name="email" type="email" required value="${esc(employee?.email || "")}" placeholder="alex@company.com"></div>
    <div class="form-field"><label for="employee-role">Job title *</label><input class="field-input" id="employee-role" name="role" required value="${esc(employee?.role || "")}" placeholder="e.g. Product Designer"></div>
    <div class="form-field"><label for="employee-department">Department *</label><input class="field-input" id="employee-department" name="department" required list="department-options" value="${esc(employee?.department || "")}" placeholder="e.g. Design"><datalist id="department-options">${[...new Set(state.employees.map((e) => e.department))].map((department) => `<option value="${esc(department)}">`).join("")}</datalist></div>
    <div class="form-field"><label for="employee-type">Employment type</label><select class="field-select" id="employee-type" name="type"><option${employee?.type === "Permanent" ? " selected" : ""}>Permanent</option><option${employee?.type === "Contract" ? " selected" : ""}>Contract</option></select></div>
    <div class="form-field"><label for="employee-salary">Monthly base salary ($) *</label><input class="field-input" id="employee-salary" name="salary" type="number" min="1" step="0.01" required value="${esc(employee?.salary || "")}" placeholder="6000"></div>
    <div class="form-field"><label for="employee-phone">Phone number</label><input class="field-input" id="employee-phone" name="phone" value="${esc(employee?.phone || "")}" placeholder="+1 (555) 010-0000"></div>
    <div class="form-field"><label for="employee-location">Location</label><input class="field-input" id="employee-location" name="location" value="${esc(employee?.location || "")}" placeholder="e.g. New York"></div>
    <div class="modal-section-title">Salary breakdown · annualized rates shown as monthly percentages</div>
    <div class="form-field"><label for="employee-hra">HRA rate (%)</label><input class="field-input" id="employee-hra" name="hraRate" type="number" min="0" max="100" step="0.1" value="${employee ? Number(employee.hraRate) * 100 : 20}"></div>
    <div class="form-field"><label for="employee-da">DA rate (%)</label><input class="field-input" id="employee-da" name="daRate" type="number" min="0" max="100" step="0.1" value="${employee ? Number(employee.daRate) * 100 : 10}"></div>
    <div class="form-field"><label for="employee-allowances">Monthly allowances ($)</label><input class="field-input" id="employee-allowances" name="allowances" type="number" min="0" step="0.01" value="${esc(employee?.allowances ?? 0)}"></div>
    <div class="form-field"><label for="employee-deductions">Other deductions ($)</label><input class="field-input" id="employee-deductions" name="deductions" type="number" min="0" step="0.01" value="${esc(employee?.deductions ?? 0)}"></div>
  </form>`, [modalButton("Cancel", "close-modal"), `<button type="submit" form="employee-form" class="button button-primary" data-action="save-employee"${editing ? ` data-id="${esc(employee.id)}"` : ""}>${editing ? "Save changes" : "Add employee"}</button>`], true);
}
function employeeProfile(employee) {
  if (!employee) return;
  const latest = state.payroll.filter((record) => record.employeeId === employee.id).slice(-1)[0];
  showModal("Employee profile", `<div class="employee-cell" style="margin-bottom:18px">${avatar(employee, state.employees.indexOf(employee))}<span class="employee-cell-copy"><strong style="font-size:13px">${esc(employee.name)}</strong><small>${esc(employee.role)} · ${esc(employee.department)}</small></span>${statusBadge(employee.status)}</div><div class="summary-row"><span>Employee ID</span><strong>${esc(employee.id)}</strong></div><div class="summary-row"><span>Work email</span><strong>${esc(employee.email)}</strong></div><div class="summary-row"><span>Phone</span><strong>${esc(employee.phone || "—")}</strong></div><div class="summary-row"><span>Employment type</span><strong>${esc(employee.type)}</strong></div><div class="summary-row"><span>Location</span><strong>${esc(employee.location || "—")}</strong></div><div class="summary-row"><span>Start date</span><strong>${dateLabel(employee.joinDate)}</strong></div><div class="summary-row"><span>Monthly base salary</span><strong>${money(employee.salary)}</strong></div><div class="summary-row"><span>Latest net pay</span><strong>${latest ? money(latest.net) : "Not processed"}</strong></div>`, [modalButton("Close", "close-modal"), `<button class="button button-primary" data-action="edit-employee" data-id="${esc(employee.id)}">Edit profile</button>`]);
}
function requestLeaveForm() {
  const options = state.employees.filter((employee) => employee.status === "Active").map((employee) => `<option value="${esc(employee.id)}">${esc(employee.name)}</option>`).join("");
  showModal("Request time off", `<form id="leave-form" class="form-grid">
    <div class="form-field full"><label for="leave-employee">Employee *</label><select id="leave-employee" name="employeeId" class="field-select" required><option value="">Select an employee</option>${options}</select></div>
    <div class="form-field"><label for="leave-type">Leave type</label><select id="leave-type" name="type" class="field-select"><option>Annual leave</option><option>Sick leave</option><option>Personal leave</option><option>Unpaid leave</option></select></div>
    <div class="form-field"><label for="leave-days">Number of days *</label><input id="leave-days" name="days" type="number" min="1" step="1" class="field-input" required value="1"></div>
    <div class="form-field"><label for="leave-start">Start date *</label><input id="leave-start" name="start" type="date" class="field-input" required value="${addDays(1)}"></div>
    <div class="form-field"><label for="leave-end">End date *</label><input id="leave-end" name="end" type="date" class="field-input" required value="${addDays(1)}"></div>
    <div class="form-field full"><label for="leave-reason">Reason</label><textarea id="leave-reason" name="reason" class="field-textarea" placeholder="Add a short note for the reviewer"></textarea></div>
  </form>`, [modalButton("Cancel", "close-modal"), `<button type="submit" form="leave-form" class="button button-primary" data-action="save-leave">Submit request</button>`]);
}
function calculateLocally(employee) {
  const base = Number(employee.salary);
  const hra = base * Number(employee.hraRate);
  const da = base * Number(employee.daRate);
  const allowances = Number(employee.allowances);
  const providentFund = employee.type === "Permanent" ? base * .12 : 0;
  const otherDeductions = Number(employee.deductions);
  return { baseSalary: base, hra, da, allowances, providentFund, otherDeductions, totalDeductions: providentFund + otherDeductions, gross: base + hra + da + allowances, net: base + hra + da + allowances - providentFund - otherDeductions };
}
async function calculateWithJava(employee) {
  const payload = new URLSearchParams({
    type: employee.type,
    baseSalary: employee.salary,
    hraRate: employee.hraRate,
    daRate: employee.daRate,
    allowances: employee.allowances,
    deductions: employee.deductions,
  });
  try {
    const response = await fetch("/api/payroll/calculate", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: payload.toString() });
    if (!response.ok) throw new Error(`Payroll calculation failed (${response.status}).`);
    const result = await response.json();
    if (![result.baseSalary, result.hra, result.da, result.allowances, result.providentFund, result.otherDeductions, result.totalDeductions, result.gross, result.net].every((value) => Number.isFinite(Number(value)))) throw new Error("The payroll server returned an invalid calculation.");
    return result;
  } catch (error) {
    if (error instanceof TypeError && location.protocol === "file:") return calculateLocally(employee);
    if (error instanceof TypeError) {
      toast("Java payroll server unavailable. Using the equivalent local payroll calculation.", true);
      return calculateLocally(employee);
    }
    throw error;
  }
}
async function processPayroll() {
  const pending = state.employees.filter((employee) => employee.status === "Active" && !currentMonthPayroll().some((record) => record.employeeId === employee.id));
  if (!pending.length) { toast("All active employees are already paid for this month."); return; }
  const body = `<p style="margin:0 0 14px;color:#8e96a9;font-size:10px;line-height:1.6">The Java payroll engine will calculate each employee's gross pay, HRA, DA, allowances, provident fund, deductions, and net pay using polymorphic salary methods.</p><div class="summary-row"><span>Pay period</span><strong>${formatMonth(monthKey())}</strong></div><div class="summary-row"><span>Employees to process</span><strong>${pending.length}</strong></div><div class="summary-row"><span>Permanent employees</span><strong>${pending.filter((employee) => employee.type === "Permanent").length}</strong></div><div class="summary-row"><span>Contract employees</span><strong>${pending.filter((employee) => employee.type === "Contract").length}</strong></div>`;
  showModal("Process monthly payroll", body, [modalButton("Cancel", "close-modal"), `<button class="button button-primary" data-action="confirm-payroll">Calculate &amp; process</button>`]);
}
async function confirmPayroll(button) {
  const pending = state.employees.filter((employee) => employee.status === "Active" && !currentMonthPayroll().some((record) => record.employeeId === employee.id));
  if (!pending.length) { closeModal(); toast("There are no employees awaiting payroll."); return; }
  button.disabled = true;
  button.textContent = "Calculating...";
  const now = new Date().toISOString();
  const results = [];
  try {
    for (const employee of pending) {
      const calculation = await calculateWithJava(employee);
      results.push({ ...calculation, employeeId: employee.id, employeeName: employee.name, type: employee.type, month: monthKey(), processedAt: now, id: `PAY-${Date.now()}-${employee.id}` });
    }
  } catch (error) {
    console.error("Payroll processing failed.", error);
    button.disabled = false;
    button.textContent = "Retry payroll";
    toast(error.message || "Payroll processing failed.", true);
    return;
  }
  state.payroll.push(...results);
  state.activities.unshift({ icon: "▤", color: "green", text: `${formatMonth(monthKey())} payroll was processed for ${results.length} employees`, time: `Today at ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` });
  persist();
  closeModal();
  renderPage();
  toast(`Payroll processed for ${results.length} employees. ${money(results.reduce((sum, item) => sum + item.net, 0))} net pay.`);
}
function showPayslip(recordId) {
  const record = state.payroll.find((item) => item.id === recordId);
  if (!record) { toast("Payslip could not be found.", true); return; }
  const employee = employeeById(record.employeeId) || { name: record.employeeName, role: "Employee", department: "—", id: record.employeeId, email: "", type: record.type };
  const calculation = record.baseSalary !== undefined ? record : { ...calculateLocally(employee) };
  const amounts = [["Base salary", calculation.baseSalary], ["House rent allowance (HRA)", calculation.hra], ["Dearness allowance (DA)", calculation.da], ["Other allowances", calculation.allowances], ["Gross earnings", calculation.gross], ["Provident fund", -calculation.providentFund], ["Other deductions", -calculation.otherDeductions], ["Total deductions", -calculation.totalDeductions], ["Net pay", calculation.net]];
  const rows = amounts.map(([label, amount], index) => `<tr style="${[4, 7, 8].includes(index) ? "font-weight:700;color:#35405e;background:#fafaff" : ""}"><td>${label}</td><td style="text-align:right">${Number(amount) < 0 ? `−${money(Math.abs(Number(amount)))}` : money(amount)}</td></tr>`).join("");
  showModal("Employee payslip", `<div class="payslip" id="payslip-print"><div class="payslip-head"><div><h3>${esc(state.admin.company || "PeopleOS")}</h3><p>${esc(employee.name)} · ${esc(employee.role)} · ${esc(employee.id)}</p><p style="margin-top:5px">${esc(employee.department)} · ${esc(employee.type)} · ${formatMonth(record.month)}</p></div><div class="payslip-amount"><small>NET PAY</small>${money(record.net)}</div></div><table class="payslip-table"><thead><tr><th>Earnings &amp; deductions</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table><p style="margin:14px 0 0;color:#9aa1b1;font-size:8px">Processed ${new Date(record.processedAt).toLocaleDateString("en-US")} · Generated by PeopleOS Java payroll</p></div>`, [modalButton("Close", "close-modal"), `<button class="button" data-action="download-payslip" data-id="${esc(record.id)}">↓ &nbsp;Download</button>`, `<button class="button button-primary" data-action="print-payslip" data-id="${esc(record.id)}">Print payslip</button>`], true);
}
function downloadCSV(filename, rows) {
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
function exportEmployees() {
  downloadCSV("peopleos-employees.csv", [["Employee ID", "Name", "Email", "Phone", "Department", "Role", "Employment Type", "Status", "Base Salary", "HRA Rate", "DA Rate", "Allowances", "Other Deductions", "Location", "Join Date"], ...state.employees.map((e) => [e.id, e.name, e.email, e.phone, e.department, e.role, e.type, e.status, e.salary, e.hraRate, e.daRate, e.allowances, e.deductions, e.location, e.joinDate])]);
  toast("Employee report exported.");
}
function exportPayroll() {
  downloadCSV("peopleos-payroll.csv", [["Employee ID", "Name", "Period", "Type", "Base Salary", "HRA", "DA", "Allowances", "Provident Fund", "Other Deductions", "Gross Pay", "Total Deductions", "Net Pay", "Status"], ...state.payroll.map((record) => [record.employeeId, record.employeeName, formatMonth(record.month), record.type, record.baseSalary, record.hra, record.da, record.allowances, record.providentFund, record.otherDeductions, record.gross, record.totalDeductions, record.net, "Paid"])]);
  toast("Payroll report exported.");
}
function exportAttendance() {
  downloadCSV(`peopleos-attendance-${attendanceDate}.csv`, [["Employee ID", "Name", "Department", "Date", "Status"], ...state.employees.map((employee) => [employee.id, employee.name, employee.department, attendanceDate, state.attendance[`${attendanceDate}:${employee.id}`] || "Present"])]);
  toast("Attendance report exported.");
}
function exportPayslip(recordId) {
  const record = state.payroll.find((item) => item.id === recordId);
  if (!record) return;
  const employee = employeeById(record.employeeId) || { id: record.employeeId, name: record.employeeName };
  const calculation = record.baseSalary !== undefined ? record : calculateLocally(employee);
  downloadCSV(`payslip-${employee.id}-${record.month}.csv`, [["PeopleOS employee payslip"], ["Employee", employee.name], ["Employee ID", employee.id], ["Pay period", formatMonth(record.month)], [], ["Component", "Amount"], ["Base salary", calculation.baseSalary], ["HRA", calculation.hra], ["DA", calculation.da], ["Other allowances", calculation.allowances], ["Gross earnings", calculation.gross], ["Provident fund", -calculation.providentFund], ["Other deductions", -calculation.otherDeductions], ["Total deductions", -calculation.totalDeductions], ["Net pay", calculation.net]]);
  toast("Payslip downloaded.");
}
function saveEmployee(form, id = null) {
  const data = Object.fromEntries(new FormData(form).entries());
  const existing = id ? employeeById(id) : null;
  const employee = {
    ...(existing || {}),
    id: existing?.id || `EMP-${Date.now().toString().slice(-6)}`,
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    department: data.department.trim(),
    role: data.role.trim(),
    type: data.type,
    status: existing?.status || "Active",
    salary: Number(data.salary),
    hraRate: Number(data.hraRate) / 100,
    daRate: Number(data.daRate) / 100,
    allowances: Number(data.allowances),
    deductions: Number(data.deductions),
    joinDate: existing?.joinDate || isoToday,
    location: data.location.trim(),
  };
  if (Object.values([employee.salary, employee.hraRate, employee.daRate, employee.allowances, employee.deductions]).some((value) => !Number.isFinite(value) || value < 0)) { toast("Please enter valid, non-negative salary values.", true); return; }
  if (existing) state.employees[state.employees.indexOf(existing)] = employee;
  else state.employees.unshift(employee);
  persist();
  closeModal();
  renderPage();
  toast(existing ? "Employee profile updated." : `${employee.name} added to the team.`);
}
function saveLeave(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.end < data.start) { toast("The end date must be on or after the start date.", true); return; }
  const employee = employeeById(data.employeeId);
  if (!employee) { toast("Please select an employee.", true); return; }
  state.leaves.push({ id: `LV-${Date.now().toString().slice(-6)}`, employeeId: employee.id, type: data.type, start: data.start, end: data.end, days: Number(data.days), reason: data.reason.trim() || "—", status: "Pending" });
  persist();
  closeModal();
  renderPage();
  toast("Leave request submitted for approval.");
}
function recordLeaveDecision(id, status) {
  const leave = state.leaves.find((item) => item.id === id);
  if (!leave || leave.status !== "Pending") return;
  leave.status = status;
  persist();
  renderPage();
  toast(`Leave request ${status.toLowerCase()}.`);
}
function markAllPresent() {
  state.employees.forEach((employee) => { state.attendance[`${attendanceDate}:${employee.id}`] = "Present"; });
  persist();
  renderPage();
  toast(`Marked ${state.employees.length} employees present.`);
}
function resetSampleData() {
  state = seedData();
  persist();
  renderPage();
  toast("Sample workspace data restored.");
}
function globalSearch(query) {
  if (!query.trim()) return;
  const match = state.employees.find((employee) => `${employee.name} ${employee.email} ${employee.role} ${employee.department}`.toLowerCase().includes(query.toLowerCase()));
  navigate(match ? "employees" : "employees");
  employeeSearch = query;
  const input = document.getElementById("employee-search");
  if (input) { input.value = query; updateEmployeeTable(); }
  if (!match) toast("No matching employee found. Showing employee search.");
}
function saveAdminSettings() {
  state.admin.company = document.getElementById("admin-company").value.trim() || "PeopleOS workspace";
  state.admin.email = document.getElementById("admin-email").value.trim();
  state.admin.currency = document.getElementById("admin-currency").value;
  persist();
  toast("Workspace settings saved.");
}
function printPayslip(recordId) {
  const record = state.payroll.find((item) => item.id === recordId);
  const employee = record && (employeeById(record.employeeId) || { name: record.employeeName, role: "Employee", department: "—", id: record.employeeId });
  if (!record || !employee) return;
  const calculation = record.baseSalary !== undefined ? record : calculateLocally(employee);
  const components = [["Base salary", calculation.baseSalary], ["HRA", calculation.hra], ["DA", calculation.da], ["Other allowances", calculation.allowances], ["Gross earnings", calculation.gross], ["Provident fund", -calculation.providentFund], ["Other deductions", -calculation.otherDeductions], ["Total deductions", -calculation.totalDeductions], ["Net pay", calculation.net]];
  const printWindow = window.open("", "_blank", "width=720,height=820");
  if (!printWindow) { toast("Allow pop-ups to print this payslip.", true); return; }
  printWindow.document.write(`<!doctype html><html><head><title>Payslip · ${esc(employee.name)}</title><style>body{font-family:Arial,sans-serif;color:#26314f;padding:40px}.header{display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding-bottom:18px}h1{font-size:22px;margin:0 0 8px}.muted{color:#777;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{text-align:left;padding:11px 8px;border-bottom:1px solid #eee}th:last-child,td:last-child{text-align:right}.total{font-weight:bold;background:#fafaff}@media print{body{padding:10px}}</style></head><body><div class="header"><div><h1>${esc(state.admin.company)}</h1><div class="muted">${esc(employee.name)} · ${esc(employee.role)} · ${esc(employee.id)}</div><div class="muted">${formatMonth(record.month)}</div></div><div><div class="muted">NET PAY</div><h1>${money(record.net)}</h1></div></div><table><thead><tr><th>Component</th><th>Amount</th></tr></thead><tbody>${components.map(([label, amount]) => `<tr${["Gross earnings", "Total deductions", "Net pay"].includes(label) ? ' class="total"' : ""}><td>${label}</td><td>${Number(amount) < 0 ? `−${money(-Number(amount))}` : money(amount)}</td></tr>`).join("")}</tbody></table><script>window.onload=()=>window.print();<\/script></body></html>`);
  printWindow.document.close();
}

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  const actionButton = event.target.closest("[data-action]");
  if (pageButton && !actionButton) { event.preventDefault(); navigate(pageButton.dataset.page); return; }
  if (!actionButton) return;
  const { action, id, key } = actionButton.dataset;
  switch (action) {
    case "close-modal": closeModal(); break;
    case "backdrop-close": if (event.target === actionButton) closeModal(); break;
    case "add-employee": employeeForm(); break;
    case "edit-employee": { const employee = employeeById(id); closeModal(); if (employee) employeeForm(employee); break; }
    case "view-employee": employeeProfile(employeeById(id)); break;
    case "save-employee": { const form = document.getElementById("employee-form"); if (form?.reportValidity()) saveEmployee(form, id || null); break; }
    case "export-employees": exportEmployees(); break;
    case "export-payroll": exportPayroll(); break;
    case "export-attendance": exportAttendance(); break;
    case "request-leave": requestLeaveForm(); break;
    case "save-leave": { const form = document.getElementById("leave-form"); if (form?.reportValidity()) saveLeave(form); break; }
    case "leave-approve": recordLeaveDecision(id, "Approved"); break;
    case "leave-reject": recordLeaveDecision(id, "Rejected"); break;
    case "mark-all-present": markAllPresent(); break;
    case "run-payroll": processPayroll(); break;
    case "confirm-payroll": confirmPayroll(actionButton); break;
    case "payslip": showPayslip(id); break;
    case "download-payslip": exportPayslip(id); break;
    case "print-payslip": printPayslip(id); break;
    case "toggle-setting": { state.settings[key] = !state.settings[key]; persist(); renderPage(); toast("Preference updated."); break; }
    case "save-admin-settings": saveAdminSettings(); break;
    case "reset-data": showModal("Restore sample data?", `<p style="color:#788197;font-size:10px;line-height:1.6">This replaces your employees, attendance, leave requests, preferences, and payroll history with the original sample workspace. This action cannot be undone.</p>`, [modalButton("Cancel", "close-modal"), `<button class="button button-primary" data-action="confirm-reset">Restore data</button>`]); break;
    case "confirm-reset": closeModal(); resetSampleData(); break;
    case "notifications": navigate("leave"); toast(`${state.leaves.filter((leave) => leave.status === "Pending").length} leave request(s) awaiting review.`); break;
    case "help": showModal("PeopleOS help center", `<p style="color:#788197;font-size:10px;line-height:1.6">Need help with employee profiles, attendance, or payroll? Contact your workspace HR administrator at <strong>${esc(state.admin.email)}</strong> or explore the guided workflows in the sidebar.</p>`, [modalButton("Got it", "close-modal")]); break;
    default: break;
  }
});
document.addEventListener("submit", (event) => {
  if (event.target.id === "employee-form") { event.preventDefault(); const button = document.querySelector("#modal-root [data-action='save-employee']"); saveEmployee(event.target, button?.dataset.id || null); }
  if (event.target.id === "leave-form") { event.preventDefault(); saveLeave(event.target); }
});
document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => navigate(item.dataset.page)));
document.querySelectorAll("[data-page='admin']").forEach((item) => item.addEventListener("click", () => navigate("admin")));
document.querySelectorAll(".brand").forEach((item) => item.addEventListener("click", (event) => { event.preventDefault(); navigate("dashboard"); }));
document.getElementById("global-search").addEventListener("keydown", (event) => { if (event.key === "Enter") globalSearch(event.target.value); if (event.key === "Escape") event.target.value = ""; });
document.getElementById("mobile-menu").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("mobile-open"));
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); document.getElementById("global-search").focus(); }
  if (event.key === "Escape") closeModal();
});
renderPage();
