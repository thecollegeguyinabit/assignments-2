export interface AuthState {
  uid: string | null;
  email: string | null;
  role: 'user' | 'admin' | null;
  loading: boolean;
  error: string | null;
}


export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string; // ISO string for simplicity in Redux
  ownerId: string;
  assignedTo?: string;
  createdAt: number; // Timestamp in ms
}

export interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  filter: {
    status: 'all' | 'todo' | 'in-progress' | 'done';
    search: string;
  };
}
