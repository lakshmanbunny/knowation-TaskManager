import { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Button,
    IconButton,
    Fab,
    Checkbox,
} from '@mui/material';
import {
    EmojiEvents,
    LocalFireDepartment,
    CheckCircle,
    Add,
    TrendingUp,
    Folder,
    MoreVert,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { gamificationAPI, tasksAPI } from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, tasksRes] = await Promise.all([
                gamificationAPI.getStats(),
                tasksAPI.getAll({ limit: 5, sort: 'created_at', order: 'desc' }), // Get last 5 tasks including completed
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateXPProgress = () => {
        if (!stats) return 0;
        const currentLevelXP = Math.pow(stats.level - 1, 2) * 100;
        const nextLevelXP = Math.pow(stats.level, 2) * 100;
        const progress = ((stats.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        return Math.min(progress, 100);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return { bg: '#fee2e2', text: '#dc2626', darkBg: 'rgba(220, 38, 38, 0.2)', darkText: '#f87171' };
            case 'medium': return { bg: '#fef3c7', text: '#d97706', darkBg: 'rgba(217, 119, 6, 0.2)', darkText: '#fbbf24' };
            default: return { bg: '#dbeafe', text: '#2563eb', darkBg: 'rgba(37, 99, 235, 0.2)', darkText: '#60a5fa' };
        }
    };

    const getXPForPriority = (priority) => {
        switch (priority) {
            case 'high': return 30;
            case 'medium': return 20;
            case 'low': return 15;
            default: return 10;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 5, lg: 8 } }}>
                {/* Hero Welcome */}
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                        Welcome back, {user?.username}! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        You're <Box component="span" sx={{ color: '#ec13ec', fontWeight: 700 }}>
                            {Math.pow((stats?.level || 1), 2) * 100 - (stats?.total_xp || 0)} XP
                        </Box> away from reaching Level {(stats?.level || 1) + 1}. Keep the momentum!
                    </Typography>
                </Box>

                {/* Stat Cards Grid */}
                <Grid container spacing={2} sx={{ mb: 6 }}>
                    {/* Level Progress Card */}
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #ec13ec 0%, #9333ea 100%)',
                                color: 'white',
                                borderRadius: 4,
                                boxShadow: '0 10px 30px rgba(236, 19, 236, 0.2)',
                                minHeight: 200,
                            }}
                        >
                            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
                                            Level Progress
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                                            Level {stats?.level || 1}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <TrendingUp />
                                    </Box>
                                </Box>
                                <Box sx={{ mt: 'auto' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="caption" fontWeight={700}>
                                            {stats?.total_xp || 0} / {Math.pow(stats?.level || 1, 2) * 100} XP
                                        </Typography>
                                        <Typography variant="caption" fontWeight={700}>
                                            {Math.round(calculateXPProgress())}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.2)', borderRadius: 1, height: 8 }}>
                                        <Box
                                            sx={{
                                                width: `${calculateXPProgress()}%`,
                                                bgcolor: 'white',
                                                height: '100%',
                                                borderRadius: 1,
                                                transition: 'width 0.3s',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Streak Card */}
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                                color: 'white',
                                borderRadius: 4,
                                boxShadow: '0 10px 30px rgba(249, 115, 22, 0.2)',
                                minHeight: 200,
                            }}
                        >
                            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
                                            Active Streak
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                                            {stats?.current_streak || 0} Days
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <LocalFireDepartment />
                                    </Box>
                                </Box>
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', px: 1, py: 0.5, borderRadius: 0.5, display: 'inline-block', mt: 'auto' }}
                                >
                                    {stats?.current_streak === stats?.longest_streak ? '🏆 Personal Record!' : `🏆 Best: ${stats?.longest_streak || 0} days`}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Tasks Completed Card */}
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                                color: 'white',
                                borderRadius: 4,
                                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)',
                                minHeight: 200,
                            }}
                        >
                            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
                                            Tasks Completed
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                                            {stats?.tasks_completed || 0} Total
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <CheckCircle />
                                    </Box>
                                </Box>
                                <Typography variant="caption" fontWeight={600} sx={{ opacity: 0.9, mt: 'auto' }}>
                                    +{tasks.filter(t => t.status === 'completed').length} this week
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Achievements Card */}
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
                                color: 'white',
                                borderRadius: 4,
                                boxShadow: '0 10px 30px rgba(251, 191, 36, 0.2)',
                                minHeight: 200,
                            }}
                        >
                            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
                                            Achievements
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                                            {stats?.achievements_unlocked || 0} Unlocked
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <EmojiEvents />
                                    </Box>
                                </Box>
                                <Stack direction="row" spacing={-1} sx={{ mt: 'auto' }}>
                                    {['⭐', '🚀', '🔥'].map((emoji, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                bgcolor: 'rgba(255, 255, 255, 0.3)',
                                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                            }}
                                        >
                                            {emoji}
                                        </Box>
                                    ))}
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(236, 19, 236, 0.5)',
                                            border: '1px solid rgba(255, 255, 255, 0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                        }}
                                    >
                                        +{Math.max(0, (stats?.achievements_unlocked || 0) - 3)}
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Recent Tasks Section */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight={800}>
                            Recent Tasks
                        </Typography>
                        <Button
                            onClick={() => navigate('/tasks')}
                            sx={{
                                color: '#ec13ec',
                                fontWeight: 700,
                                textTransform: 'none',
                                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' },
                            }}
                            endIcon={<span>→</span>}
                        >
                            View all tasks
                        </Button>
                    </Box>

                    {tasks.length === 0 ? (
                        <Card sx={{ borderRadius: 3, textAlign: 'center', py: 6 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No tasks yet! 🎉
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Start your productivity journey today
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/tasks')}
                                sx={{
                                    bgcolor: '#ec13ec',
                                    '&:hover': { bgcolor: '#d611d6' },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                }}
                            >
                                Create Your First Task
                            </Button>
                        </Card>
                    ) : (
                        <Stack spacing={1.5}>
                            {tasks.map((task) => {
                                const priorityColor = getPriorityColor(task.priority);
                                const isCompleted = task.status === 'completed';

                                return (
                                    <Card
                                        key={task.id}
                                        sx={{
                                            borderRadius: 3,
                                            border: '1px solid',
                                            borderColor: isCompleted ? 'rgba(236, 19, 236, 0.05)' : 'rgba(236, 19, 236, 0.05)',
                                            bgcolor: isCompleted ? 'rgba(148, 163, 184, 0.05)' : 'background.paper',
                                            opacity: isCompleted ? 0.7 : 1,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                boxShadow: isCompleted ? 'none' : '0 20px 60px rgba(236, 19, 236, 0.05)',
                                                cursor: 'pointer',
                                            },
                                        }}
                                        onClick={() => navigate('/tasks')}
                                    >
                                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Checkbox
                                                    checked={isCompleted}
                                                    sx={{ color: 'rgba(236, 19, 236, 0.3)' }}
                                                />
                                                <Box>
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight={700}
                                                        sx={{
                                                            textDecoration: isCompleted ? 'line-through' : 'none',
                                                            color: isCompleted ? 'text.secondary' : 'text.primary',
                                                        }}
                                                    >
                                                        {task.title}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                bgcolor: isCompleted ? '#e2e8f0' : priorityColor.bg,
                                                                color: isCompleted ? '#64748b' : priorityColor.text,
                                                                px: 1,
                                                                py: 0.25,
                                                                borderRadius: 0.5,
                                                                fontWeight: 800,
                                                                textTransform: 'uppercase',
                                                                fontSize: '10px',
                                                                letterSpacing: '0.05em',
                                                            }}
                                                        >
                                                            {isCompleted ? 'Done' : task.priority}
                                                        </Typography>
                                                        {task.category && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                                <Folder sx={{ fontSize: 14 }} />
                                                                <Typography variant="caption">{task.category}</Typography>
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                {isCompleted ? (
                                                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CheckCircle sx={{ fontSize: 14 }} /> +{getXPForPriority(task.priority)} XP
                                                    </Typography>
                                                ) : (
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', color: '#ec13ec', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase' }}>
                                                            {getXPForPriority(task.priority)} XP
                                                        </Typography>
                                                    </Box>
                                                )}
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
                                                    <MoreVert />
                                                </IconButton>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Container>

            {/* Floating Action Button for Quick Add */}
            <Fab
                onClick={() => navigate('/tasks')}
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    bgcolor: '#ec13ec',
                    color: 'white',
                    '&:hover': {
                        bgcolor: '#d611d6',
                        transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s',
                    boxShadow: '0 10px 40px rgba(236, 19, 236, 0.4)',
                }}
            >
                <Add sx={{ fontSize: 32 }} />
            </Fab>
        </>
    );
};

export default Dashboard;
