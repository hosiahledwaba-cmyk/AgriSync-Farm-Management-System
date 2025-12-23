
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icon';

interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    isActive?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children, isActive = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const node = useRef<HTMLDivElement>(null);

    const handleClickOutside = (e: MouseEvent) => {
        if (node.current?.contains(e.target as Node)) {
            return;
        }
        setIsOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const triggerClasses = `inline-flex justify-center w-full items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive 
            ? 'bg-accent text-accent-foreground font-semibold' 
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`;

    return (
        <div ref={node} className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    className={triggerClasses}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    {trigger}
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-card ring-1 ring-black ring-opacity-5 focus:outline-none z-20 border border-border"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="p-1 space-y-1" role="menu" aria-orientation="vertical">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
