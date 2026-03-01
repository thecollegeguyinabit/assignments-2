'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Grid, Card, CardContent } from '@mui/material';
import Layout from '../../components/Layout';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, logout } from '@/store/slices/authSlice';
import { Task } from "@/types";

interface User {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export default function AdminPage() {
  const { role, uid } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  // Auth Check
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

  // fetch tasks only if user is admin
  useEffect(() => {
    if (role !== 'admin') return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
        setUsers(usersData);

        // Fetch All Tasks for Analytics (using API)
        const response = await fetch('/api/tasks', {
          headers: {
            'x-user-id': uid!, // Admin UID
          },
        });
        if (response.ok) {
          const tasksData = await response.json();
          setTasks(tasksData);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role, uid]);

  // export csv function helper
  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Due Date', 'Owner ID', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.description.replace(/"/g, '""')}"`,
        task.status,
        task.dueDate,
        task.ownerId,
        new Date(task.createdAt).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'tasks_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!uid) return null;
  if (role !== 'admin') {
    return (
      <Layout>
        <Container>
          <Typography variant="h5" sx={{ mt: 4 }} color='warning'>Access Denied. Admins only.</Typography>
        </Container>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <Container>
          <Typography variant='h4' >Loading Admin Data...</Typography>
        </Container>
      </Layout>
    );
  }

  // Analytics stats info
  const totalTasks = tasks.length;
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
          {/* provide tasks info inform of csv file*/}
          <Button variant="contained" color="secondary" onClick={exportToCSV}>
            Export Tasks to CSV
          </Button>
        </Box>

        {/* Analytics Cards show total users, tasks */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Users</Typography>
                <Typography variant="h5">{users.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Tasks</Typography>
                <Typography variant="h5">{totalTasks}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Completed Tasks</Typography>
                <Typography variant="h5">{tasksByStatus.done}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Pending Tasks</Typography>
                <Typography variant="h5">{tasksByStatus.todo + tasksByStatus.inProgress}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Users Table */}
        <Typography variant="h6" gutterBottom>All Users</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>UID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.uid}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Layout>
  );
}
