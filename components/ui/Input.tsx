import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    isTextarea?: boolean;
    rows?: number;
}

const Input: React.FC<InputProps> = ({ label, id, isTextarea = false, className, ...props }) => {
    const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const baseClasses = "block w-full px-3 py-2 bg-background text-foreground border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background sm:text-sm";
    
    const combinedClasses = `${baseClasses} ${className || ''}`;

    return (
        <div>
            <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">
                {label}
            </label>
            {isTextarea ? (
                <textarea id={inputId} className={combinedClasses} {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}/>
            ) : (
                <input id={inputId} className={combinedClasses} {...props as React.InputHTMLAttributes<HTMLInputElement>} />
            )}
        </div>
    );
};

export default Input;