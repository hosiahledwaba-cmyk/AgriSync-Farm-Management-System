import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Sale, PaymentStatus, DeliveryStatus } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface EditSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditSale: (saleId: string, updates: Partial<Omit<Sale, 'id'>>) => Promise<unknown>;
    sale: Sale;
}

const EditSaleModal: React.FC<EditSaleModalProps> = ({ isOpen, onClose, onEditSale, sale }) => {
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(sale.paymentStatus);
    const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(sale.deliveryStatus);
    const [notes, setNotes] = useState(sale.notes || '');

    useEffect(() => {
        if (sale) {
            setPaymentStatus(sale.paymentStatus);
            setDeliveryStatus(sale.deliveryStatus);
            setNotes(sale.notes || '');
        }
    }, [sale]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updates: Partial<Omit<Sale, 'id'>> = {
            paymentStatus,
            deliveryStatus,
            notes,
        };
        await onEditSale(sale.id, updates);
        onClose();
    };

    const selectClasses = "block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Update Sale #${sale.id.slice(-6).toUpperCase()}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-muted rounded-lg border border-border">
                    <p><strong>Buyer:</strong> {sale.buyerName}</p>
                    <p><strong>Date:</strong> {new Date(sale.saleDate).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> {formatCurrency(sale.total)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Payment Status</label>
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as PaymentStatus)} className={selectClasses}>
                            {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Delivery Status</label>
                        <select value={deliveryStatus} onChange={e => setDeliveryStatus(e.target.value as DeliveryStatus)} className={selectClasses}>
                            {Object.values(DeliveryStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                
                <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} isTextarea />
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditSaleModal;