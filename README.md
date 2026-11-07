# PeopleOS Employee Payroll Dashboard

A responsive HR and payroll dashboard built with plain HTML, CSS, and JavaScript. The built-in Java HTTP server delivers the app and runs payroll calculations using Java polymorphism: `PermanentEmployee` and `ContractEmployee` override `calculateSalary()` with different provident-fund rules.

## Run locally

1. Install a JDK (Java 11 or later) and ensure `java` and `javac` are available on your PATH.
2. From this folder, run `run.bat`.
3. Open [http://localhost:8080](http://localhost:8080).

Payroll calculations are sent to the Java server. If the server is temporarily unreachable, the browser uses the equivalent local calculation so the dashboard remains usable. Employee, attendance, leave, payroll, and workspace data are persisted in the browser's local storage.

## Publish on GitHub Pages

The GitHub Actions workflow in `.github/workflows/pages.yml` publishes the static dashboard whenever changes are pushed to `main`. Enable GitHub Pages for the repository with **Settings → Pages → Build and deployment → Source → GitHub Actions**. The first successful Pages deployment will provide the public website URL in the workflow run and the repository's Pages settings.

GitHub Pages is static hosting, so its payroll calculations use the equivalent in-browser implementation. Run the Java server locally to exercise the Java polymorphic calculation endpoint.

## Included workflows

- Overview with live headcount, attendance, payroll metrics, charts, department breakdown, and activity.
- Employee directory with profile viewing, search, department and employment-type filters, create/edit, and CSV export.
- Daily attendance with date selection, status updates, batch mark-present, and CSV export.
- Payroll calculation, duplicate-run prevention, history, downloadable CSV payslips, and print-ready payslips.
- Leave request submission, approval/decline actions, and leave-balance summaries.
- Reports, department salary summaries, HR notification preferences, and company settings.

## Salary calculation

`src/payroll/PayrollServer.java` contains the abstract `Employee` type and the overridden `PermanentEmployee.calculateSalary()` and `ContractEmployee.calculateSalary()` methods. Both types calculate base pay, HRA, DA, allowances, and other deductions. Permanent employees also have a 12% base-salary provident-fund deduction; contract employees do not. Payroll amounts are calculated from each employee's profile and returned by `POST /api/payroll/calculate`.
