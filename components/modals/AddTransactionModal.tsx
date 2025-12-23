

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { FinanceTransaction, TransactionType, TransactionCategory, Field, Livestock, Equipment, InventoryItem, EquipmentStatus } from '../../types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTransaction: (transaction: Omit<FinanceTransaction, 'id'>) => Promise<unknown>;
    fields: Field[];
    livestock: Livestock[];
    equipment: Equipment[];
    inventoryItems: InventoryItem[];
    addInventoryItem: (item: Omit<InventoryItem, 'id' | 'farm_id'>) => Promise<InventoryItem | undefined>;
    editInventoryItem: (itemId: number, itemData: Partial<Omit<InventoryItem, 'id' | 'farm_id'>>) => Promise<InventoryItem | undefined>;
    addEquipment: (payload: { equipmentData: Omit<Equipment, 'id'>, purchasePrice: number }) => Promise<Equipment | undefined>;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAddTransaction, fields, livestock, equipment, inventoryItems, addInventoryItem, editInventoryItem, addEquipment }) => {
    const [type, setType] = useState<TransactionType>(TransactionType.Expense);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.Other);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [relatedEntityType, setRelatedEntityType] = useState<'field' | 'livestock' | 'equipment' | 'none'>('none');
    const [relatedEntityId, setRelatedEntityId] = useState<string>('');
    
    // Inventory linking state
    const [inventoryAction, setInventoryAction] = useState<'none' | 'update' | 'create'>('none');
    const [linkedInventoryId, setLinkedInventoryId] = useState('');
    const [quantityAdded, setQuantityAdded] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Supplies');
    const [newItemUnit, setNewItemUnit] = useState('');
    const [newItemReorderLevel, setNewItemReorderLevel] = useState('0');

    // Equipment linking state
    const [equipmentAction, setEquipmentAction] = useState<'link' | 'create'>('link');
    const [newEquipmentName, setNewEquipmentName] = useState('');
    const [newEquipmentType, setNewEquipmentType] = useState<'Tractor' | 'Combine' | 'Planter' | 'Sprayer' | 'Truck'>('Tractor');

    useEffect(() => {
        if (category === TransactionCategory.AssetPurchase && relatedEntityType === 'equipment' && equipmentAction === 'create') {
            setNewEquipmentName(description);
        }
    }, [description, category, relatedEntityType, equipmentAction]);

    const getLivestockName = (l: Livestock) => {
        return l.trackingType === 'Individual' ? `${l.species}: ${l.name || 'Tag ' + l.tagId}` : `${l.species}: ${l.groupName}`;
    }

    const resetForm = () => {
        setType(TransactionType.Expense);
        setDescription('');
        setAmount('');
        setCategory(TransactionCategory.Other);
        setDate(new Date().toISOString().split('T')[0]);
        setRelatedEntityType('none');
        setRelatedEntityId('');
        // Reset inventory fields
        setInventoryAction('none');
        setLinkedInventoryId('');
        setQuantityAdded('');
        setNewItemName('');
        setNewItemCategory('Supplies');
        setNewItemUnit('');
        setNewItemReorderLevel('0');
        // Reset equipment fields
        setEquipmentAction('link');
        setNewEquipmentName('');
        setNewEquipmentType('Tractor');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date) return;
        
        let relatedEntityTypeForTx: 'field' | 'livestock' | 'equipment' | undefined = relatedEntityType === 'none' ? undefined : relatedEntityType;
        let relatedEntityIdForTx: number | string | undefined = relatedEntityType !== 'none' && relatedEntityId ? (relatedEntityType === 'field' ? parseInt(relatedEntityId, 10) : relatedEntityId) : undefined;
        let selectedEntityName: string | undefined;

        const transactionAmount = parseFloat(amount);

        // Handle new equipment creation BEFORE transaction
        if (category === TransactionCategory.AssetPurchase && type === TransactionType.Expense && relatedEntityType === 'equipment' && equipmentAction === 'create' && newEquipmentName) {
            const newEquipment = await addEquipment({
                equipmentData: {
                    name: newEquipmentName,
                    type: newEquipmentType,
                    status: EquipmentStatus.Operational,
                    totalHours: 0,
                    nextMaintenanceHours: 250, // a reasonable default
                    fuelLevel: 100
                },
                purchasePrice: transactionAmount
            });

            if (newEquipment) {
                relatedEntityTypeForTx = 'equipment';
                relatedEntityIdForTx = newEquipment.id;
                selectedEntityName = newEquipment.name;
            }
        } else {
            // Existing logic to get selectedEntityName
            if (relatedEntityType === 'field' && relatedEntityId) {
                const selectedField = fields.find(f => f.id === parseInt(relatedEntityId, 10));
                selectedEntityName = selectedField?.name;
            } else if (relatedEntityType === 'livestock' && relatedEntityId) {
                const selectedLivestock = livestock.find(l => l.id === relatedEntityId);
                selectedEntityName = selectedLivestock ? getLivestockName(selectedLivestock) : undefined;
            } else if (relatedEntityType === 'equipment' && relatedEntityId) {
                const selectedEquipment = equipment.find(e => e.id === relatedEntityId);
                selectedEntityName = selectedEquipment?.name;
            }
        }

        await onAddTransaction({
            type,
            description,
            amount: transactionAmount,
            category,
            date,
            relatedEntityType: relatedEntityTypeForTx,
            relatedEntityId: relatedEntityIdForTx,
            relatedEntityName: selectedEntityName,
        });

        // --- Handle Inventory Updates ---
        if (category === TransactionCategory.Supplies && type === TransactionType.Expense) {
            const addedQty = parseFloat(quantityAdded);

            if (inventoryAction === 'update' && linkedInventoryId && addedQty > 0) {
                const itemToUpdate = inventoryItems.find(i => i.id === parseInt(linkedInventoryId));
                if (itemToUpdate) {
                    const oldQty = itemToUpdate.stock_qty;
                    const oldCost = itemToUpdate.unit_cost || 0;
                    const oldTotalValue = oldQty * oldCost;

                    const newQty = oldQty + addedQty;
                    const newTotalValue = oldTotalValue + transactionAmount;
                    const newUnitCost = newQty > 0 ? newTotalValue / newQty : 0;

                    await editInventoryItem(itemToUpdate.id, {
                        stock_qty: newQty,
                        unit_cost: newUnitCost,
                    });
                }
            } else if (inventoryAction === 'create' && newItemName && addedQty > 0 && newItemUnit) {
                const newUnitCost = transactionAmount / addedQty;
                await addInventoryItem({
                    name: newItemName,
                    category: newItemCategory,
                    unit: newItemUnit,
                    stock_qty: addedQty,
                    reorder_level: parseFloat(newItemReorderLevel) || 0,
                    unit_cost: newUnitCost,
                });
            }
        }

        handleClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";


    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Transaction">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                    <div className="flex gap-2">
                        <Button type="button" variant={type === TransactionType.Income ? 'primary' : 'secondary'} onClick={() => setType(TransactionType.Income)}>Income</Button>
                        <Button type="button" variant={type === TransactionType.Expense ? 'primary' : 'secondary'} onClick={() => setType(TransactionType.Expense)}>Expense</Button>
                    </div>
                </div>

                <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} required />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Amount (R)" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                    <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category-select" className="block text-sm font-medium text-foreground mb-1">Category</label>
                        <select
                            id="category-select"
                            value={category}
                            onChange={e => setCategory(e.target.value as TransactionCategory)}
                            className={selectClasses}
                        >
                            {Object.values(TransactionCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="related-entity-type-select" className="block text-sm font-medium text-foreground mb-1">Link to (optional)</label>
                        <select id="related-entity-type-select" value={relatedEntityType} onChange={e => {setRelatedEntityType(e.target.value as any); setRelatedEntityId('');}} className={selectClasses}>
                            <option value="none">None</option>
                            <option value="field">Field</option>
                            <option value="livestock">Livestock</option>
                            <option value="equipment">Equipment</option>
                        </select>
                    </div>
                </div>

                {/* Standard Linking for non-asset-purchase */}
                {relatedEntityType !== 'none' && !(category === TransactionCategory.AssetPurchase && relatedEntityType === 'equipment') && (
                    <div>
                        <label htmlFor="related-entity-select" className="block text-sm font-medium text-foreground mb-1">Select {relatedEntityType}</label>
                         <select id="related-entity-select" value={relatedEntityId} onChange={e => setRelatedEntityId(e.target.value)} className={selectClasses}>
                            <option value="">None</option>
                            {relatedEntityType === 'field' && fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            {relatedEntityType === 'livestock' && livestock.map(l => <option key={l.id} value={l.id}>{getLivestockName(l)}</option>)}
                            {relatedEntityType === 'equipment' && equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                )}
                
                {/* Special UI for Asset Purchase */}
                {category === TransactionCategory.AssetPurchase && type === TransactionType.Expense && relatedEntityType === 'equipment' && (
                     <div className="pt-4 mt-4 border-t border-border space-y-3 bg-muted/50 p-4 rounded-lg">
                        <h4 className="text-md font-semibold text-foreground">Asset Creation</h4>
                        <div className="flex items-center gap-4 text-sm">
                            <label><input type="radio" name="eq-action" value="link" checked={equipmentAction === 'link'} onChange={() => { setEquipmentAction('link'); }} className="mr-1" />Link to Existing</label>
                            <label><input type="radio" name="eq-action" value="create" checked={equipmentAction === 'create'} onChange={() => { setEquipmentAction('create'); setRelatedEntityId(''); }} className="mr-1" />Create New Asset</label>
                        </div>
                        
                        {equipmentAction === 'link' && (
                             <div>
                                <label htmlFor="equipment-select" className="block text-sm font-medium text-foreground mb-1">Select Equipment</label>
                                <select id="equipment-select" value={relatedEntityId} onChange={e => setRelatedEntityId(e.target.value)} className={selectClasses}>
                                    <option value="">None</option>
                                    {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                        )}
                        
                        {equipmentAction === 'create' && (
                            <div className="space-y-2 pt-2">
                                <Input label="New Equipment Name" value={newEquipmentName} onChange={e => setNewEquipmentName(e.target.value)} required/>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Equipment Type</label>
                                    <select value={newEquipmentType} onChange={e => setNewEquipmentType(e.target.value as any)} className={selectClasses}>
                                        <option value="Tractor">Tractor</option>
                                        <option value="Combine">Combine</option>
                                        <option value="Planter">Planter</option>
                                        <option value="Sprayer">Sprayer</option>
                                        <option value="Truck">Truck</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Inventory UI */}
                {category === TransactionCategory.Supplies && type === TransactionType.Expense && (
                    <div className="pt-4 mt-4 border-t border-border space-y-3 bg-muted/50 p-4 rounded-lg">
                        <h4 className="text-md font-semibold text-foreground">Inventory Impact</h4>
                        <p className="text-xs text-muted-foreground -mt-2">Optionally update your inventory stock from this expense.</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                            <label><input type="radio" name="inv-action" value="none" checked={inventoryAction === 'none'} onChange={e => setInventoryAction(e.target.value as any)} className="mr-1" />None</label>
                            <label><input type="radio" name="inv-action" value="update" checked={inventoryAction === 'update'} onChange={e => setInventoryAction(e.target.value as any)} className="mr-1" />Update Existing</label>
                            <label><input type="radio" name="inv-action" value="create" checked={inventoryAction === 'create'} onChange={e => setInventoryAction(e.target.value as any)} className="mr-1" />Create New</label>
                        </div>
                        
                        {inventoryAction === 'update' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end pt-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1">Inventory Item</label>
                                    <select value={linkedInventoryId} onChange={e => setLinkedInventoryId(e.target.value)} className={selectClasses} required>
                                        <option value="" disabled>Select item...</option>
                                        {inventoryItems.filter(i => !i.isHarvestedGood).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <Input label="Quantity Added" type="number" step="any" value={quantityAdded} onChange={e => setQuantityAdded(e.target.value)} required/>
                                </div>
                            </div>
                        )}
                        
                        {inventoryAction === 'create' && (
                            <div className="space-y-2 pt-2">
                                <Input label="New Item Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} required/>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <Input label="Unit" value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} required placeholder="e.g. kg, liters"/>
                                    <Input label="Quantity" type="number" step="any" value={quantityAdded} onChange={e => setQuantityAdded(e.target.value)} required/>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <Input label="Category" value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} required/>
                                    <Input label="Reorder Level" type="number" step="any" value={newItemReorderLevel} onChange={e => setNewItemReorderLevel(e.target.value)} required/>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Save Transaction</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddTransactionModal;