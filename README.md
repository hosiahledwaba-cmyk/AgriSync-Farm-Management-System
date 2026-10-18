# AgriSync - Farm Management System

AgriSync is a comprehensive Farm Management System (FMS) featuring multi-role operations management (Owner, Manager, Worker, Accountant), livestock tracking, crop lifecycle & field oversight, financial ledger & P&L accounting, and AI-driven agronomic insights.

---

## 🐳 Run with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine installed and running.

### Option 1: Docker Compose (Quickest)
Run the application using Docker Compose:
```bash
docker compose up -d --build
```
The application will be built and started in the background. Access it at:
👉 **[http://localhost:8080](http://localhost:8080)**

To view logs:
```bash
docker compose logs -f
```

To stop the container:
```bash
docker compose down
```

### Option 2: Docker CLI
1. **Build the Docker Image:**
   ```bash
   docker build -t agrisync-app .
   ```

2. **Run the Container:**
   ```bash
   docker run -d --name agrisync-app -p 8080:80 --restart unless-stopped agrisync-app
   ```

3. Open **[http://localhost:8080](http://localhost:8080)** in your browser.

4. To stop and remove the container:
   ```bash
   docker stop agrisync-app && docker rm agrisync-app
   ```

---

## 💻 Run Locally (Without Docker)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (v9 or higher)

### Steps
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. Open **[http://localhost:3000](http://localhost:3000)** in your browser.

4. **Build production bundle:**
   ```bash
   npm run build
   ```

---

## ⚙️ Architecture & Features

- **Multi-Role RBAC:** Role switching between Farm Owner, Field Manager, Farm Worker, and Agricultural Accountant.
- **Field & Crop Lifecycle:** Planting schedules, GPS field boundaries, soil health tracking (pH, N-P-K), and watering logs.
- **Livestock Tracking:** Herd & individual RFID tagging, vaccination history, feed schedules, milk/egg yield logs, and IoT sensor metrics.
- **Financial Suite:** General ledger, income/expense breakdown, automated payroll calculations, and exportable CSV reports.
- **Agronomist AI:** Dynamic crop suggestions, risk alerts, and livestock health heuristics.
- **Production Container:** Multi-stage Docker build with Node 20 and Alpine Nginx with client-side SPA routing and automated health checks.
