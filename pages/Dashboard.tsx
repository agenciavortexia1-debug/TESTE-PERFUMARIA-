
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Calendar as CalendarIcon,
  X,
  History,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { DB } from '../services/db.ts';
import { Sale } from '../types.ts';
import StatCard from '../components/StatCard.tsx';
import DateRangePicker from '../components/DateRangePicker.tsx';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

// Função para renderizar rótulos externos no gráfico de rosca (igual à imagem enviada)
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#94a3b8" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-[9px] font-black uppercase italic tracking-tighter"
    >
      {`${name}: ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().setDate(new Date().getDate() - 30)), 
    end: new Date() 
  });
  const [stats, setStats] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = () => {
      const allSales = DB.getSales();
      const products = DB.getProducts();
      const installments = DB.getInstallments();

      const sales = allSales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= dateRange.start && saleDate <= dateRange.end;
      });

      const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
      const totalToReceive = installments
        .filter(i => i.status !== 'PAID')
        .reduce((acc, i) => acc + i.amount, 0);
      const lowStockItems = products.filter(p => p.stock <= p.minStock).length;

      // Cálculo de Distribuição por Categoria (Mix)
      const categories: Record<string, { count: number, revenue: number }> = {};
      sales.forEach(sale => {
        sale.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          const cat = product?.category || 'Outros';
          if (!categories[cat]) categories[cat] = { count: 0, revenue: 0 };
          categories[cat].count += item.quantity;
          categories[cat].revenue += item.total;
        });
      });

      const categoryDistribution = Object.entries(categories).map(([name, data]) => ({ 
        name, 
        value: data.revenue,
        units: data.count 
      })).sort((a, b) => b.value - a.value);

      const daysCount = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
      const displayDays = Math.min(10, daysCount);
      
      const chartData = Array.from({ length: displayDays }).map((_, i) => {
        const d = new Date(dateRange.end);
        d.setDate(d.getDate() - (displayDays - 1 - i));
        const dateStr = d.toISOString().split('T')[0];
        const daySales = sales.filter(s => s.date.startsWith(dateStr));
        return { 
          date: dateStr, 
          value: daySales.length,
          revenue: daySales.reduce((acc, s) => acc + s.total, 0)
        };
      });

      setStats({
        totalSales: sales.length,
        totalRevenue,
        totalToReceive,
        lowStockItems,
        salesData: chartData,
        categoryDistribution,
        rawSales: sales,
        rawInstallments: installments,
        rawProducts: products
      });
    };

    loadData();
  }, [dateRange]);

  if (!stats) return null;

  const weeklySalesData = stats.salesData;

  const getModalContent = () => {
    switch (activeModal) {
      case 'receita':
      case 'volume':
        return {
          title: activeModal === 'receita' ? 'Performance de Vendas' : 'Volume de Transações',
          items: stats.rawSales.slice(-5).reverse().map((s: Sale) => ({
            label: s.customerName,
            sub: new Date(s.date).toLocaleDateString(),
            value: `R$ ${s.total.toFixed(2)}`
          })),
          footerAction: () => navigate('/historico')
        };
      case 'receber':
        return {
          title: 'Parcelas Pendentes',
          items: stats.rawInstallments.filter((i: any) => i.status !== 'PAID').slice(0, 5).map((i: any) => ({
            label: `Parcela ${i.number} - Ref: ${i.saleId.slice(0, 6)}`,
            sub: `Vencimento: ${new Date(i.dueDate).toLocaleDateString()}`,
            value: `R$ ${i.amount.toFixed(2)}`
          })),
          footerAction: () => navigate('/receber')
        };
      case 'estoque':
        return {
          title: 'Alertas de Estoque',
          items: stats.rawProducts.filter((p: any) => p.stock <= p.minStock).map((p: any) => ({
            label: p.name,
            sub: `${p.brand} | ${p.category}`,
            value: `${p.stock} UN`
          })),
          footerAction: () => navigate('/produtos')
        };
      default: return null;
    }
  };

  const modalData = getModalContent();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Painel de Controle</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Monitoramento Operacional.</p>
        </div>
        <DateRangePicker onApply={setDateRange} initialRange={dateRange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Receita Período" 
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          colorClass="bg-indigo-600"
          onClick={() => setActiveModal('receita')}
        />
        <StatCard 
          label="Contas a Receber" 
          value={`R$ ${stats.totalToReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={CalendarIcon} 
          onClick={() => setActiveModal('receber')}
          colorClass="bg-amber-500"
        />
        <StatCard 
          label="Ruptura de Estoque" 
          value={stats.lowStockItems} 
          icon={Package} 
          onClick={() => setActiveModal('estoque')}
          colorClass="bg-rose-600"
        />
        <StatCard 
          label="Volume Vendas" 
          value={stats.totalSales} 
          icon={TrendingUp} 
          onClick={() => setActiveModal('volume')}
          colorClass="bg-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Frequência de Vendas - AJUSTE MOBILE */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-500" />
            Frequência de Vendas (Qtd.)
          </h3>
          <div className="h-[300px] md:h-[500px] w-full"> {/* Altura responsiva: menor no mobile, maior no desktop */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySalesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => val.split('-')[2] + '/' + val.split('-')[1]} 
                  axisLine={false}
                  tickLine={false}
                  interval={window.innerWidth < 768 ? 1 : 0} // Pula labels no mobile para não sobrepor
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '800' }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  <LabelList 
                    dataKey="value" 
                    position="insideTop" 
                    offset={10}
                    // Exibe o número apenas se for maior que zero para limpar a base do gráfico
                    content={(props: any) => {
                      const { x, y, width, value } = props;
                      if (value === 0) return null;
                      return (
                        <text 
                          x={x + width / 2} 
                          y={y + 15} 
                          fill="#ffffff" 
                          textAnchor="middle" 
                          fontSize="11" 
                          fontWeight="900"
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Mix Categorias */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <PieIcon size={16} className="text-amber-500" />
            Mix de Categorias (Receita)
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                >
                  {stats.categoryDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legenda detalhada inferior */}
            <div className="w-full mt-4 space-y-2">
              {stats.categoryDistribution.map((item: any, i: number) => (
                <div key={item.name} className="flex flex-col p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase truncate tracking-widest">{item.name}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-black text-slate-900 dark:text-white">R$ {item.value.toLocaleString('pt-BR')}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase">{item.units} UNID.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 rounded-md w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{modalData.title}</h4>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              {modalData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase truncate">{item.label}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{item.sub}</p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{item.value}</span>
                </div>
              ))}
              <div className="pt-2">
                <button 
                  onClick={() => {
                    if(modalData.footerAction) modalData.footerAction();
                    setActiveModal(null);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center justify-center gap-2"
                >
                  <History size={14} /> Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
