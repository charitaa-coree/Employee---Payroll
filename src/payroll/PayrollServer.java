package payroll;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public final class PayrollServer {
    private static final int PORT = 8080;
    private static final Path WEB_ROOT = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();

    private PayrollServer() {}

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", PORT), 0);
        server.createContext("/api/payroll/calculate", PayrollServer::calculatePayroll);
        server.createContext("/", PayrollServer::serveWebFile);
        server.start();
        System.out.println("PeopleOS payroll dashboard is running at http://localhost:" + PORT);
        System.out.println("Press Ctrl+C to stop the server.");
    }

    private static void calculatePayroll(HttpExchange exchange) throws IOException {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendJson(exchange, 405, "{\"error\":\"Use POST to calculate payroll.\"}");
            return;
        }

        try {
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> fields = parseForm(body);
            String type = required(fields, "type");
            double baseSalary = number(fields, "baseSalary");
            double hraRate = number(fields, "hraRate");
            double daRate = number(fields, "daRate");
            double allowances = number(fields, "allowances");
            double deductions = number(fields, "deductions");

            if (baseSalary <= 0 || hraRate < 0 || hraRate > 1 || daRate < 0 || daRate > 1 || allowances < 0 || deductions < 0) {
                sendJson(exchange, 400, "{\"error\":\"Salary values must be non-negative and allowance rates must not exceed 100%.\"}");
                return;
            }

            Employee employee;
            if ("Permanent".equalsIgnoreCase(type)) {
                employee = new PermanentEmployee(baseSalary, hraRate, daRate, allowances, deductions);
            } else if ("Contract".equalsIgnoreCase(type)) {
                employee = new ContractEmployee(baseSalary, hraRate, daRate, allowances, deductions);
            } else {
                sendJson(exchange, 400, "{\"error\":\"Employee type must be Permanent or Contract.\"}");
                return;
            }

            SalaryBreakdown salary = employee.calculateSalary();
            sendJson(exchange, 200, salary.toJson());
        } catch (IllegalArgumentException exception) {
            sendJson(exchange, 400, "{\"error\":\"" + escapeJson(exception.getMessage()) + "\"}");
        } finally {
            exchange.close();
        }
    }

    private static void serveWebFile(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        if (!"GET".equalsIgnoreCase(method) && !"HEAD".equalsIgnoreCase(method)) {
            exchange.getResponseHeaders().set("Allow", "GET, HEAD");
            exchange.sendResponseHeaders(405, -1);
            exchange.close();
            return;
        }

        String requestPath = exchange.getRequestURI().getPath();
        if ("/".equals(requestPath)) requestPath = "/index.html";
        String filename = requestPath.substring(1);
        if (!"index.html".equals(filename) && !"styles.css".equals(filename) && !"app.js".equals(filename)) {
            exchange.sendResponseHeaders(404, -1);
            exchange.close();
            return;
        }

        Path file = WEB_ROOT.resolve(filename).normalize();
        if (!file.startsWith(WEB_ROOT) || !Files.isRegularFile(file)) {
            exchange.sendResponseHeaders(404, -1);
            exchange.close();
            return;
        }

        String contentType = "index.html".equals(filename) ? "text/html; charset=utf-8"
                : "styles.css".equals(filename) ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8";
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        byte[] content = Files.readAllBytes(file);
        if ("HEAD".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(200, -1);
        } else {
            exchange.sendResponseHeaders(200, content.length);
            exchange.getResponseBody().write(content);
        }
        exchange.close();
    }

    private static Map<String, String> parseForm(String body) {
        Map<String, String> fields = new HashMap<>();
        if (body.isEmpty()) return fields;
        for (String pair : body.split("&")) {
            String[] parts = pair.split("=", 2);
            String key = decode(parts[0]);
            String value = parts.length > 1 ? decode(parts[1]) : "";
            fields.put(key, value);
        }
        return fields;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String required(Map<String, String> fields, String name) {
        String value = fields.get(name);
        if (value == null || value.isBlank()) throw new IllegalArgumentException("Missing required field: " + name);
        return value;
    }

    private static double number(Map<String, String> fields, String name) {
        try {
            double value = Double.parseDouble(required(fields, name));
            if (!Double.isFinite(value)) throw new NumberFormatException();
            return value;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Invalid numeric value for " + name);
        }
    }

    private static void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        byte[] content = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, content.length);
        exchange.getResponseBody().write(content);
    }

    private static String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }

    private abstract static class Employee {
        protected final double baseSalary;
        protected final double hraRate;
        protected final double daRate;
        protected final double allowances;
        protected final double otherDeductions;

        protected Employee(double baseSalary, double hraRate, double daRate, double allowances, double otherDeductions) {
            this.baseSalary = baseSalary;
            this.hraRate = hraRate;
            this.daRate = daRate;
            this.allowances = allowances;
            this.otherDeductions = otherDeductions;
        }

        public abstract SalaryBreakdown calculateSalary();

        protected SalaryBreakdown breakdown(double providentFund) {
            double hra = baseSalary * hraRate;
            double da = baseSalary * daRate;
            double gross = baseSalary + hra + da + allowances;
            return new SalaryBreakdown(baseSalary, hra, da, allowances, providentFund,
                    otherDeductions, providentFund + otherDeductions, gross,
                    gross - providentFund - otherDeductions);
        }
    }

    private static final class PermanentEmployee extends Employee {
        private PermanentEmployee(double baseSalary, double hraRate, double daRate,
                                  double allowances, double otherDeductions) {
            super(baseSalary, hraRate, daRate, allowances, otherDeductions);
        }

        @Override
        public SalaryBreakdown calculateSalary() {
            return breakdown(baseSalary * 0.12);
        }
    }

    private static final class ContractEmployee extends Employee {
        private ContractEmployee(double baseSalary, double hraRate, double daRate,
                                 double allowances, double otherDeductions) {
            super(baseSalary, hraRate, daRate, allowances, otherDeductions);
        }

        @Override
        public SalaryBreakdown calculateSalary() {
            return breakdown(0);
        }
    }

    private static final class SalaryBreakdown {
        private final double baseSalary;
        private final double hra;
        private final double da;
        private final double allowances;
        private final double providentFund;
        private final double otherDeductions;
        private final double totalDeductions;
        private final double gross;
        private final double net;

        private SalaryBreakdown(double baseSalary, double hra, double da, double allowances,
                               double providentFund, double otherDeductions, double totalDeductions,
                               double gross, double net) {
            this.baseSalary = baseSalary;
            this.hra = hra;
            this.da = da;
            this.allowances = allowances;
            this.providentFund = providentFund;
            this.otherDeductions = otherDeductions;
            this.totalDeductions = totalDeductions;
            this.gross = gross;
            this.net = net;
        }

        private String toJson() {
            return "{\"baseSalary\":" + baseSalary
                    + ",\"hra\":" + hra
                    + ",\"da\":" + da
                    + ",\"allowances\":" + allowances
                    + ",\"providentFund\":" + providentFund
                    + ",\"otherDeductions\":" + otherDeductions
                    + ",\"totalDeductions\":" + totalDeductions
                    + ",\"gross\":" + gross
                    + ",\"net\":" + net + "}";
        }
    }
}
