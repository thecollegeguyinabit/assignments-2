import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask } from '@/store/slices/tasksSlice';
import { RootState } from '@/store/store';
import { Task } from "@/types";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

interface FormInput {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  assignedTo?: string;
}

export default function TaskForm({ open, onClose, taskToEdit }: TaskFormProps) {
  const dispatch = useDispatch();
  const { uid } = useSelector((state: RootState) => state.auth);
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormInput>({
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      dueDate: '',
      assignedTo: '',
    },
  });

  useEffect(() => {
    if (taskToEdit) {
      setValue('title', taskToEdit.title);
      setValue('description', taskToEdit.description);
      setValue('status', taskToEdit.status);
      setValue('dueDate', taskToEdit.dueDate);
      setValue('assignedTo', taskToEdit.assignedTo || '');
    } else {
      reset({
        title: '',
        description: '',
        status: 'todo',
        dueDate: '',
        assignedTo: '',
      });
    }
  }, [taskToEdit, setValue, reset, open]);

  const onSubmit = (data: FormInput) => {
    if (taskToEdit) {
      dispatch(updateTask({ id: taskToEdit.id, data: { ...data } }) as any);
    } else {
      if (uid) {
        dispatch(createTask({ ...data, ownerId: uid }) as any);
      }
    }
    onClose();
    reset();
  };

  // this ensure the due date should be in future
  const validateFutureDate = (value: string) => {
    const selectedDate = new Date(value);
    const now = new Date();
    return selectedDate > now || "Due date must be in the future";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{taskToEdit ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } }}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                label="Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select {...field} label="Status">
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="dueDate"
            control={control}
            rules={{ required: 'Due date is required', validate: validateFutureDate }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Due Date"
                type="datetime-local"
                fullWidth
                error={!!errors.dueDate}
                helperText={errors.dueDate?.message}
              />
            )}
          />
           <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Assign To (User ID)"
                fullWidth
                helperText="Optional: Enter the User ID to assign this task"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
