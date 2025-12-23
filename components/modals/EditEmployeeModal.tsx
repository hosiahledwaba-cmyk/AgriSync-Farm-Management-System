import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { User, Role } from '../../types';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditEmployee: (userId: number, updates: Partial<Omit<User, 'id'>>) => void;
    employee: User;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, onEditEmployee, employee }) => {
    const [name, setName] = useState(employee.name);
    const [role, setRole] = useState<Role>(employee.role);
    const [wageRate, setWageRate] = useState(String(employee.wageRate || ''));

    useEffect(() => {
        if (employee) {
            setName(employee.name);
            setRole(employee.role);
            setWageRate(String(employee.wageRate || ''));
        }
    }, [employee]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onEditEmployee(employee.id, {
            name,
            role,
            wageRate: parseFloat(wageRate) || 0,
        });
        onClose();
    };
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${employee.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value as Role)} className={selectClasses}>
                            {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <Input label="Hourly Wage Rate (R)" type="number" step="1" value={wageRate} onChange={e => setWageRate(e.target.value)} required />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditEmployeeModal;
