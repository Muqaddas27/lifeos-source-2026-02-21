export interface User {
  id: number;
  email: string;
  name: string;
  theme?: 'light' | 'dark';
  timezone?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'COMPLETED';
  due_date: string;
  category: string;
  tags?: Tag[];
}

export interface HabitLog {
  id: number;
  habit_id: number;
  date: string;
  completed: number;
}

export interface Habit {
  id: number;
  name: string;
  frequency: string;
  logs: HabitLog[];
}

export interface Goal {
  id: number;
  title: string;
  target_value: number;
  current_value: number;
  deadline: string;
}

export interface FinanceEntry {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string;
  created_at: string;
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string;
}
