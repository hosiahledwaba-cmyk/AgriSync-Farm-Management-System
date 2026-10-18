export const getStartOfWeek = (date: Date = new Date()): Date => {
    const d = new Date(date);
    const day = d.getDay();
    // Monday as start of week (in JS Sunday is 0, Monday is 1)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const getMonthsInRange = (startDate: Date, endDate: Date): { year: number; month: number; label: string }[] => {
    const months: { year: number; month: number; label: string }[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    while (current <= end) {
        months.push({
            year: current.getFullYear(),
            month: current.getMonth(),
            label: `${monthNames[current.getMonth()]} '${String(current.getFullYear()).slice(-2)}`,
        });
        current.setMonth(current.getMonth() + 1);
    }
    return months;
};

export const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
