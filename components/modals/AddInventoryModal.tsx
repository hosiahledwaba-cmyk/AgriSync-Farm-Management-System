
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { InventoryItem } from '../../types';

interface AddInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddInventoryItem: (item: Omit<InventoryItem, 'id' | 'farm_id'>) => Promise<unknown>;
}

const AddInventoryModal: React.FC<AddInventoryModalProps> = ({ isOpen, onClose, onAddInventoryItem }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('');
    const [stockQty, setStockQty] = useState('');
    const [reorderLevel, setReorderLevel] = useState('');
    const [unitCost, setUnitCost] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAddInventoryItem({
            name,
            category,
            unit,
            stock_qty: parseFloat(stockQty),
            reorder_level: parseFloat(reorderLevel),
            unit_cost: parseFloat(unitCost) || undefined,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Inventory Item">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Item Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Nitrogen Fertilizer"/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Category" value={category} onChange={e => setCategory(e.target.value)} required placeholder="e.g., Seeds, Fuel" />
                    <Input label="Unit" value={unit} onChange={e => setUnit(e.target.value)} required placeholder="kg, liters, bags" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Current Stock Quantity" type="number" step="any" value={stockQty} onChange={e => setStockQty(e.target.value)} required />
                    <div>
                        <Input label="Reorder Level" type="number" step="any" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} required />
                        <p className="text-xs text-muted-foreground pt-1">Alert when stock is at or below this level.</p>
                    </div>
                </div>
                <div>
                    <Input label="Unit Cost (R)" type="number" step="0.01" value={unitCost} onChange={e => setUnitCost(e.target.value)} placeholder="Optional, for valuation" />
                    <p className="text-xs text-muted-foreground pt-1">Creates a 'Supplies' expense automatically if a cost is entered.</p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Item</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddInventoryModal;
