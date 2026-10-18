export const exportToCSV = (data: any[], fileName: string): void => {
    if (!data || !data.length) {
        alert('No data available to export.');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

    // Data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            if (val === null || val === undefined) return '""';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportInventoryUsageToCSV = (data: any[], fileName: string): void => {
    exportToCSV(data, fileName);
};

export const exportUsageLogsToCSV = (data: any[], fileName: string): void => {
    exportToCSV(data, fileName);
};
