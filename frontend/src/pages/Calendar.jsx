import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    Button,
    Chip,
    Stack,
    CircularProgress,
    Checkbox,
    Divider,
    Tooltip,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    CalendarMonth,
    Add,
    Sync,
    CheckCircle,
    AccessTime,
    Circle,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, calendarAPI } from '../services/api';

function Calendar() {
    const theme = useTheme();
    const { user } = useAuth();
    const isDark = theme.palette.mode === 'dark';

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [googleConnected, setGoogleConnected] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const hasConnected = useRef(false);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch tasks on mount
    useEffect(() => {
        fetchTasks();
        checkGoogleStatus();

        // Handle OAuth callback
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code && params.get('google_connected') && !hasConnected.current) {
            hasConnected.current = true;
            connectGoogle(code);
            window.history.replaceState({}, '', '/calendar');
        }
    }, [googleConnected]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await tasksAPI.getAll();
            setTasks(res.data);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkGoogleStatus = async () => {
        try {
            const res = await calendarAPI.getStatus();
            setGoogleConnected(res.data.connected);
        } catch (err) {
            console.error('Failed to check Google status:', err);
        }
    };

    const connectGoogle = async (code) => {
        try {
            await calendarAPI.connect(code);
            setGoogleConnected(true);
            showMessage('Google Calendar connected successfully!', 'success');
        } catch (err) {
            console.error('Failed to connect Google:', err);
            showMessage('Failed to connect Google Calendar. Please try again.', 'error');
        }
    };

    const handleSyncToGoogle = async () => {
        if (!googleConnected) {
            try {
                const res = await calendarAPI.getAuthUrl();
                window.location.href = res.data.auth_url;
            } catch (err) {
                console.error('Failed to get auth URL:', err);
                showMessage('Failed to start Google connection.', 'error');
            }
            return;
        }

        try {
            setSyncing(true);
            const res = await calendarAPI.sync();
            const { created, errors } = res.data;
            if (errors > 0) {
                showMessage(`Synced ${created} tasks. ${errors} tasks had errors.`, 'warning');
            } else {
                showMessage(`Successfully synced ${created} tasks to Google Calendar!`, 'success');
            }
        } catch (err) {
            console.error('Failed to sync:', err);
            showMessage('Failed to sync with Google Calendar. Please try again.', 'error');
        } finally {
            setSyncing(false);
        }
    };

    // Calendar logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Group tasks by date
    const tasksByDate = useMemo(() => {
        const map = {};
        tasks.forEach(task => {
            if (task.due_date) {
                const dateStr = task.due_date.split('T')[0];
                if (!map[dateStr]) map[dateStr] = [];
                map[dateStr].push(task);
            }
        });
        return map;
    }, [tasks]);

    const getDateStr = (y, m, d) => {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const isToday = (y, m, d) => {
        return d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
    };

    const isSelected = (y, m, d) => {
        return d === selectedDate.getDate() && m === selectedDate.getMonth() && y === selectedDate.getFullYear();
    };

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const days = [];
        // Previous month trailing days
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, isCurrentMonth: false, month: month - 1, year: month === 0 ? year - 1 : year });
        }
        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            days.push({ day: d, isCurrentMonth: true, month, year });
        }
        // Next month leading days
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            days.push({ day: d, isCurrentMonth: false, month: month + 1, year: month === 11 ? year + 1 : year });
        }
        return days;
    }, [year, month, daysInMonth, firstDayOfWeek, prevMonthDays]);

    // Tasks for selected date
    const selectedDateStr = getDateStr(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const selectedTasks = tasksByDate[selectedDateStr] || [];

    // Upcoming tasks (next 5)
    const upcomingTasks = useMemo(() => {
        const todayStr = getDateStr(today.getFullYear(), today.getMonth(), today.getDate());
        return tasks
            .filter(t => t.due_date && t.due_date.split('T')[0] >= todayStr && t.status !== 'completed')
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 5);
    }, [tasks]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'high': return 'High';
            case 'medium': return 'Medium';
            case 'low': return 'Low';
            default: return 'None';
        }
    };

    const navigateMonth = (delta) => {
        setCurrentDate(new Date(year, month + delta, 1));
    };

    const goToToday = () => {
        const now = new Date();
        setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setSelectedDate(now);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#ec13ec' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 5, lg: 8 } }}>
            {/* Page Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CalendarMonth sx={{ fontSize: 40, color: '#ec13ec' }} />
                        Calendar
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your schedule and sync with Google Calendar
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <Sync />}
                    onClick={handleSyncToGoogle}
                    disabled={syncing}
                    sx={{
                        background: 'linear-gradient(135deg, #ec13ec 0%, #9333ea 100%)',
                        color: 'white',
                        fontWeight: 700,
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        boxShadow: '0 4px 20px rgba(236, 19, 236, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #d411d4 0%, #7c22d4 100%)',
                        },
                    }}
                >
                    {googleConnected ? 'Sync to Google Calendar' : 'Connect Google Calendar'}
                </Button>
            </Box>

            {/* Main Layout: Calendar + Sidebar */}
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                {/* Calendar Card */}
                <Card
                    sx={{
                        flex: 1,
                        borderRadius: 4,
                        bgcolor: isDark ? 'rgba(30, 15, 30, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(236, 19, 236, 0.15)' : 'rgba(236, 19, 236, 0.1)',
                        boxShadow: isDark
                            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                            : '0 4px 24px rgba(0, 0, 0, 0.06)',
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                        {/* Month Navigation */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton onClick={() => navigateMonth(-1)} sx={{ color: '#ec13ec' }}>
                                    <ChevronLeft />
                                </IconButton>
                                <Typography variant="h5" fontWeight={700} sx={{ minWidth: 200, textAlign: 'center' }}>
                                    {monthNames[month]} {year}
                                </Typography>
                                <IconButton onClick={() => navigateMonth(1)} sx={{ color: '#ec13ec' }}>
                                    <ChevronRight />
                                </IconButton>
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={goToToday}
                                sx={{
                                    borderColor: '#ec13ec',
                                    color: '#ec13ec',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    '&:hover': {
                                        borderColor: '#ec13ec',
                                        bgcolor: 'rgba(236, 19, 236, 0.08)',
                                    },
                                }}
                            >
                                Today
                            </Button>
                        </Box>

                        {/* Day Headers */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
                            {dayNames.map(day => (
                                <Box key={day} sx={{ textAlign: 'center', py: 1 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {day}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Calendar Grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                            {calendarDays.map((dayObj, idx) => {
                                const dateStr = getDateStr(dayObj.year, dayObj.month, dayObj.day);
                                const dayTasks = tasksByDate[dateStr] || [];
                                const isTodayCell = dayObj.isCurrentMonth && isToday(dayObj.year, dayObj.month, dayObj.day);
                                const isSelectedCell = dayObj.isCurrentMonth && isSelected(dayObj.year, dayObj.month, dayObj.day);

                                return (
                                    <Box
                                        key={idx}
                                        onClick={() => {
                                            if (dayObj.isCurrentMonth) {
                                                setSelectedDate(new Date(dayObj.year, dayObj.month, dayObj.day));
                                            }
                                        }}
                                        sx={{
                                            position: 'relative',
                                            minHeight: { xs: 48, md: 72 },
                                            p: 1,
                                            borderRadius: 2,
                                            cursor: dayObj.isCurrentMonth ? 'pointer' : 'default',
                                            bgcolor: isTodayCell
                                                ? 'rgba(236, 19, 236, 0.12)'
                                                : isSelectedCell
                                                    ? (isDark ? 'rgba(236, 19, 236, 0.06)' : 'rgba(236, 19, 236, 0.04)')
                                                    : 'transparent',
                                            border: '1px solid',
                                            borderColor: isSelectedCell
                                                ? 'rgba(236, 19, 236, 0.4)'
                                                : isTodayCell
                                                    ? 'rgba(236, 19, 236, 0.3)'
                                                    : 'transparent',
                                            opacity: dayObj.isCurrentMonth ? 1 : 0.35,
                                            transition: 'all 0.2s ease',
                                            '&:hover': dayObj.isCurrentMonth ? {
                                                bgcolor: 'rgba(236, 19, 236, 0.08)',
                                                borderColor: 'rgba(236, 19, 236, 0.25)',
                                            } : {},
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={isTodayCell ? 800 : 500}
                                            sx={{
                                                color: isTodayCell
                                                    ? '#ec13ec'
                                                    : dayObj.isCurrentMonth
                                                        ? 'text.primary'
                                                        : 'text.disabled',
                                                ...(isTodayCell && {
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    bgcolor: '#ec13ec',
                                                    color: 'white',
                                                }),
                                            }}
                                        >
                                            {dayObj.day}
                                        </Typography>

                                        {/* Priority Dots */}
                                        {dayTasks.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.3, mt: 0.5, flexWrap: 'wrap' }}>
                                                {dayTasks.slice(0, 4).map((t, i) => (
                                                    <Circle
                                                        key={i}
                                                        sx={{
                                                            fontSize: 7,
                                                            color: getPriorityColor(t.priority),
                                                        }}
                                                    />
                                                ))}
                                                {dayTasks.length > 4 && (
                                                    <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary', lineHeight: 1 }}>
                                                        +{dayTasks.length - 4}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </CardContent>
                </Card>

                {/* Right Sidebar */}
                <Box sx={{ width: { xs: '100%', lg: 340 }, flexShrink: 0 }}>
                    {/* Selected Date Tasks */}
                    <Card
                        sx={{
                            borderRadius: 4,
                            bgcolor: isDark ? 'rgba(30, 15, 30, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(236, 19, 236, 0.15)' : 'rgba(236, 19, 236, 0.1)',
                            boxShadow: isDark
                                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                                : '0 4px 24px rgba(0, 0, 0, 0.06)',
                            mb: 3,
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700}>
                                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Typography>
                                <Tooltip title="Add task for this date">
                                    <IconButton
                                        size="small"
                                        onClick={() => window.location.href = `/tasks?add=true&date=${selectedDateStr}`}
                                        sx={{
                                            bgcolor: '#ec13ec',
                                            color: 'white',
                                            width: 32,
                                            height: 32,
                                            '&:hover': { bgcolor: '#d411d4' },
                                        }}
                                    >
                                        <Add fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {selectedTasks.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <CalendarMonth sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        No tasks for this date
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={1.5}>
                                    {selectedTasks.map(task => (
                                        <Box
                                            key={task.id}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {task.status === 'completed' ? (
                                                    <CheckCircle sx={{ fontSize: 18, color: '#10b981' }} />
                                                ) : (
                                                    <Circle sx={{ fontSize: 10, color: getPriorityColor(task.priority) }} />
                                                )}
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    sx={{
                                                        flex: 1,
                                                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                                        opacity: task.status === 'completed' ? 0.6 : 1,
                                                    }}
                                                >
                                                    {task.title}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 3.5 }}>
                                                <Chip
                                                    label={getPriorityLabel(task.priority)}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        bgcolor: `${getPriorityColor(task.priority)}20`,
                                                        color: getPriorityColor(task.priority),
                                                        borderRadius: 1,
                                                    }}
                                                />
                                                {task.category && (
                                                    <Chip
                                                        label={task.category}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: 10,
                                                            fontWeight: 600,
                                                            bgcolor: isDark ? 'rgba(236,19,236,0.1)' : 'rgba(236,19,236,0.08)',
                                                            color: '#ec13ec',
                                                            borderRadius: 1,
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Tasks */}
                    <Card
                        sx={{
                            borderRadius: 4,
                            bgcolor: isDark ? 'rgba(30, 15, 30, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(236, 19, 236, 0.15)' : 'rgba(236, 19, 236, 0.1)',
                            boxShadow: isDark
                                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                                : '0 4px 24px rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                Upcoming Tasks
                            </Typography>
                            {upcomingTasks.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                    No upcoming tasks
                                </Typography>
                            ) : (
                                <Stack spacing={1.5}>
                                    {upcomingTasks.map(task => (
                                        <Box
                                            key={task.id}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                '&:hover': {
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                                },
                                            }}
                                        >
                                            <Circle sx={{ fontSize: 8, color: getPriorityColor(task.priority) }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" fontWeight={600} noWrap>
                                                    {task.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={getPriorityLabel(task.priority)}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    bgcolor: `${getPriorityColor(task.priority)}20`,
                                                    color: getPriorityColor(task.priority),
                                                    borderRadius: 1,
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default Calendar;
