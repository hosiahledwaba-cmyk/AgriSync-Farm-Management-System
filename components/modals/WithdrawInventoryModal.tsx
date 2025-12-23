import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { InventoryItem, InventoryUsageLog } from '../../types';

interface WithdrawInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onWithdraw: (logData: Omit<InventoryUsageLog, 'id' | 'userId' | 'date' | 'inventoryItemName'>) => void;
    inventoryItems: InventoryItem[];
}

const WithdrawInventoryModal: React.FC<WithdrawInventoryModalProps> = ({ isOpen, onClose, onWithdraw, inventoryItems }) => {
    const [itemId, setItemId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [purpose, setPurpose] = useState('');
    const [error, setError] = useState('');

    const consumableItems = useMemo(() => {
        return inventoryItems.filter(item => !item.isHarvestedGood && item.stock_qty > 0);
    }, [inventoryItems]);

    const selectedItem = useMemo(() => {
        return consumableItems.find(item => item.id === parseInt(itemId));
    }, [itemId, consumableItems]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseFloat(quantity);

        if (!selectedItem || isNaN(qty) || qty <= 0) {
            setError('Please select an item and enter a valid quantity.');
            return;
        }
        if (qty > selectedItem.stock_qty) {
            setError(`Cannot withdraw more than available stock (${selectedItem.stock_qty} ${selectedItem.unit}).`);
            return;
        }

        onWithdraw({
            inventoryItemId: selectedItem.id,
            quantity: qty,
            purpose,
        });
        onClose();
    };

    const handleClose = () => {
        setItemId('');
        setQuantity('');
        setPurpose('');
        setError('');
        onClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Record Inventory Withdrawal">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="item-select" className="block text-sm font-medium text-foreground mb-1">Item</label>
                    <select
                        id="item-select"
                        value={itemId}
                        onChange={e => {
                            setItemId(e.target.value);
                            setError('');
                        }}
                        required
                        className={selectClasses}
                    >
                        <option value="" disabled>Select a consumable item...</option>
                        {consumableItems.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name} ({item.stock_qty} {item.unit} available)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <Input
                        label="Quantity Withdrawn"
                        type="number"
                        step="any"
                        value={quantity}
                        onChange={e => {
                            setQuantity(e.target.value);
                            setError('');
                        }}
                        required
                    />
                    {selectedItem && <span className="text-muted-foreground pb-2">{selectedItem.unit}</span>}
                </div>

                <Input
                    label="Purpose"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    isTextarea
                    required
                    placeholder="e.g., Planting in North Field, spraying potatoes"
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Record Withdrawal</Button>
                </div>
            </form>
        </Modal>
    );
};

export default WithdrawInventoryModal;