'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { db } from '@/lib/firebase';
import { Container, Grid, Card, CardContent, Typography, Button, IconButton, Chip, TextField, MenuItem, Select, FormControl, InputLabel, Box, Pagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TaskForm from '@/components/TaskForm';
import { deleteTask, fetchTasks } from '@/store/slices/tasksSlice';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setUser, logout } from '@/store/slices/authSlice';
import { doc, getDoc } from 'firebase/firestore';
import { Task } from "@/types";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { items, loading, error, filter } = useSelector((state: RootState) => state.tasks);
  const { uid, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  /**
   * Auth Check
   * user gone through login page or signup page, the user credential like email, role and uid are store in state management
   * if user logout than move to login page
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userRole: 'user' | 'admin' = 'user';
        if (userDocSnap.exists()) {
          userRole = userDocSnap.data().role as 'user' | 'admin';
        }
        dispatch(setUser({ uid: user.uid, email: user.email, role: userRole }));
      } else {
        dispatch(logout());
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [dispatch, router]);

  /**
   * Fetching task to display on dashboard, with store task into state management
   */
  useEffect(() => {
    if (!uid) return;
    dispatch(fetchTasks(uid) as any);
  }, [uid, dispatch]);


  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id) as any);
    }
  };

  const handleCreate = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  // Client-side filtering and pagination
  const filteredTasks = items.filter(task => {
    const matchesStatus = filter.status === 'all' || task.status === filter.status;
    const matchesSearch = task.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                          task.description.toLowerCase().includes(filter.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pageCount = Math.ceil(filteredTasks.length / itemsPerPage);
  const displayedTasks = filteredTasks.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (authLoading) return <div className='flex justify-center items-center'>Loading...</div>;
  if (!uid) return null;

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1" className=''>
            Dashboard
          </Typography>
          <Button variant="contained" size='small' startIcon={<AddIcon />} onClick={handleCreate}>
            create
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField 
            label="Search" 
            variant="outlined" 
            size="small" 
            onChange={(e) => dispatch({ type: 'tasks/setSearchQuery', payload: e.target.value })}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.status}
              label="Status"
              onChange={(e) => dispatch({ type: 'tasks/setFilterStatus', payload: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* display loading and error messages */}
        {loading && <Typography align='center' >Loading tasks...</Typography>}
        {error && <Typography color="error" align='center'>{error}</Typography>}

        {/* display the task info in grid format */}
        <Grid container spacing={3}>
          {displayedTasks.map((task) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" noWrap>
                      {task.title}
                    </Typography>
                    <Chip 
                      label={task.status} 
                      color={task.status === 'done' ? 'success' : task.status === 'in-progress' ? 'warning' : 'default'} 
                      size="small" 
                    />
                  </Box>
                  <Typography color="text.secondary" sx={{ mb: 1.5, fontSize: 14 }}>
                    Due: {task.dueDate ? format(new Date(task.dueDate), 'PPP p') : 'No date'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, minHeight: 40 }}>
                    {task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleEdit(task)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(task.id)}><DeleteIcon /></IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {pageCount && (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={pageCount} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Box>)}

        {/*  task form dialog */}
        <TaskForm open={isFormOpen} onClose={() => setIsFormOpen(false)} taskToEdit={taskToEdit} />
      </Container>
    </Layout>
  );
}
