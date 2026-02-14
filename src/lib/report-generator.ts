import { SpendingReport, TrendReport, Transaction, Category, CategorySpending, TrendDataPoint } from '@/types';
import { startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';
import jsPDF from 'jspdf';

export async function generateSpendingReport(
  userId: string,
  transactions: Transaction[],
  categories: Category[],
  startDate: Date,
  endDate: Date
): Promise<SpendingReport> {
  const categoryMap = new Map(categories.map(c => [c._id, c.name]));

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  const categoryBreakdown = generateCategoryBreakdown(filteredTransactions, categoryMap);

  const topExpenseCategories = [...categoryBreakdown]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyAverageExpense = totalExpenses / daysDiff;

  return {
    userId,
    startDate,
    endDate,
    totalIncome,
    totalExpenses,
    netSavings,
    categoryBreakdown,
    topExpenseCategories,
    dailyAverageExpense,
    generatedAt: new Date(),
  };
}

export function generateCategoryBreakdown(
  transactions: Transaction[],
  categoryMap: Map<string, string>
): CategorySpending[] {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryData: Record<string, { totalAmount: number; transactionCount: number }> = {};

  for (const transaction of expenseTransactions) {
    const categoryId = transaction.categoryId;
    if (!categoryData[categoryId]) {
      categoryData[categoryId] = { totalAmount: 0, transactionCount: 0 };
    }
    categoryData[categoryId].totalAmount += transaction.amount;
    categoryData[categoryId].transactionCount += 1;
  }

  const categoryBreakdown: CategorySpending[] = [];

  for (const [categoryId, data] of Object.entries(categoryData)) {
    const categoryName = categoryMap.get(categoryId) || 'Unknown';
    const percentage = totalExpenses > 0 ? (data.totalAmount / totalExpenses) * 100 : 0;

    categoryBreakdown.push({
      categoryId,
      categoryName,
      totalAmount: data.totalAmount,
      transactionCount: data.transactionCount,
      percentage,
    });
  }

  return categoryBreakdown.sort((a, b) => b.totalAmount - a.totalAmount);
}

export async function generateTrendAnalysis(
  userId: string,
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Promise<TrendReport> {
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const dataPoints: TrendDataPoint[] = days.map(day => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const dayTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= dayStart && transactionDate <= dayEnd;
    });

    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = income - expenses;

    return {
      date: day,
      income,
      expenses,
      netSavings,
    };
  });

  const totalExpenses = dataPoints.reduce((sum, dp) => sum + dp.expenses, 0);
  const averageMonthlyExpense = (totalExpenses / days.length) * 30;

  const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
  const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

  const firstHalfAvg = firstHalf.reduce((sum, dp) => sum + dp.expenses, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, dp) => sum + dp.expenses, 0) / secondHalf.length;

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  let trendPercentage = 0;

  if (firstHalfAvg > 0) {
    trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    if (trendPercentage > 10) {
      trend = 'increasing';
    } else if (trendPercentage < -10) {
      trend = 'decreasing';
    }
  }

  return {
    userId,
    startDate,
    endDate,
    dataPoints,
    averageMonthlyExpense,
    trend,
    trendPercentage,
    generatedAt: new Date(),
  };
}

export async function exportReportToPDF(report: SpendingReport | TrendReport): Promise<Buffer> {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('Financial Report', 20, 20);

  doc.setFontSize(12);

  if ('totalIncome' in report) {
    doc.text(`Period: ${format(report.startDate, 'MMM dd, yyyy')} - ${format(report.endDate, 'MMM dd, yyyy')}`, 20, 35);
    doc.text(`Total Income: $${report.totalIncome.toFixed(2)}`, 20, 45);
    doc.text(`Total Expenses: $${report.totalExpenses.toFixed(2)}`, 20, 55);
    doc.text(`Net Savings: $${report.netSavings.toFixed(2)}`, 20, 65);
    doc.text(`Daily Average Expense: $${report.dailyAverageExpense.toFixed(2)}`, 20, 75);

    doc.text('Top Expense Categories:', 20, 90);
    let yPos = 100;
    for (const category of report.topExpenseCategories) {
      doc.text(`${category.categoryName}: $${category.totalAmount.toFixed(2)} (${category.percentage.toFixed(1)}%)`, 30, yPos);
      yPos += 10;
    }
  } else {
    doc.text(`Period: ${format(report.startDate, 'MMM dd, yyyy')} - ${format(report.endDate, 'MMM dd, yyyy')}`, 20, 35);
    doc.text(`Average Monthly Expense: $${report.averageMonthlyExpense.toFixed(2)}`, 20, 45);
    doc.text(`Trend: ${report.trend} (${report.trendPercentage.toFixed(1)}%)`, 20, 55);
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}