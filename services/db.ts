
import { Customer, Product, Sale, Installment, PaymentStatus, PaymentMethod, AppSettings } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'ef_customers',
  PRODUCTS: 'ef_products',
  SALES: 'ef_sales',
  INSTALLMENTS: 'ef_installments',
  SETTINGS: 'ef_settings',
  INITIALIZED: 'ef_initialized'
};

const DEFAULT_LOGO = "https://lh3.googleusercontent.com/d/1dIF41dNcltZLgW5ORJ0A8MMt-6haJNpl";

const get = <T,>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error("Erro ao ler do DB", e);
    return defaultValue;
  }
};

const set = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Erro ao salvar no DB - Possível limite atingido", e);
    alert("Erro: O armazenamento está cheio. Tente usar imagens menores na personalização.");
  }
};

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const DB = {
  getCustomers: () => get<Customer[]>(STORAGE_KEYS.CUSTOMERS, []),
  saveCustomers: (data: Customer[]) => set(STORAGE_KEYS.CUSTOMERS, data),
  
  getProducts: () => get<Product[]>(STORAGE_KEYS.PRODUCTS, []),
  saveProducts: (data: Product[]) => set(STORAGE_KEYS.PRODUCTS, data),
  
  getSales: () => get<Sale[]>(STORAGE_KEYS.SALES, []),
  saveSales: (data: Sale[]) => set(STORAGE_KEYS.SALES, data),
  
  getInstallments: () => get<Installment[]>(STORAGE_KEYS.INSTALLMENTS, []),
  saveInstallments: (data: Installment[]) => set(STORAGE_KEYS.INSTALLMENTS, data),

  getSettings: (): AppSettings => get<AppSettings>(STORAGE_KEYS.SETTINGS, {
    systemName: 'Perfumaria Digital',
    logoUrl: DEFAULT_LOGO,
    appIconUrl: DEFAULT_LOGO,
    password: '1234'
  }),
  saveSettings: (data: AppSettings) => set(STORAGE_KEYS.SETTINGS, data),

  addSale: (sale: Sale, installments: Installment[]) => {
    const sales = DB.getSales();
    const insts = DB.getInstallments();
    const products = DB.getProducts();

    const updatedProducts = products.map(p => {
      const item = sale.items.find(i => i.productId === p.id);
      if (item) {
        return { ...p, stock: p.stock - item.quantity };
      }
      return p;
    });

    DB.saveSales([...sales, sale]);
    DB.saveInstallments([...insts, ...installments]);
    DB.saveProducts(updatedProducts);
  },

  payInstallment: (installmentId: string) => {
    const insts = DB.getInstallments();
    const updated = insts.map(i => 
      i.id === installmentId 
        ? { ...i, status: PaymentStatus.PAID, paidAt: new Date().toISOString() } 
        : i
    );
    DB.saveInstallments(updated);
  },

  seed: () => {
    if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) return;

    const sampleProducts: Product[] = [
      { id: 'p1', name: 'Eternity Blue', brand: 'Calvin Klein', category: 'Cítrico', ml: 100, price: 450, cost: 210, stock: 15, minStock: 5, description: '' },
      { id: 'p2', name: 'Sauvage Elixir', brand: 'Dior', category: 'Amadeirado', ml: 60, price: 890, cost: 420, stock: 3, minStock: 5, description: '' },
      { id: 'p3', name: 'Good Girl', brand: 'Carolina Herrera', category: 'Floral', ml: 80, price: 620, cost: 310, stock: 12, minStock: 4, description: '' },
      { id: 'p4', name: 'Bleu de Chanel', brand: 'Chanel', category: 'Amadeirado', ml: 100, price: 750, cost: 380, stock: 8, minStock: 3, description: '' },
      { id: 'p5', name: 'La Vie Est Belle', brand: 'Lancôme', category: 'Oriental', ml: 75, price: 580, cost: 270, stock: 2, minStock: 5, description: '' },
    ];

    const sampleCustomers: Customer[] = [
      { id: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 98888-7777', cpf: '123.456.789-00', address: 'Rua das Flores, 123', createdAt: daysAgo(60) },
      { id: 'c2', name: 'Maria Oliveira', email: 'maria@email.com', phone: '(11) 97777-6666', cpf: '987.654.321-11', address: 'Av. Paulista, 1500', createdAt: daysAgo(45) },
    ];

    DB.saveProducts(sampleProducts);
    DB.saveCustomers(sampleCustomers);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};
