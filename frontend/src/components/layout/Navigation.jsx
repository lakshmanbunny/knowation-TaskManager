import { AppBar, Toolbar, Typography, IconButton, Box, Menu, MenuItem, Avatar, Button } from '@mui/material';
import { Brightness4, Brightness7, Logout, Dashboard, Assignment, Search, CalendarMonth } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useThemeMode } from '../../context/ThemeContext';
import { useState } from 'react';

function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const theme = useMuiTheme();
    const { toggleTheme } = useThemeMode();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleClose();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(34, 16, 34, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid',
                borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(236, 19, 236, 0.2)'
                    : 'rgba(236, 19, 236, 0.1)',
            }}
        >
            <Toolbar sx={{ maxWidth: 'lg', width: '100%', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 6 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: '#ec13ec',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '18px',
                        }}
                    >
                        ⚡
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: '#ec13ec',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        TaskMaster
                    </Typography>
                </Box>

                {/* Navigation Links */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, flexGrow: 1 }}>
                    <Button
                        startIcon={<Dashboard />}
                        onClick={() => navigate('/dashboard')}
                        sx={{
                            color: isActive('/dashboard') ? '#ec13ec' : theme.palette.text.secondary,
                            fontWeight: isActive('/dashboard') ? 600 : 400,
                            textTransform: 'none',
                            px: 0,
                            minWidth: 'auto',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                color: '#ec13ec',
                            },
                        }}
                    >
                        Dashboard
                    </Button>
                    <Button
                        startIcon={<Assignment />}
                        onClick={() => navigate('/tasks')}
                        sx={{
                            color: isActive('/tasks') ? '#ec13ec' : theme.palette.text.secondary,
                            fontWeight: isActive('/tasks') ? 600 : 400,
                            textTransform: 'none',
                            px: 0,
                            minWidth: 'auto',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                color: '#ec13ec',
                            },
                        }}
                    >
                        Tasks
                    </Button>
                    <Button
                        startIcon={<CalendarMonth />}
                        onClick={() => navigate('/calendar')}
                        sx={{
                            color: isActive('/calendar') ? '#ec13ec' : theme.palette.text.secondary,
                            fontWeight: isActive('/calendar') ? 600 : 400,
                            textTransform: 'none',
                            px: 0,
                            minWidth: 'auto',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                color: '#ec13ec',
                            },
                        }}
                    >
                        Calendar
                    </Button>
                </Box>

                {/* Right side actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Search Button */}
                    <IconButton
                        sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                bgcolor: 'rgba(236, 19, 236, 0.1)',
                            },
                        }}
                        onClick={() => {
                            // TODO: Implement search functionality
                            console.log('Search clicked');
                        }}
                    >
                        <Search />
                    </IconButton>

                    {/* Dark Mode Toggle */}
                    <IconButton
                        onClick={toggleTheme}
                        sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                bgcolor: 'rgba(236, 19, 236, 0.1)',
                            },
                        }}
                    >
                        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>

                    {/* Divider */}
                    {/* <Box
                        sx={{
                            width: 1,
                            height: 32,
                            bgcolor: 'rgba(236, 19, 236, 0.2)',
                            mx: 1,
                        }}
                    /> */}

                    {/* User Menu */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            pl: 1,
                            '&:hover .avatar': {
                                borderColor: '#ec13ec',
                            },
                        }}
                        onClick={handleMenu}
                    >
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' }, lineHeight: 1 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ display: 'block', mb: 0.25 }}>
                                {user?.username}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ec13ec', fontWeight: 600, fontSize: '10px', display: 'block' }}>
                                Pro Member
                            </Typography>
                        </Box>
                        <Avatar
                            className="avatar"
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#ec13ec',
                                border: '2px solid',
                                borderColor: 'rgba(236, 19, 236, 0.2)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                borderRadius: 2,
                                minWidth: 200,
                            },
                        }}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </MenuItem>

                        {/* Mobile Navigation Links in Menu */}
                        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                            <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                                <Dashboard fontSize="small" sx={{ mr: 1 }} />
                                Dashboard
                            </MenuItem>
                            <MenuItem onClick={() => { navigate('/tasks'); handleClose(); }}>
                                <Assignment fontSize="small" sx={{ mr: 1 }} />
                                Tasks
                            </MenuItem>
                            <MenuItem onClick={() => { navigate('/calendar'); handleClose(); }}>
                                <CalendarMonth fontSize="small" sx={{ mr: 1 }} />
                                Calendar
                            </MenuItem>
                        </Box>

                        <MenuItem onClick={handleLogout}>
                            <Logout fontSize="small" sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar >
    );
}

export default Navigation;
