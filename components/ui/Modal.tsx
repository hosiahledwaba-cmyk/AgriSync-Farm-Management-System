import React from 'react';
import { XIcon } from './Icon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-card rounded-lg shadow-xl w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto border border-border" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-card/80 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:bg-accent">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;