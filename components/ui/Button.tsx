import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md';
    icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon, className, ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-input',
    };

    const sizeClasses = {
        sm: children ? 'px-3 py-1.5 text-sm' : 'p-1.5',
        md: children ? 'px-4 py-2 text-base' : 'p-2',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button className={combinedClasses} {...props}>
            {icon && <span className={children ? "mr-2 h-5 w-5" : "h-5 w-5"}>{icon}</span>}
            {children}
        </button>
    );
};

export default Button;