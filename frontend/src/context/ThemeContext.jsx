import { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'light';
    });

    const toggleTheme = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: mode === 'light' ? '#667eea' : '#764ba2',
                    },
                    secondary: {
                        main: mode === 'light' ? '#f093fb' : '#f5576c',
                    },
                    background: {
                        default: mode === 'light' ? '#f5f5f5' : '#121212',
                        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
                    },
                    // Gamification colors
                    xp: {
                        main: '#FFD700', // Gold
                    },
                    streak: {
                        main: '#FF6B35', // Fire orange
                    },
                    achievement: {
                        main: '#9C27B0', // Purple
                    },
                },
                typography: {
                    fontFamily: '"Manrope", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: { fontWeight: 700 },
                    h2: { fontWeight: 700 },
                    h3: { fontWeight: 600 },
                    h4: { fontWeight: 600 },
                    h5: { fontWeight: 600 },
                    h6: { fontWeight: 600 },
                },
                // Custom gradients for gamification
                gradients: {
                    level: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    streak: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    tasks: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    achievements: 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)',
                },
                shape: {
                    borderRadius: 12,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                fontWeight: 600,
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                boxShadow: mode === 'light'
                                    ? '0 2px 8px rgba(0,0,0,0.1)'
                                    : '0 2px 8px rgba(0,0,0,0.3)',
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    const value = {
        mode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};
