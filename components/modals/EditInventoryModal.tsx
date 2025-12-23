
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { InventoryItem } from '../../types';

interface EditInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditInventoryItem: (itemId: number, item: Partial<Omit<InventoryItem, 'id' | 'farm_id'>>) => Promise<unknown>;
    item: InventoryItem;
}

const EditInventoryModal: React.FC<EditInventoryModalProps> = ({ isOpen, onClose, onEditInventoryItem, item }) => {
    const [name, setName] = useState(item.name);
    const [category, setCategory] = useState(item.category);
    const [unit, setUnit] = useState(item.unit);
    const [stockQty, setStockQty] = useState(String(item.stock_qty));
    const [reorderLevel, setReorderLevel] = useState(String(item.reorder_level));
    const [unitCost, setUnitCost] = useState(String(item.unit_cost || ''));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onEditInventoryItem(item.id, {
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
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${item.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Item Name" value={name} onChange={e => setName(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Category" value={category} onChange={e => setCategory(e.target.value)} required />
                    <Input label="Unit" value={unit} onChange={e => setUnit(e.target.value)} required />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Current Stock Quantity" type="number" step="any" value={stockQty} onChange={e => setStockQty(e.target.value)} required />
                    <Input label="Reorder Level" type="number" step="any" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} required />
                </div>
                <Input label="Unit Cost (R)" type="number" step="0.01" value={unitCost} onChange={e => setUnitCost(e.target.value)} placeholder="Optional, for valuation" />
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditInventoryModal;
