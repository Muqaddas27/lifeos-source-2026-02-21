import Database from "better-sqlite3";

const db = new Database("lifeos.db");

// Get the first user
const user = db.prepare("SELECT id FROM users LIMIT 1").get();
if (!user) {
  console.log("No user found. Please create an account first.");
  process.exit(1);
}

const userId = user.id;
console.log(`Seeding data for user: ${userId}`);

// Check if habits exist
const existingHabits = db.prepare("SELECT COUNT(*) as count FROM habits WHERE user_id = ?").get(userId);
console.log(`Existing habits: ${existingHabits.count}`);

// Create test habits if they don't exist
let habits = db.prepare("SELECT id FROM habits WHERE user_id = ?").all(userId);
if (habits.length === 0) {
  const habitNames = ["Morning Run", "Meditation", "Read", "Drink Water", "Exercise"];
  for (const name of habitNames) {
    db.prepare("INSERT INTO habits (user_id, name, frequency) VALUES (?, ?, ?)").run(userId, name, "Daily");
  }
  habits = db.prepare("SELECT id FROM habits WHERE user_id = ?").all(userId);
  console.log(`Created ${habits.length} habits`);
}

// Add logs for past 4 weeks + current week
const today = new Date("2026-02-23");
for (let weekOffset = -3; weekOffset <= 0; weekOffset++) {
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + (weekOffset * 7) - 6);
  
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    for (const habit of habits) {
      // Check if log exists
      const existing = db.prepare("SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?").get(habit.id, dateStr);
      if (!existing) {
        // Randomly mark some days as completed (70% completion rate)
        const completed = Math.random() > 0.3 ? 1 : 0;
        db.prepare("INSERT INTO habit_logs (habit_id, date, completed) VALUES (?, ?, ?)").run(habit.id, dateStr, completed);
      }
    }
  }
}

// Verify logs were added
const logCount = db.prepare("SELECT COUNT(*) as count FROM habit_logs").get();
console.log(`Total logs in database: ${logCount.count}`);

console.log("✅ Seed data added successfully!");
console.log("\nYou can now navigate through weeks in the Habit Tracker to see the test data.");
process.exit(0);
