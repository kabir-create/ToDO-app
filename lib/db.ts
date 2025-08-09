import fs from "fs";
import path from "path";

// ===== TYPES =====
type User = {
  id: number;
  email: string;
  password?: string;
  [key: string]: any;
};

type Board = {
  id: number;
  name: string;
  description?: string;
  userId: number;
  createdAt: string;
};

type Task = {
  id: number;
  title: string;
  description?: string;
  boardId: number;
  dueDate?: string | null;
  status: "pending" | "completed";
  createdAt: string;
};

type DBData = {
  users: User[];
  boards: Board[];
  tasks: Task[];
  nextId: number;
};

const DB_FILE = path.join(process.cwd(), "data", "db.json");

// ===== HELPER: LOAD & SAVE =====
function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading DB file:", e);
  }
  return { users: [], boards: [], tasks: [], nextId: 1 };
}

function saveDB(data: DBData) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error saving DB file:", e);
  }
}

// ===== DATABASE CLASS =====
class Database {
  private data: DBData;

  constructor() {
    this.data = loadDB();
  }

  private generateId(): number {
    const id = this.data.nextId++;
    this.persist();
    return id;
  }

  private persist() {
    saveDB(this.data);
  }

  // ===== USER =====
  createUser(userData: Omit<User, "id">): User {
    const user: User = { id: this.generateId(), ...userData };
    this.data.users.push(user);
    this.persist();
    return user;
  }

  findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email === email);
  }

  findUserById(id: number) {
    const user = this.data.users.find((u) => u.id === id);
    if (user) {
      // Auto-seed if no boards
      if (this.getBoardsByUserId(user.id).length === 0) {
        this.seedDemoData(user.id);
      }
    }
    return user;
  }
  

  // ===== BOARDS =====
  createBoard(boardData: Omit<Board, "id" | "createdAt">): Board {
    const board: Board = {
      id: this.generateId(),
      ...boardData,
      createdAt: new Date().toISOString(),
    };
    this.data.boards.push(board);
    this.persist();
    return board;
  }

  getBoardsByUserId(userId: number) {
    return this.data.boards.filter((b) => b.userId === userId);
  }

  findBoardById(id: number) {
    return this.data.boards.find((b) => b.id === Number(id));
  }

  updateBoard(id: number, updates: Partial<Board>) {
    const idx = this.data.boards.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.data.boards[idx] = { ...this.data.boards[idx], ...updates };
      this.persist();
      return this.data.boards[idx];
    }
    return null;
  }

  deleteBoard(id: number) {
    const idx = this.data.boards.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.data.boards.splice(idx, 1);
      this.data.tasks = this.data.tasks.filter((t) => t.boardId !== id);
      this.persist();
      return true;
    }
    return false;
  }

  // ===== TASKS =====
  createTask(taskData: Omit<Task, "id" | "createdAt" | "status">) {
    const task: Task = {
      id: this.generateId(),
      ...taskData,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    this.data.tasks.push(task);
    this.persist();
    return task;
  }

  getTasksByBoardId(boardId: number) {
    return this.data.tasks.filter((t) => t.boardId === boardId);
  }

  findTaskById(id: number) {
    return this.data.tasks.find((t) => t.id === id);
  }

  updateTask(id: number, updates: Partial<Task>) {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
      this.persist();
      return this.data.tasks[idx];
    }
    return null;
  }

  deleteTask(id: number) {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.data.tasks.splice(idx, 1);
      this.persist();
      return true;
    }
    return false;
  }

  // ===== SEED DEMO DATA =====
  seedDemoData(userId: number) {
    if (this.getBoardsByUserId(userId).length > 0) return;

    const board1 = this.createBoard({
      name: "Project Alpha",
      description: "Demo project board",
      userId,
    });

    const board2 = this.createBoard({
      name: "Project Beta",
      description: "Second demo board",
      userId,
    });

    this.createTask({
      title: "Initial setup",
      description: "Install dependencies",
      boardId: board1.id,
      dueDate: null,
    });

    this.createTask({
      title: "Design mockups",
      description: "UI/UX design",
      boardId: board2.id,
      dueDate: null,
    });

    console.log("✅ Seeded demo boards & tasks for user:", userId);
  }
}

const db = new Database();
export default db;
export type { User, Board, Task };
