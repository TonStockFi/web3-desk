import { createTheme, Theme, ThemeProvider } from '@mui/material/styles';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React, { createContext, ReactNode, useContext } from 'react';

const AppContext = createContext<Theme | undefined>(undefined);
export const DarkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: 'rgb(16, 22, 31)',
            paper: 'rgb(16, 22, 31)'
            // paper: 'rgb(16,24,40)'
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                contained: {
                    backgroundColor: '#45AEF5', // Custom background color for contained buttons
                    color: '#ffffff' // Custom text color for contained buttons
                }
            }
        }
    }
});

export const _Provider = ({ theme, children }: { theme?: Theme; children: ReactNode }) => {
    if (!theme) {
        theme = DarkTheme;
    }
    return <AppContext.Provider value={theme}>{children}</AppContext.Provider>;
};

export const useAppTheme = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an Provider');
    }
    return context;
};

export const IThemeProvider = ({
    theme,
    children
}: {
    theme?: Theme;
    children: React.ReactNode;
}) => {
    return (
        <_Provider theme={theme}>
            <ThemeProvider theme={theme || DarkTheme}>{children}</ThemeProvider>
        </_Provider>
    );
};
