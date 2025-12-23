

import React, { useMemo } from 'react';
import { Sale, Role, PaymentStatus, DeliveryStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import KPICard from './ui/KPICard';
import { PlusIcon, DollarSignIcon, BarChartIcon, PencilIcon } from './ui/Icon';
import { formatCurrency } from '../utils/currency';
import CategoryPieChart from './ui/CategoryPieChart';

interface SalesDashboardProps {
    sales: Sale[];
    onCreateSale: () => void;
    onEditSale: (sale: Sale) => void;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ sales, onCreateSale, onEditSale }) => {
    const { user } = useAuth();
    const canManage = user.role === Role.Owner || user.role === Role.Manager || user.role === Role.Accountant;

    const summary = useMemo(() => {
        const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
        const totalSales = sales.length;
        const unpaidInvoices = sales.filter(s => s.paymentStatus === PaymentStatus.Unpaid).length;
        return { totalRevenue, totalSales, unpaidInvoices };
    }, [sales]);

    const salesReportData = useMemo(() => {
        const byCategory = sales.reduce((acc: { Crops: number; Livestock: number }, sale) => {
            sale.items.forEach(item => {
                if (item.type === 'crop') {
                    acc.Crops += item.totalPrice;
                } else if (item.type === 'livestock') {
                    acc.Livestock += item.totalPrice;
                }
            });
            return acc;
        }, { Crops: 0, Livestock: 0 });

        const byPaymentStatus = sales.reduce((acc: Record<PaymentStatus, number>, sale) => {
            acc[sale.paymentStatus] = (acc[sale.paymentStatus] || 0) + sale.total;
            return acc;
        }, {} as Record<PaymentStatus, number>);

        // FIX: Removed explicit type arguments in map as they are now correctly inferred from the typed reduce accumulator.
        const categoryChartData = Object.entries(byCategory)
            .map(([label, value]: [string, number]) => ({ label, value }))
            .filter(d => d.value > 0);

        // FIX: Removed explicit type arguments in map as they are now correctly inferred from the typed reduce accumulator.
        const paymentStatusChartData = Object.entries(byPaymentStatus)
            .map(([label, value]: [string, number]) => ({ label, value }))
            .filter(d => d.value > 0);

        return { categoryChartData, paymentStatusChartData };
    }, [sales]);


    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    const getStatusChip = (status: PaymentStatus | DeliveryStatus) => {
        const styles: { [key: string]: string } = {
            [PaymentStatus.Paid]: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
            [PaymentStatus.Unpaid]: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
            [PaymentStatus.PartiallyPaid]: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
            [DeliveryStatus.Pending]: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
            [DeliveryStatus.Shipped]: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
            [DeliveryStatus.Delivered]: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
            [DeliveryStatus.Cancelled]: 'bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-300',
        };
        return `px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${styles[status] || 'bg-muted text-muted-foreground'}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Sales Hub</h2>
                {canManage && (
                    <Button onClick={onCreateSale} icon={<PlusIcon />}>
                        Create Sale
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} icon={<DollarSignIcon />} color="green" />
                <KPICard title="Total Sales" value={summary.totalSales.toString()} icon={<BarChartIcon />} color="blue" />
                <KPICard title="Unpaid Invoices" value={summary.unpaidInvoices.toString()} icon={<DollarSignIcon />} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryPieChart title="Sales by Category" data={salesReportData.categoryChartData} />
                <CategoryPieChart title="Sales by Payment Status" data={salesReportData.paymentStatusChartData} />
            </div>
            
            <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
                <h3 className="text-xl font-semibold text-foreground mb-4">Sales History</h3>
                <div className="overflow-x-auto responsive-table">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Invoice ID</th>
                                <th className="px-6 py-3">Buyer</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-center">Payment Status</th>
                                <th className="px-6 py-3 text-center">Delivery Status</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr key={sale.id} className="bg-card border-b border-border hover:bg-accent">
                                    <td data-label="Date" className="px-6 py-4 text-foreground">{formatDate(sale.saleDate)}</td>
                                    <td data-label="Invoice ID" className="px-6 py-4 font-mono text-muted-foreground">{sale.id.slice(-6).toUpperCase()}</td>
                                    <td data-label="Buyer" className="px-6 py-4 font-medium text-foreground">{sale.buyerName}</td>
                                    <td data-label="Total" className="px-6 py-4 text-right font-semibold text-foreground">{formatCurrency(sale.total)}</td>
                                    <td data-label="Payment" className="px-6 py-4 text-center">
                                        <span className={getStatusChip(sale.paymentStatus)}>{sale.paymentStatus}</span>
                                    </td>
                                    <td data-label="Delivery" className="px-6 py-4 text-center">
                                        <span className={getStatusChip(sale.deliveryStatus)}>{sale.deliveryStatus}</span>
                                    </td>
                                    <td data-label="Actions" className="px-6 py-4 text-center no-label">
                                        <button 
                                            onClick={() => onEditSale(sale)} 
                                            className="p-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                                            title="Update Sale Status"
                                            aria-label="Update Sale Status"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sales.length === 0 && <p className="text-center py-8 text-muted-foreground">No sales recorded yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;