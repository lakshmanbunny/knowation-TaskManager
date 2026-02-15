import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    IconButton,
    Chip,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    Checkbox,
    Snackbar,
    Alert,
    Grid,
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    Search,
    Label,
    CalendarToday,
    Check,
} from '@mui/icons-material';
import { tasksAPI } from '../services/api';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        due_date: '',
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const loadTasks = useCallback(async () => {
        try {
            const response = await tasksAPI.getAll({});
            setTasks(response.data);
        } catch (_error) {
            console.error('Error loading tasks:', _error);
        }
    }, []);

    const filteredTasks = useMemo(() => {
        let filtered = [...tasks];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Filter by status
        if (filterStatus === 'active') {
            filtered = filtered.filter(task => task.status === 'pending');
        } else if (filterStatus === 'completed') {
            filtered = filtered.filter(task => task.status === 'completed');
        } else if (filterStatus === 'high') {
            filtered = filtered.filter(task => task.priority === 'high');
        }

        return filtered;
    }, [tasks, searchQuery, filterStatus]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadTasks();
    }, [loadTasks]);

    const handleOpenDialog = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                category: task.category || '',
                due_date: task.due_date || '',
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                category: '',
                due_date: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingTask(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingTask) {
                await tasksAPI.update(editingTask.id, formData);
                setSnackbar({ open: true, message: 'Task updated!', severity: 'success' });
            } else {
                await tasksAPI.create(formData);
                setSnackbar({ open: true, message: 'Task created!', severity: 'success' });
            }
            handleCloseDialog();
            loadTasks();
        } catch {
            setSnackbar({ open: true, message: 'Error saving task', severity: 'error' });
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            if (task.status === 'pending') {
                const response = await tasksAPI.complete(task.id);
                setSnackbar({
                    open: true,
                    message: `+${response.data.xp_earned} XP! ${response.data.level_up ? '🎉 Level Up!' : ''}`,
                    severity: 'success'
                });
            } else {
                await tasksAPI.update(task.id, { status: 'pending' });
                setSnackbar({ open: true, message: 'Task marked as pending', severity: 'info' });
            }
            loadTasks();
        } catch {
            setSnackbar({ open: true, message: 'Error updating task', severity: 'error' });
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await tasksAPI.delete(taskId);
            setSnackbar({ open: true, message: 'Task deleted', severity: 'info' });
            loadTasks();
        } catch {
            setSnackbar({ open: true, message: 'Error deleting task', severity: 'error' });
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444', border: '#fecaca' };
            case 'medium': return { bg: '#fed7aa', text: '#ea580c', dot: '#f97316', border: '#fed7aa' };
            default: return { bg: '#dbeafe', text: '#2563eb', dot: '#3b82f6', border: '#bfdbfe' };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOverdue = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date() && tasks.find(t => t.due_date === dateString)?.status === 'pending';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', md: 'center' }, gap: 3, mb: 6 }}>
                <Box>
                    <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                        My Tasks
                    </Typography>
                    <Typography color="text.secondary">
                        Boost your productivity and crush your goals.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        bgcolor: '#ec13ec',
                        '&:hover': { bgcolor: '#d611d6' },
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 700,
                        boxShadow: '0 10px 30px rgba(236, 19, 236, 0.2)',
                        textTransform: 'none',
                    }}
                >
                    Add Task
                </Button>
            </Box>

            {/* Search and Filters */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                        },
                    }}
                />
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0, overflowX: 'auto', pb: { xs: 1, lg: 0 } }}>
                    {[
                        { label: 'All', value: 'all' },
                        { label: 'Active', value: 'active' },
                        { label: 'Completed', value: 'completed' },
                        { label: 'High Priority', value: 'high', dot: true },
                    ].map((filter) => (
                        <Button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            sx={{
                                px: 3,
                                py: 1.25,
                                borderRadius: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                bgcolor: filterStatus === filter.value ? '#ec13ec' : 'background.paper',
                                color: filterStatus === filter.value ? 'white' : 'text.primary',
                                border: '1px solid transparent',
                                boxShadow: filterStatus === filter.value ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
                                '&:hover': {
                                    bgcolor: filterStatus === filter.value ? '#d611d6' : 'rgba(236, 19, 236, 0.1)',
                                    color: filterStatus === filter.value ? 'white' : '#ec13ec',
                                },
                            }}
                        >
                            {filter.dot && (
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: filterStatus === filter.value ? 'white' : '#ef4444',
                                        mr: 1,
                                    }}
                                />
                            )}
                            {filter.label}
                        </Button>
                    ))}
                </Stack>
            </Box>

            {/* Tasks List */}
            <Stack spacing={2}>
                {filteredTasks.length === 0 ? (
                    <Card sx={{ borderRadius: 3, textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchQuery || filterStatus !== 'all' ? 'No tasks found' : 'No tasks yet'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Create your first task to get started!'}
                        </Typography>
                    </Card>
                ) : (
                    filteredTasks.map((task) => {
                        const priorityColor = getPriorityColor(task.priority);
                        const isCompleted = task.status === 'completed';
                        const isTaskOverdue = isOverdue(task.due_date);

                        return (
                            <Card
                                key={task.id}
                                sx={{
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: isTaskOverdue ? '#fecaca' : 'transparent',
                                    bgcolor: isCompleted ? 'rgba(148, 163, 184, 0.05)' : 'background.paper',
                                    opacity: isCompleted ? 0.7 : 1,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        boxShadow: isCompleted ? '0 1px 3px rgba(0,0,0,0.05)' : '0 4px 20px rgba(236, 19, 236, 0.1)',
                                        borderColor: isCompleted ? 'transparent' : 'rgba(236, 19, 236, 0.2)',
                                        '& .task-actions': {
                                            opacity: 1,
                                        },
                                    },
                                }}
                            >
                                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'start', p: 3 }}>
                                    {/* Checkbox */}
                                    <Checkbox
                                        checked={isCompleted}
                                        onChange={() => handleToggleComplete(task)}
                                        sx={{
                                            color: 'rgba(236, 19, 236, 0.3)',
                                            '&.Mui-checked': {
                                                color: '#ec13ec',
                                            },
                                            p: 0,
                                            mt: 0.5,
                                        }}
                                    />

                                    {/* Task Content */}
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                sx={{
                                                    textDecoration: isCompleted ? 'line-through' : 'none',
                                                    color: isCompleted ? 'text.secondary' : 'text.primary',
                                                }}
                                            >
                                                {task.title}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.75,
                                                    bgcolor: isCompleted ? '#e2e8f0' : priorityColor.bg,
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: isCompleted ? 'transparent' : priorityColor.border,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: isCompleted ? '#94a3b8' : priorityColor.dot,
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        fontSize: '11px',
                                                        color: isCompleted ? '#64748b' : priorityColor.text,
                                                    }}
                                                >
                                                    {isCompleted ? 'Done' : task.priority}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {task.description && (
                                            <Typography
                                                variant="body2"
                                                color={isCompleted ? 'text.disabled' : 'text.secondary'}
                                                sx={{ mt: 0.5, mb: 1.5 }}
                                            >
                                                {task.description}
                                            </Typography>
                                        )}

                                        <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                                            {task.category && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: isCompleted ? 'text.disabled' : 'text.secondary', bgcolor: isCompleted ? 'transparent' : 'rgba(148, 163, 184, 0.1)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                                                    <Label sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {task.category}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {task.due_date && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: isTaskOverdue ? '#ef4444' : (isCompleted ? 'text.disabled' : 'text.secondary') }}>
                                                    <CalendarToday sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {isTaskOverdue ? `Overdue (${formatDate(task.due_date)})` : formatDate(task.due_date)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>

                                    {/* Actions */}
                                    <Stack
                                        direction="row"
                                        spacing={0.5}
                                        className="task-actions"
                                        sx={{ opacity: { xs: 1, md: 0 }, transition: 'opacity 0.2s' }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(task)}
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': { color: '#ec13ec', bgcolor: 'rgba(236, 19, 236, 0.1)' },
                                            }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteTask(task.id)}
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </Stack>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={formData.priority}
                            label="Priority"
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        margin="normal"
                        placeholder="e.g., Work, Personal, Shopping"
                    />
                    <TextField
                        fullWidth
                        label="Due Date"
                        type="datetime-local"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            bgcolor: '#ec13ec',
                            '&:hover': { bgcolor: '#d611d6' },
                            textTransform: 'none',
                            fontWeight: 700,
                        }}
                    >
                        {editingTask ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Tasks;
