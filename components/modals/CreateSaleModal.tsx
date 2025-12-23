import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Sale, SaleItem, InventoryItem, Livestock, PaymentStatus, DeliveryStatus, LivestockStatus } from '../../types';
import { XIcon } from '../ui/Icon';
import { formatCurrency } from '../../utils/currency';

interface CreateSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'createdById'>) => Promise<unknown>;
    inventoryItems: InventoryItem[];
    livestock: Livestock[];
}

const CreateSaleModal: React.FC<CreateSaleModalProps> = ({ isOpen, onClose, onAddSale, inventoryItems, livestock }) => {
    const [buyerName, setBuyerName] = useState('');
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<SaleItem[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.Unpaid);
    const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(DeliveryStatus.Pending);
    const [notes, setNotes] = useState('');
    
    const availableCrops = useMemo(() => inventoryItems.filter(i => i.isHarvestedGood && i.stock_qty > 0), [inventoryItems]);
    const availableLivestock = useMemo(() => livestock.filter(l => l.status === LivestockStatus.Active), [livestock]);
    
    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    const addItem = (type: 'crop' | 'livestock', id: string | number) => {
        let newItem: SaleItem | null = null;
        if (type === 'crop') {
            const crop = availableCrops.find(c => c.id === id);
            if (crop) {
                newItem = {
                    id: `item_${new Date().getTime()}`,
                    type: 'crop',
                    inventoryItemId: crop.id,
                    description: crop.name,
                    quantity: 1,
                    unitPrice: crop.unit_cost || 0,
                    totalPrice: crop.unit_cost || 0
                };
            }
        } else {
            const animal = availableLivestock.find(l => l.id === id);
            if (animal) {
                 const name = animal.trackingType === 'Individual' ? animal.name || `Tag ${animal.tagId}` : animal.groupName;
                 newItem = {
                    id: `item_${new Date().getTime()}`,
                    type: 'livestock',
                    livestockId: animal.id,
                    description: `${animal.species}: ${name}`,
                    quantity: 1,
                    unitPrice: 0,
                    totalPrice: 0
                };
            }
        }
        if (newItem && !items.some(i => i.inventoryItemId === newItem.inventoryItemId && i.livestockId === newItem.livestockId)) {
            setItems(prev => [...prev, newItem!]);
        }
    };

    const updateItem = (itemId: string, updates: Partial<SaleItem>) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const updatedItem = { ...item, ...updates };
                if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
                    updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
                }
                return updatedItem;
            }
            return item;
        }));
    };
    
    const removeItem = (itemId: string) => setItems(prev => prev.filter(item => item.id !== itemId));

    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * 0.15; // 15% VAT for ZAR
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [items]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAddSale({
            saleDate,
            buyerName,
            items,
            subtotal: totals.subtotal,
            tax: totals.tax,
            discount: 0, // Not implemented
            total: totals.total,
            paymentStatus,
            deliveryStatus,
            notes,
        });
        onClose();
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Sale">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Buyer Name" value={buyerName} onChange={e => setBuyerName(e.target.value)} required />
                    <Input label="Sale Date" type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} required />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="font-semibold">Sale Items</h4>
                    <div className="space-y-2">
                        {items.map(item => {
                             const inventoryItem = item.inventoryItemId ? availableCrops.find(c => c.id === item.inventoryItemId) : null;
                             return (
                                <div key={item.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                                    <div className="flex-grow">{item.description}</div>
                                    <Input type="number" step="any" value={item.quantity} onChange={e => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })} className="w-24" label="" />
                                    {inventoryItem && <span className="text-sm text-muted-foreground">{inventoryItem.unit} (of {inventoryItem.stock_qty})</span>}
                                    <Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })} className="w-24" label=""/>
                                    <div className="w-24 text-right font-semibold">{formatCurrency(item.totalPrice)}</div>
                                    <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-muted-foreground hover:text-destructive"><XIcon className="h-4 w-4" /></button>
                                </div>
                             )
                        })}
                    </div>
                    <div className="flex gap-2">
                        <select onChange={e => addItem('crop', parseInt(e.target.value))} className={selectClasses} value="">
                            <option value="" disabled>Add Harvested Crop...</option>
                            {availableCrops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select onChange={e => addItem('livestock', e.target.value)} className={selectClasses} value="">
                             <option value="" disabled>Add Livestock...</option>
                             {availableLivestock.map(l => <option key={l.id} value={l.id}>{l.species}: {l.name || l.tagId || l.groupName}</option>)}
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-end items-center gap-4"><span className="text-muted-foreground">Subtotal:</span> <span className="font-semibold w-32 text-right">{formatCurrency(totals.subtotal)}</span></div>
                    <div className="flex justify-end items-center gap-4"><span className="text-muted-foreground">Tax (15%):</span> <span className="font-semibold w-32 text-right">{formatCurrency(totals.tax)}</span></div>
                    <div className="flex justify-end items-center gap-4 text-lg"><span className="text-foreground font-bold">Total:</span> <span className="font-bold w-32 text-right">{formatCurrency(totals.total)}</span></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Payment Status</label>
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as any)} className={selectClasses}>
                            {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Delivery Status</label>
                        <select value={deliveryStatus} onChange={e => setDeliveryStatus(e.target.value as any)} className={selectClasses}>
                            {Object.values(DeliveryStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} isTextarea/>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Finalize Sale</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateSaleModal;