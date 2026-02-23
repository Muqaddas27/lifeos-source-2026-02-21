import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import path from "path";
import fs from "fs";
import JSZip from "jszip";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("lifeos.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    theme TEXT DEFAULT 'light',
    timezone TEXT DEFAULT 'UTC',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    priority TEXT CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
    status TEXT CHECK(status IN ('PENDING', 'COMPLETED')),
    due_date DATE,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    frequency TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER,
    date DATE,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(habit_id) REFERENCES habits(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    target_value REAL,
    current_value REAL DEFAULT 0,
    deadline DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS finance_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT CHECK(type IN ('INCOME', 'EXPENSE')),
    amount REAL,
    category TEXT,
    description TEXT,
    date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    title TEXT,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    color TEXT,
    UNIQUE(user_id, name),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tag_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_id INTEGER,
    entity_type TEXT CHECK(entity_type IN ('TASK', 'NOTE')),
    entity_id INTEGER,
    FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );
`);

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// --- HELPERS ---
const logActivity = (userId: number, action: string, entityType: string, entityId?: number, details?: string) => {
  try {
    db.prepare("INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)")
      .run(userId, action, entityType, entityId || null, details || null);
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
};

const createNotification = (userId: number, type: string, title: string, message: string) => {
  try {
    db.prepare("INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)")
      .run(userId, type, title, message);
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
};

// Middleware: Auth
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
    const info = stmt.run(email, hashedPassword, name);
    const userId = info.lastInsertRowid as number;
    const token = jwt.sign({ id: userId, email, name }, JWT_SECRET);
    
    logActivity(userId, "SIGNUP", "USER", userId, "User created account");
    createNotification(userId, "WELCOME", "Welcome to my app!", "We're glad to have you here. Start by creating your first task.");
    
    res.json({ token, user: { id: userId, email, name, theme: 'light', timezone: 'UTC' } });
  } catch (e: any) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    logActivity(user.id, "LOGIN", "USER", user.id, "User logged in");
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, theme: user.theme, timezone: user.timezone } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// --- TASK ROUTES ---
app.get("/api/tasks", authenticateToken, (req: any, res) => {
  const tasks = db.prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC").all(req.user.id);
  res.json(tasks);
});

app.post("/api/tasks", authenticateToken, (req: any, res) => {
  const { title, description, priority, due_date, category } = req.body;
  const stmt = db.prepare("INSERT INTO tasks (user_id, title, description, priority, status, due_date, category) VALUES (?, ?, ?, ?, 'PENDING', ?, ?)");
  const info = stmt.run(req.user.id, title, description, priority, due_date, category);
  const taskId = info.lastInsertRowid as number;
  
  logActivity(req.user.id, "CREATE", "TASK", taskId, `Created task: ${title}`);
  
  res.json({ id: taskId, ...req.body, status: 'PENDING' });
});

app.put("/api/tasks/:id", authenticateToken, (req: any, res) => {
  const { title, description, priority, status, due_date, category } = req.body;
  db.prepare("UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, category = ? WHERE id = ? AND user_id = ?")
    .run(title, description, priority, status, due_date, category, req.params.id, req.user.id);
  
  logActivity(req.user.id, "UPDATE", "TASK", parseInt(req.params.id), `Updated task: ${title} (${status})`);
  
  if (status === 'COMPLETED') {
    createNotification(req.user.id, "TASK_COMPLETED", "Task Completed!", `You've finished: ${title}`);
  }
  
  res.json({ success: true });
});

app.delete("/api/tasks/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  logActivity(req.user.id, "DELETE", "TASK", parseInt(req.params.id), "Deleted task");
  res.json({ success: true });
});

// --- HABIT ROUTES ---
app.get("/api/habits", authenticateToken, (req: any, res) => {
  const habits = db.prepare("SELECT * FROM habits WHERE user_id = ?").all(req.user.id);
  const habitsWithLogs = habits.map((habit: any) => {
    const logs = db.prepare("SELECT * FROM habit_logs WHERE habit_id = ?").all(habit.id);
    return { ...habit, logs };
  });
  res.json(habitsWithLogs);
});

app.post("/api/habits", authenticateToken, (req: any, res) => {
  const { name, frequency } = req.body;
  const stmt = db.prepare("INSERT INTO habits (user_id, name, frequency) VALUES (?, ?, ?)");
  const info = stmt.run(req.user.id, name, frequency);
  const habitId = info.lastInsertRowid as number;
  
  logActivity(req.user.id, "CREATE", "HABIT", habitId, `Created habit: ${name}`);
  
  res.json({ id: habitId, name, frequency, logs: [] });
});

app.post("/api/habits/:id/log", authenticateToken, (req: any, res) => {
  const { date, completed } = req.body;
  const existing = db.prepare("SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?").get(req.params.id, date);
  if (existing) {
    db.prepare("UPDATE habit_logs SET completed = ? WHERE id = ?").run(completed ? 1 : 0, (existing as any).id);
  } else {
    db.prepare("INSERT INTO habit_logs (habit_id, date, completed) VALUES (?, ?, ?)").run(req.params.id, date, completed ? 1 : 0);
  }
  
  if (completed) {
    logActivity(req.user.id, "COMPLETE", "HABIT", parseInt(req.params.id), `Completed habit on ${date}`);
  }
  
  res.json({ success: true });
});

// --- GOAL ROUTES ---
app.get("/api/goals", authenticateToken, (req: any, res) => {
  const goals = db.prepare("SELECT * FROM goals WHERE user_id = ?").all(req.user.id);
  res.json(goals);
});

app.post("/api/goals", authenticateToken, (req: any, res) => {
  const { title, target_value, deadline } = req.body;
  const stmt = db.prepare("INSERT INTO goals (user_id, title, target_value, current_value, deadline) VALUES (?, ?, ?, 0, ?)");
  const info = stmt.run(req.user.id, title, target_value, deadline);
  res.json({ id: info.lastInsertRowid, title, target_value, current_value: 0, deadline });
});

app.put("/api/goals/:id", authenticateToken, (req: any, res) => {
  const { current_value } = req.body;
  db.prepare("UPDATE goals SET current_value = ? WHERE id = ? AND user_id = ?").run(current_value, req.params.id, req.user.id);
  logActivity(req.user.id, "UPDATE", "GOAL", parseInt(req.params.id), "Updated goal progress");
  res.json({ success: true });
});

app.delete("/api/goals/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM goals WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  logActivity(req.user.id, "DELETE", "GOAL", parseInt(req.params.id), "Deleted goal");
  res.json({ success: true });
});

// --- FINANCE ROUTES ---
app.get("/api/finance", authenticateToken, (req: any, res) => {
  const entries = db.prepare("SELECT * FROM finance_entries WHERE user_id = ? ORDER BY date DESC").all(req.user.id);
  res.json(entries);
});

app.post("/api/finance", authenticateToken, (req: any, res) => {
  const { type, amount, category, description, date } = req.body;
  const stmt = db.prepare("INSERT INTO finance_entries (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)");
  const info = stmt.run(req.user.id, type, amount, category, description, date);
  const entryId = info.lastInsertRowid as number;
  
  logActivity(req.user.id, "CREATE", "FINANCE", entryId, `Added ${type.toLowerCase()} entry: ${amount} in ${category}`);
  
  res.json({ id: entryId, ...req.body });
});

app.put("/api/finance/:id", authenticateToken, (req: any, res) => {
  const { type, amount, category, description, date } = req.body;
  db.prepare("UPDATE finance_entries SET type = ?, amount = ?, category = ?, description = ?, date = ? WHERE id = ? AND user_id = ?")
    .run(type, amount, category, description, date, req.params.id, req.user.id);
  logActivity(req.user.id, "UPDATE", "FINANCE", parseInt(req.params.id), "Updated finance entry");
  res.json({ success: true });
});

app.delete("/api/finance/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM finance_entries WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  logActivity(req.user.id, "DELETE", "FINANCE", parseInt(req.params.id), "Deleted finance entry");
  res.json({ success: true });
});

// --- NOTE ROUTES ---
app.get("/api/notes", authenticateToken, (req: any, res) => {
  const notes = db.prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC").all(req.user.id);
  res.json(notes);
});

app.post("/api/notes", authenticateToken, (req: any, res) => {
  const { title, content } = req.body;
  const stmt = db.prepare("INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)");
  const info = stmt.run(req.user.id, title, content);
  const noteId = info.lastInsertRowid as number;
  
  logActivity(req.user.id, "CREATE", "NOTE", noteId, `Created note: ${title}`);
  
  res.json({ id: noteId, title, content });
});

app.put("/api/notes/:id", authenticateToken, (req: any, res) => {
  const { title, content } = req.body;
  db.prepare("UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?")
    .run(title, content, req.params.id, req.user.id);
  
  logActivity(req.user.id, "UPDATE", "NOTE", parseInt(req.params.id), `Updated note: ${title}`);
  
  res.json({ success: true });
});

app.delete("/api/notes/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  logActivity(req.user.id, "DELETE", "NOTE", parseInt(req.params.id), "Deleted note");
  res.json({ success: true });
});

// --- NOTIFICATION ROUTES ---
app.get("/api/notifications", authenticateToken, (req: any, res) => {
  const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(req.user.id);
  res.json(notifications);
});

app.put("/api/notifications/:id/read", authenticateToken, (req: any, res) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  res.json({ success: true });
});

app.put("/api/notifications/read-all", authenticateToken, (req: any, res) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.user.id);
  res.json({ success: true });
});

// --- ACTIVITY LOG ROUTES ---
app.get("/api/activity-logs", authenticateToken, (req: any, res) => {
  const logs = db.prepare("SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100").all(req.user.id);
  res.json(logs);
});

// --- TAG ROUTES ---
app.get("/api/tags", authenticateToken, (req: any, res) => {
  const tags = db.prepare("SELECT * FROM tags WHERE user_id = ?").all(req.user.id);
  res.json(tags);
});

app.post("/api/tags", authenticateToken, (req: any, res) => {
  const { name, color } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)");
    const info = stmt.run(req.user.id, name, color);
    res.json({ id: info.lastInsertRowid, name, color });
  } catch (e) {
    res.status(400).json({ error: "Tag already exists" });
  }
});

app.delete("/api/tags/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM tags WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  res.json({ success: true });
});

app.get("/api/tags/relations/:type/:id", authenticateToken, (req: any, res) => {
  const relations = db.prepare(`
    SELECT t.* FROM tags t
    JOIN tag_relations tr ON t.id = tr.tag_id
    WHERE tr.entity_type = ? AND tr.entity_id = ?
  `).all(req.params.type.toUpperCase(), req.params.id);
  res.json(relations);
});

app.post("/api/tags/relations", authenticateToken, (req: any, res) => {
  const { tag_id, entity_type, entity_id } = req.body;
  db.prepare("INSERT INTO tag_relations (tag_id, entity_type, entity_id) VALUES (?, ?, ?)")
    .run(tag_id, entity_type.toUpperCase(), entity_id);
  res.json({ success: true });
});

app.delete("/api/tags/relations/:tag_id/:type/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM tag_relations WHERE tag_id = ? AND entity_type = ? AND entity_id = ?")
    .run(req.params.tag_id, req.params.type.toUpperCase(), req.params.id);
  res.json({ success: true });
});

// --- USER SETTINGS ROUTES ---
app.get("/api/user/settings", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT id, email, name, theme, timezone FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

app.put("/api/user/settings", authenticateToken, async (req: any, res) => {
  const { name, email, theme, timezone, password } = req.body;
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.prepare("UPDATE users SET name = ?, email = ?, theme = ?, timezone = ?, password = ? WHERE id = ?")
      .run(name, email, theme, timezone, hashedPassword, req.user.id);
  } else {
    db.prepare("UPDATE users SET name = ?, email = ?, timezone = ? WHERE id = ?")
      .run(name, email, timezone, req.user.id);
  }
  logActivity(req.user.id, "UPDATE", "USER", req.user.id, "Updated user settings");
  res.json({ success: true });
});

app.delete("/api/user/account", authenticateToken, (req: any, res) => {
  // In a real app, we'd delete all related data too, but SQLite CASCADE or manual delete is needed
  // For this demo, we'll just delete the user.
  db.prepare("DELETE FROM users WHERE id = ?").run(req.user.id);
  res.json({ success: true });
});

app.get("/api/user/export", authenticateToken, (req: any, res) => {
  const tasks = db.prepare("SELECT * FROM tasks WHERE user_id = ?").all(req.user.id);
  const habits = db.prepare("SELECT * FROM habits WHERE user_id = ?").all(req.user.id);
  const finance = db.prepare("SELECT * FROM finance_entries WHERE user_id = ?").all(req.user.id);
  const notes = db.prepare("SELECT * FROM notes WHERE user_id = ?").all(req.user.id);
  
  res.json({ tasks, habits, finance, notes });
});

app.get("/api/admin/source", authenticateToken, async (req: any, res) => {
  const zip = new JSZip();
  
  const addFilesToZip = (dir: string, zipFolder: JSZip) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.next' || file === '.cache') continue;
        addFilesToZip(filePath, zipFolder.folder(file)!);
      } else {
        // Skip binary files or large files if necessary, but for source code it's usually fine
        // Also skip the database file itself to keep it clean, or include it? 
        // Let's skip .db files
        if (file.endsWith('.db') || file.endsWith('.log')) continue;
        
        const content = fs.readFileSync(filePath);
        zipFolder.file(file, content);
      }
    }
  };

  try {
    addFilesToZip(__dirname, zip);
    const content = await zip.generateAsync({ type: "base64" });
    res.json({ base64: content });
  } catch (e) {
    console.error("Zip error:", e);
    res.status(500).json({ error: "Failed to generate source zip" });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
