import { Sale, PaymentStatus, DeliveryStatus } from '../types';

const SALES_KEY = 'agrisync_sales';

const initialSales: Sale[] = [
    {
        id: 'sale1',
        saleDate: '2025-06-25T11:00:00Z',
        buyerName: 'AFGRI Grain Operations',
        items: [
            {
                id: 'sitem1',
                type: 'crop',
                description: 'Winter Wheat (Grade 1 Milling)',
                quantity: 81.9,
                unitPrice: 4500,
                totalPrice: 368550,
            },
        ],
        subtotal: 368550,
        tax: 0,
        discount: 0,
        total: 368550,
        paymentStatus: PaymentStatus.Paid,
        deliveryStatus: DeliveryStatus.Delivered,
        notes: 'Delivered directly to local elevator silo.',
        createdById: 1,
        createdAt: '2025-06-25T11:00:00Z',
    },
    {
        id: 'sale2',
        saleDate: '2025-08-05T14:15:00Z',
        buyerName: 'Freshmark Pick n Pay DC',
        items: [
            {
                id: 'sitem2',
                type: 'crop',
                description: 'Grade A Farm Fresh Brown Eggs (30-egg trays)',
                quantity: 284,
                unitPrice: 50,
                totalPrice: 14200,
            },
        ],
        subtotal: 14200,
        tax: 0,
        discount: 0,
        total: 14200,
        paymentStatus: PaymentStatus.Paid,
        deliveryStatus: DeliveryStatus.Delivered,
        notes: 'Weekly fresh egg delivery batch #31',
        createdById: 4,
        createdAt: '2025-08-05T14:15:00Z',
    },
    {
        id: 'sale3',
        saleDate: '2025-08-16T10:00:00Z',
        buyerName: 'Clover SA Dairy Procurement',
        items: [
            {
                id: 'sitem3',
                type: 'livestock',
                description: 'Raw Whole Milk (Tanker Collection)',
                quantity: 5200,
                unitPrice: 6.5,
                totalPrice: 33800,
            },
        ],
        subtotal: 33800,
        tax: 0,
        discount: 0,
        total: 33800,
        paymentStatus: PaymentStatus.Unpaid,
        deliveryStatus: DeliveryStatus.Pending,
        notes: 'Scheduled tanker pickup Saturday morning',
        createdById: 1,
        createdAt: '2025-08-14T10:00:00Z',
    },
];

export const getSales = async (): Promise<Sale[]> => {
    await new Promise(r => setTimeout(r, 100));
    const data = localStorage.getItem(SALES_KEY);
    if (!data) {
        localStorage.setItem(SALES_KEY, JSON.stringify(initialSales));
        return initialSales;
    }
    return JSON.parse(data);
};

export const addSale = async (saleData: Omit<Sale, 'id'>): Promise<Sale> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getSales();
    const newSale: Sale = {
        ...saleData,
        id: `sale_${Date.now()}`,
    };
    const updated = [newSale, ...all];
    localStorage.setItem(SALES_KEY, JSON.stringify(updated));
    return newSale;
};

export const updateSale = async (saleId: string, updates: Partial<Omit<Sale, 'id'>>): Promise<Sale> => {
    await new Promise(r => setTimeout(r, 150));
    const all = await getSales();
    const idx = all.findIndex(s => s.id === saleId);
    if (idx === -1) throw new Error('Sale not found');
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    localStorage.setItem(SALES_KEY, JSON.stringify(all));
    return updated;
};
