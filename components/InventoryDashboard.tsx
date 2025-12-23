import React, { useMemo, useState } from 'react';
import { InventoryItem, Role, Field, InventoryUsageLog, User } from '../types';
import Button from './ui/Button';
import KPICard from './ui/KPICard';
import { PlusIcon, ArchiveIcon, ShieldAlertIcon, PencilIcon, XIcon, MapPinIcon, FileDownIcon, FilterIcon } from './ui/Icon';
import { exportInventoryUsageToCSV } from '../utils/csvExport';

interface InventoryDashboardProps {
    inventoryItems: InventoryItem[];
    usageLogs: InventoryUsageLog[];
    users: User[];
    fields: Field[];
    onAddItem: () => void;
    onEditItem: (item: InventoryItem) => void;
    onDeleteItem: (itemId: number) => void;
    onWithdrawItem: () => void;
    canManage: boolean;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ inventoryItems, usageLogs, users, fields, onAddItem, onEditItem, onDeleteItem, onWithdrawItem, canManage }) => {
    const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');

    const lowStockItems = inventoryItems.filter(item => !item.isHarvestedGood && item.stock_qty <= item.reorder_level);
    const fieldsById = useMemo(() => fields.reduce((acc, f) => ({ ...acc, [f.id]: f.name }), {} as Record<number, string>), [fields]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Inventory Management</h2>
                <div className="flex gap-2">
                    <Button onClick={onWithdrawItem} variant="secondary">Record Withdrawal</Button>
                    {canManage && (
                        <Button onClick={onAddItem} icon={<PlusIcon />}>Add New Item</Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KPICard title="Total Item Types" value={inventoryItems.length.toString()} icon={<ArchiveIcon />} color="blue" />
                <KPICard title="Low Stock Alerts" value={lowStockItems.length.toString()} icon={<ShieldAlertIcon />} color={lowStockItems.length > 0 ? 'red' : 'green'} />
            </div>
            
            <div className="border-b border-border">
                <nav className="-mb-px flex gap-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('stock')} className={`px-3 py-2 font-semibold text-sm rounded-t-md transition-colors ${activeTab === 'stock' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-accent-foreground'}`}>Current Stock</button>
                    <button onClick={() => setActiveTab('history')} className={`px-3 py-2 font-semibold text-sm rounded-t-md transition-colors ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-accent-foreground'}`}>Usage History</button>
                </nav>
            </div>


            {activeTab === 'stock' && (
                <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                    <div className="overflow-x-auto responsive-table">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3">Item / Lot Name</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3 text-right">Stock</th>
                                    <th className="px-6 py-3">Unit</th>
                                    {canManage && <th className="px-6 py-3 text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryItems.map(item => {
                                    const isLowStock = !item.isHarvestedGood && item.stock_qty <= item.reorder_level;
                                    return (
                                        <tr key={item.id} className={`bg-card border-b border-border hover:bg-accent ${isLowStock ? 'bg-red-500/5' : ''}`}>
                                            <td data-label="Item" className="px-6 py-4 font-medium text-foreground">
                                                {item.name}
                                                {item.isHarvestedGood && item.sourceHarvestId && (
                                                    <span className="flex items-center text-xs text-muted-foreground mt-1">
                                                        <MapPinIcon className="h-3 w-3 mr-1" />
                                                        Harvested from {fieldsById[item.sourceHarvestId] || 'N/A'}
                                                    </span>
                                                )}
                                            </td>
                                            <td data-label="Category" className="px-6 py-4 text-muted-foreground">{item.category}</td>
                                            <td data-label="Stock" className={`px-6 py-4 text-right font-semibold ${isLowStock ? 'text-red-600' : 'text-foreground'}`}>
                                                {item.stock_qty.toLocaleString()}
                                                {!item.isHarvestedGood && (
                                                    <span className="text-xs font-normal text-muted-foreground"> / {item.reorder_level}</span>
                                                )}
                                                {isLowStock && <span className="ml-2 text-xs font-bold">(LOW)</span>}
                                            </td>
                                            <td data-label="Unit" className="px-6 py-4 text-muted-foreground">{item.unit}</td>
                                            {canManage && (
                                                <td data-label="Actions" className="px-6 py-4 text-center no-label">
                                                    <button 
                                                        onClick={() => onEditItem(item)} 
                                                        className="p-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                                                        title="Edit item"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => confirm('Are you sure you want to delete this item?') && onDeleteItem(item.id)} 
                                                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors ml-2"
                                                        title="Delete item"
                                                    >
                                                        <XIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {inventoryItems.length === 0 && <p className="text-center py-8 text-muted-foreground">No inventory items found.</p>}
                    </div>
                </div>
            )}
            {activeTab === 'history' && (
                <UsageHistoryView usageLogs={usageLogs} users={users} inventoryItems={inventoryItems} />
            )}
        </div>
    );
};


const UsageHistoryView: React.FC<{usageLogs: InventoryUsageLog[], users: User[], inventoryItems: InventoryItem[]}> = ({usageLogs, users, inventoryItems}) => {
    const [userFilter, setUserFilter] = useState('all');
    const [itemFilter, setItemFilter] = useState('all');

    const usersById = useMemo(() => users.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {} as Record<number, string>), [users]);
    const itemsById = useMemo(() => inventoryItems.reduce((acc, i) => ({ ...acc, [i.id]: i }), {} as Record<number, InventoryItem>), [inventoryItems]);

    const filteredLogs = useMemo(() => {
        return usageLogs.filter(log => {
            if (userFilter !== 'all' && log.userId !== parseInt(userFilter)) return false;
            if (itemFilter !== 'all' && log.inventoryItemId !== parseInt(itemFilter)) return false;
            return true;
        });
    }, [usageLogs, userFilter, itemFilter]);

    const handleExport = () => {
        const enrichedData = filteredLogs.map(log => ({
            ...log,
            userName: usersById[log.userId] || 'Unknown',
            itemCategory: itemsById[log.inventoryItemId]?.category || 'N/A',
            itemUnit: itemsById[log.inventoryItemId]?.unit || 'N/A',
        }));
        exportInventoryUsageToCSV(enrichedData, 'inventory_usage_report');
    };

    const selectClasses = "w-full sm:w-auto mt-1 block pl-3 pr-10 py-2 text-base border-input focus:outline-none focus:ring-ring focus:border-primary rounded-md bg-background shadow-sm";

    return (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div />
                 <div className="flex flex-wrap gap-2">
                    <select value={itemFilter} onChange={e => setItemFilter(e.target.value)} className={selectClasses}><option value="all">All Items</option>{inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
                    <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className={selectClasses}><option value="all">All Users</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
                    <Button onClick={handleExport} icon={<FileDownIcon />} variant="secondary">Export</Button>
                 </div>
            </div>
            <div className="overflow-x-auto responsive-table">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Item</th>
                            <th className="px-6 py-3 text-right">Quantity</th>
                            <th className="px-6 py-3">Withdrawn By</th>
                            <th className="px-6 py-3">Purpose</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="bg-card border-b border-border hover:bg-accent">
                                <td data-label="Date" className="px-6 py-4 text-muted-foreground">{new Date(log.date).toLocaleString()}</td>
                                <td data-label="Item" className="px-6 py-4 font-medium text-foreground">{log.inventoryItemName}</td>
                                <td data-label="Quantity" className="px-6 py-4 text-right font-semibold text-foreground">{log.quantity} {itemsById[log.inventoryItemId]?.unit}</td>
                                <td data-label="Withdrawn By" className="px-6 py-4 text-muted-foreground">{usersById[log.userId] || 'N/A'}</td>
                                <td data-label="Purpose" className="px-6 py-4 text-muted-foreground">{log.purpose}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && <p className="text-center py-8 text-muted-foreground">No usage history for the current filters.</p>}
            </div>
        </div>
    );
}

export default InventoryDashboard;