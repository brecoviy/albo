import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { customers, invoices, revenue } from './placeholder-data';

// Mock sql for unused functions to avoid crashes
const sql = (strings: TemplateStringsArray, ...values: any[]) => Promise.resolve([]);

export async function fetchRevenue() {
  try {
    return revenue;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    // Sort invoices by date
    const sortedInvoices = [...invoices].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Take top 5
    const top5 = sortedInvoices.slice(0, 5);

    const latestInvoices = top5.map((invoice, index) => {
      const customer = customers.find((c) => c.id === invoice.customer_id);
      return {
        id: `invoice-${index}`,
        name: customer?.name || 'Unknown',
        image_url: customer?.image_url || '',
        email: customer?.email || '',
        amount: formatCurrency(invoice.amount),
      };
    });
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const numberOfInvoices = invoices.length;
    const numberOfCustomers = customers.length;
    const totalPaidInvoices = formatCurrency(
      invoices.reduce((acc, invoice) => invoice.status === 'paid' ? acc + invoice.amount : acc, 0)
    );
    const totalPendingInvoices = formatCurrency(
      invoices.reduce((acc, invoice) => invoice.status === 'pending' ? acc + invoice.amount : acc, 0)
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const queryLower = query.toLowerCase();

  const filteredInvoices = invoices.filter((invoice) => {
    const customer = customers.find((c) => c.id === invoice.customer_id);
    const name = customer?.name.toLowerCase() || '';
    const email = customer?.email.toLowerCase() || '';
    const amount = invoice.amount.toString();
    const date = invoice.date;
    const status = invoice.status;

    return (
      name.includes(queryLower) ||
      email.includes(queryLower) ||
      amount.includes(queryLower) ||
      date.includes(queryLower) ||
      status.includes(queryLower)
    );
  });

  // Sort by date desc
  filteredInvoices.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const paginatedInvoices = filteredInvoices
    .slice(offset, offset + ITEMS_PER_PAGE)
    .map((invoice, index) => {
      const customer = customers.find((c) => c.id === invoice.customer_id);
      return {
        id: `invoice-${offset + index}`,
        customer_id: invoice.customer_id,
        name: customer?.name || '',
        email: customer?.email || '',
        image_url: customer?.image_url || '',
        date: invoice.date,
        amount: invoice.amount,
        status: invoice.status,
      };
    });

  return paginatedInvoices;
}

export async function fetchInvoicesPages(query: string) {
  const queryLower = query.toLowerCase();
  const filteredInvoices = invoices.filter((invoice) => {
    const customer = customers.find((c) => c.id === invoice.customer_id);
    const name = customer?.name.toLowerCase() || '';
    const email = customer?.email.toLowerCase() || '';
    const amount = invoice.amount.toString();
    const date = invoice.date;
    const status = invoice.status;
    return (
      name.includes(queryLower) ||
      email.includes(queryLower) ||
      amount.includes(queryLower) ||
      date.includes(queryLower) ||
      status.includes(queryLower)
    );
  });

  return Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
}

export async function fetchInvoiceById(id: string) {
  // Mock implementation
  return {
    id: id,
    customer_id: customers[0].id,
    amount: 0,
    status: 'pending' as 'pending' | 'paid',
  };
}

export async function fetchCustomers() {
  return customers.map((c) => ({ id: c.id, name: c.name }));
}

export async function fetchFilteredCustomers(query: string) {
  const queryLower = query.toLowerCase();
  return customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(queryLower) ||
        c.email.toLowerCase().includes(queryLower),
    )
    .map((c) => ({
      ...c,
      total_invoices: 0,
      total_pending: '0.00',
      total_paid: '0.00',
    }));
}
