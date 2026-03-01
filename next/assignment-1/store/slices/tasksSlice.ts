import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, doc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Task, TasksState } from '@/types';

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  filter: {
    status: 'all',
    search: '',
  },
};

// Async Thunks for CRUD (using API Routes)
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'x-user-id': userId,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.error || 'Failed to fetch tasks';
        
        if (errorMessage.includes('missing or insufficient permissions')) {
          errorMessage += '. (API routes run unauthenticated on the server. You must update Firestore Rules to "allow read, write: if true;" for this demo)';
        }
        
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Omit<Task, 'id' | 'createdAt'>, { rejectWithValue, getState }) => {
    try {
        const state = getState() as any;
        const userId = state.auth.uid; 
      
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': userId
            },
            body: JSON.stringify(taskData)
        });
        if(!response.ok) {
            const errorData = await response.json().catch();
            throw new Error(errorData.error || 'Failed to create task');
        }
        return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFilterStatus: (state, action: PayloadAction<'all' | 'todo' | 'in-progress' | 'done'>) => {
      state.filter.status = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filter.search = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchTasks.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    })
    .addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Create
    .addCase(createTask.pending, (state) => {
      state.loading = true;
    })
    .addCase(createTask.fulfilled, (state, action) => {
      state.loading = false;
      state.items.unshift(action.payload);
    })
    .addCase(createTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Update
    .addCase(updateTask.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateTask.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if(index !== -1){
        state.items[index] = { ...state.items[index], ...action.payload };      }
    })
    .addCase(updateTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Delete
    .addCase(deleteTask.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteTask.fulfilled, (state, action) => {
      state.loading = false;
      state.items = state.items.filter(item => item.id !== action.payload)
    })
    .addCase(deleteTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setTasks, setFilterStatus, setSearchQuery, setLoading, setError } = tasksSlice.actions;
export default tasksSlice.reducer;
