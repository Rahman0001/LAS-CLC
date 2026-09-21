# Legal Aid Society — Campus Law Centre, Faculty of Law, University of Delhi
## Official Portal & Institutional Digital Infrastructure

This is a modern full-stack web application built with **React 19**, **Vite**, **Tailwind CSS v4**, and an **Express.js** backend providing persistent storage, admin authentication, document upload capabilities, and the AAWAZ socio-legal blog publishing system.

---

## 🚀 How to Run in VS Code (Quick Start)

### Prerequisites
Make sure you have **Node.js (v18 or v20+)** installed on your system.
You can check this by running in your terminal:
```bash
node -v
npm -v
```
*(If not installed, download the LTS version from [nodejs.org](https://nodejs.org/)).*

---

### Step-by-Step Instructions

#### 1. Open the project in VS Code
Open VS Code, click **File > Open Folder...**, and select this project folder.

#### 2. Open the Integrated Terminal
In VS Code, press:
- **Windows / Linux**: `Ctrl + \`` (Ctrl + Backtick) or go to menu **Terminal > New Terminal**
- **macOS**: `Cmd + \`` (Cmd + Backtick) or go to menu **Terminal > New Terminal**

#### 3. Install Dependencies
Run the following command once to install all necessary packages:
```bash
npm install
```
*(Wait until the installation completes and `node_modules` is generated).*

#### 4. Start the Development Server
Run:
```bash
npm run dev
```

#### 5. Open in Your Browser
Once the server starts, open:
👉 **[http://localhost:3000](http://localhost:3000)**

*(Alternatively, hold `Ctrl` or `Cmd` and click the link displayed in the terminal).*

---

## ⚠️ Common Mistakes & Troubleshooting in VS Code

### ❌ 1. DO NOT use the "Live Server" extension!
- **Symptom**: Blank white screen or browser console errors like `Failed to load module script: /src/main.tsx`.
- **Reason**: The VS Code "Live Server" extension only serves static `.html` files. It **cannot** compile React/TypeScript code or run the Express `/api` backend.
- **Solution**: Always start the app using `npm run dev` in the terminal and open `http://localhost:3000`.

---

### ❌ 2. DO NOT run `node server.ts` directly
- **Symptom**: `SyntaxError: Cannot use import statement outside a module` or `Unknown file extension ".ts"`.
- **Reason**: Standard `node` cannot run TypeScript files directly without the `tsx` loader.
- **Solution**: Use `npm run dev` (which executes `tsx server.ts`). Or in VS Code, press **F5** to start using the provided `.vscode/launch.json`.

---

### ❌ 3. "Port 3000 is already in use" (`EADDRINUSE`)
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`.
- **Reason**: A previous instance of the server or another program is still holding port 3000.
- **Solution**:
  - **On Windows (Command Prompt / PowerShell)**:
    ```cmd
    netstat -ano | findstr :3000
    taskkill /PID <PID_NUMBER> /F
    ```
  - **On macOS / Linux**:
    ```bash
    lsof -ti :3000 | xargs kill -9
    ```
  Then run `npm run dev` again.

---

### ❌ 4. Browser says "This site can't be reached" with `0.0.0.0:3000`
- **Reason**: In Windows Chrome/Edge, `0.0.0.0` is an interface binding address, not a valid browsable destination.
- **Solution**: Navigate to `http://localhost:3000` or `http://127.0.0.1:3000`.

---

## 🔐 Administrative Portal Login

To access the official Editorial & Society Management Dashboard:
1. Navigate to: **[http://localhost:3000/admin](http://localhost:3000/admin)**
2. Default Institutional Credentials:
   - **Email**: `admin@las.clc.du.ac.in`
   - **Password**: `admin123` *(or `clc@admin2025` if configured in `.env`)*

---

## 🛠️ Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the full-stack server (Express + Vite middleware) with hot reload on port 3000 |
| `npm run build` | Compiles the React frontend into `/dist` and bundles `server.ts` into `/dist/server.cjs` |
| `npm start` | Runs the compiled production server (`node dist/server.cjs`) |
| `npm run lint` | Runs the TypeScript compiler check (`tsc --noEmit`) to verify zero type errors |
| `npm run clean` | Cleans up the `/dist` build output directory |

---

## 📁 Project Structure

```
├── .vscode/               # VS Code launch and debug configurations
├── data/                  # Local persistent database storage (db.json)
├── public/                # Static public assets, icons, seals, logos
├── server/                # Backend database helpers & initial data seeds
│   ├── db.ts              # Database operations, session management & auth
│   └── defaultData.ts     # Initial seed data for notifications, reports, team, AAWAZ blogs
├── src/                   # React frontend application
│   ├── components/        # Reusable UI components (Navbar, Footer, Modals, Toast)
│   ├── context/           # Auth and content state providers
│   ├── pages/             # Application routes & pages
│   │   ├── admin/         # Admin Dashboard and AAWAZ Editorial Desk
│   │   ├── AAWAZBlogPage.tsx # AAWAZ Socio-Legal Blog reader
│   │   ├── HomePage.tsx   # Institutional landing page
│   │   └── ...
│   ├── types.ts           # Global TypeScript interfaces
│   └── main.tsx           # React root entry point
├── uploads/               # Uploaded PDF notices, work reports, and blog cover photos
├── package.json           # Project manifest and scripts
├── server.ts              # Full-stack server entry point (Express + Vite integration)
└── vite.config.ts         # Vite build and plugin configuration
```
