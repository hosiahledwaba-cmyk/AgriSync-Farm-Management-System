import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from './Icon';

const ThemeToggle: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            localStorage.setItem('theme', 'light');
            document.documentElement.classList.remove('dark');
        } else {
            localStorage.setItem('theme', 'dark');
            document.documentElement.classList.add('dark');
        }
        setIsDarkMode(!isDarkMode);
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Toggle theme"
        >
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
    );
};

export default ThemeToggle;
