export const formatCurrency = (amount: number, decimals: number = 2): string => {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(val);
};
