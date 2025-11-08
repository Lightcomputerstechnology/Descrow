import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const exportService = {
  /**
   * Export transactions to CSV
   */
  exportToCSV: (transactions, filename = 'transactions.csv') => {
    // CSV headers
    const headers = [
      'ID',
      'Title',
      'Amount',
      'Currency',
      'Status',
      'Buyer',
      'Seller',
      'Created Date',
      'Completed Date'
    ];

    // Convert data to CSV rows
    const rows = transactions.map(t => [
      t._id,
      t.title,
      t.amount,
      t.currency,
      t.status,
      t.buyer?.name || t.buyer?.email || 'N/A',
      t.seller?.name || t.seller?.email || 'N/A',
      new Date(t.createdAt).toLocaleDateString(),
      t.delivery?.confirmedAt ? new Date(t.delivery.confirmedAt).toLocaleDateString() : 'N/A'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export transactions to PDF
   */
  exportToPDF: (transactions, user, filename = 'transactions.pdf') => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('Transaction Report', 14, 22);

    // Add user info
    doc.setFontSize(10);
    doc.text(`Generated for: ${user.name}`, 14, 32);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14,
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);
    doc.text(`Total Transactions: ${transactions.length}`, 14, 44);

    // Calculate totals
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const completedCount = transactions.filter(t => ['completed', 'paid_out'].includes(t.status)).length;

    doc.text(`Total Volume: $${totalAmount.toLocaleString()}`, 14, 50);
    doc.text(`Completed: ${completedCount}`, 14, 56);

    // Table data
    const tableData = transactions.map(t => [
      t._id.slice(-8),
      t.title.length > 30 ? t.title.substring(0, 27) + '...' : t.title,
      `$${t.amount.toLocaleString()}`,
      t.status,
      new Date(t.createdAt).toLocaleDateString()
    ]);

    // Add table
    doc.autoTable({
      startY: 65,
      head: [['ID', 'Title', 'Amount', 'Status', 'Date']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: 65 }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(filename);
  },

  /**
   * Export to Excel (XLSX format)
   */
  exportToExcel: async (transactions, filename = 'transactions.xlsx') => {
    // This requires xlsx library
    // For now, we'll use CSV format which Excel can open
    exportService.exportToCSV(transactions, filename.replace('.xlsx', '.csv'));
  },

  /**
   * Generate tax summary report
   */
  generateTaxReport: (transactions, user, taxYear) => {
    const doc = new jsPDF();

    // Filter transactions for tax year
    const yearTransactions = transactions.filter(t => {
      const year = new Date(t.createdAt).getFullYear();
      return year === taxYear;
    });

    // Calculate tax summary
    const buyingTotal = yearTransactions
      .filter(t => t.buyer?._id === user.id || t.buyer === user.id)
      .reduce((sum, t) => sum + (t.payment?.buyerPays || t.amount), 0);

    const sellingTotal = yearTransactions
      .filter(t => t.seller?._id === user.id || t.seller === user.id)
      .reduce((sum, t) => sum + (t.payment?.sellerReceives || t.amount), 0);

    const platformFees = yearTransactions
      .reduce((sum, t) => {
        if (t.buyer?._id === user.id || t.buyer === user.id) {
          return sum + (t.payment?.buyerFee || 0);
        }
        if (t.seller?._id === user.id || t.seller === user.id) {
          return sum + (t.payment?.sellerFee || 0);
        }
        return sum;
      }, 0);

    // Title
    doc.setFontSize(20);
    doc.text(`Tax Summary Report - ${taxYear}`, 14, 22);

    // User info
    doc.setFontSize(10);
    doc.text(`Name: ${user.name}`, 14, 35);
    doc.text(`Email: ${user.email}`, 14, 41);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 47);

    // Summary section
    doc.setFontSize(14);
    doc.text('Summary', 14, 60);
    
    doc.setFontSize(10);
    doc.text(`Total Transactions: ${yearTransactions.length}`, 14, 70);
    doc.text(`Total Purchases: $${buyingTotal.toLocaleString()}`, 14, 76);
    doc.text(`Total Sales: $${sellingTotal.toLocaleString()}`, 14, 82);
    doc.text(`Net Income: $${(sellingTotal - buyingTotal).toLocaleString()}`, 14, 88);
    doc.text(`Platform Fees Paid: $${platformFees.toLocaleString()}`, 14, 94);

    // Monthly breakdown
    doc.setFontSize(14);
    doc.text('Monthly Breakdown', 14, 110);

    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthTransactions = yearTransactions.filter(t => {
        return new Date(t.createdAt).getMonth() === month;
      });

      const monthBuying = monthTransactions
        .filter(t => t.buyer?._id === user.id || t.buyer === user.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const monthSelling = monthTransactions
        .filter(t => t.seller?._id === user.id || t.seller === user.id)
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push([
        new Date(taxYear, month).toLocaleString('default', { month: 'long' }),
        monthTransactions.length,
        `$${monthBuying.toLocaleString()}`,
        `$${monthSelling.toLocaleString()}`,
        `$${(monthSelling - monthBuying).toLocaleString()}`
      ]);
    }

    doc.autoTable({
      startY: 115,
      head: [['Month', 'Count', 'Purchases', 'Sales', 'Net']],
      body: monthlyData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246]
      }
    });

    // Disclaimer
    const finalY = doc.previousAutoTable.finalY || 115;
    doc.setFontSize(8);
    doc.text(
      'Note: This report is for informational purposes only. Please consult with a tax professional.',
      14,
      finalY + 15,
      { maxWidth: 180 }
    );

    doc.save(`tax-report-${taxYear}.pdf`);
  }
};

export default exportService;
