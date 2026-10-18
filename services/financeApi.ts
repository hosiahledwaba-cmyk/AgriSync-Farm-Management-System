import { FinanceTransaction, TransactionType, TransactionCategory } from '../types';

const FINANCE_KEY = 'agrisync_finance_transactions';

const initialTransactions: FinanceTransaction[] = [
    {
        id: 'tx1',
        type: TransactionType.Income,
        description: 'Winter Wheat Bulk Grain Sale (81.9 t to AFGRI)',
        amount: 368550,
        category: TransactionCategory.CropLivestockSales,
        date: '2025-06-25T11:00:00Z',
        relatedEntityType: 'sale',
        relatedEntityName: 'AFGRI Grain Silo',
        createdByUserId: 1,
        createdAt: '2025-06-25T11:00:00Z',
    },
    {
        id: 'tx2',
        type: TransactionType.Expense,
        description: 'Certified Hybrid Maize Seed (PAN 6R-710BR)',
        amount: 48500,
        category: TransactionCategory.Supplies,
        date: '2025-04-10T09:30:00Z',
        relatedEntityType: 'field',
        relatedEntityId: 1,
        relatedEntityName: 'North Field',
        createdByUserId: 2,
        createdAt: '2025-04-10T09:30:00Z',
    },
    {
        id: 'tx3',
        type: TransactionType.Income,
        description: 'Grade A Egg Supply Contract (Local Markets)',
        amount: 14200,
        category: TransactionCategory.EggSales,
        date: '2025-08-05T14:15:00Z',
        relatedEntityType: 'sale',
        createdByUserId: 4,
        createdAt: '2025-08-05T14:15:00Z',
    },
    {
        id: 'tx4',
        type: TransactionType.Expense,
        description: 'Tractor A 1500-Hour Hydraulic & Engine Major Service',
        amount: 12800,
        category: TransactionCategory.Repairs,
        date: '2025-07-18T10:00:00Z',
        relatedEntityType: 'equipment',
        relatedEntityName: 'John Deere 6140M',
        createdByUserId: 2,
        createdAt: '2025-07-18T10:00:00Z',
    },
    {
        id: 'tx5',
        type: TransactionType.Expense,
        description: 'Eskom Agricultural Pumping & Center Pivot Power',
        amount: 9800,
        category: TransactionCategory.Utilities,
        date: '2025-08-01T08:00:00Z',
        createdByUserId: 4,
        createdAt: '2025-08-01T08:00:00Z',
    },
    {
        id: 'tx6',
        type: TransactionType.Income,
        description: 'Fresh Dairy Milk Tanker Collection (Clover)',
        amount: 32600,
        category: TransactionCategory.MilkSales,
        date: '2025-08-12T07:30:00Z',
        relatedEntityType: 'livestock',
        relatedEntityName: 'Dairy Herd',
        createdByUserId: 1,
        createdAt: '2025-08-12T07:30:00Z',
    },
];

export const getTransactions = async (): Promise<FinanceTransaction[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(FINANCE_KEY);
    if (!data) {
        localStorage.setItem(FINANCE_KEY, JSON.stringify(initialTransactions));
        return initialTransactions;
    }
    return JSON.parse(data);
};

export const addTransaction = async (
    transactionData: Omit<FinanceTransaction, 'id'>,
    createdByUserId: number
): Promise<FinanceTransaction> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getTransactions();
    const newTx: FinanceTransaction = {
        ...transactionData,
        id: `tx_${Date.now()}`,
        createdByUserId,
        createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...all];
    localStorage.setItem(FINANCE_KEY, JSON.stringify(updated));
    return newTx;
};

export const editTransaction = async (
    transactionId: string,
    updateData: Omit<FinanceTransaction, 'id'>,
    lastModifiedByUserId: number
): Promise<FinanceTransaction> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getTransactions();
    const idx = all.findIndex(t => t.id === transactionId);
    if (idx === -1) throw new Error('Transaction not found');
    const updated: FinanceTransaction = {
        ...all[idx],
        ...updateData,
        lastModifiedByUserId,
        lastModifiedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    localStorage.setItem(FINANCE_KEY, JSON.stringify(all));
    return updated;
};
