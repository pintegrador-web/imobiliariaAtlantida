import { useMemo } from 'react';
import { MOCK_FINANCES } from '../../data/mockData';
import { IconBuilding, IconUsers, IconHome, IconTrendingUp, IconAlert } from '../icons';
import { formatCurrency } from '../../utils/dateHelpers';

const BarChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.income));
  return (
    <div className="flex items-end h-48 gap-4 pt-4 border-b border-gray-200">
      {data.map((item, i) => {
        const heightPct = (item.income / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full bg-red-200 rounded-t-md relative group-hover:bg-red-400 transition-colors" style={{ height: `${heightPct}%` }}>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                R$ {item.income / 1000}k
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">{item.month}</span>
          </div>
        );
      })}
    </div>
  );
};

const OverviewPanel = ({ properties, visits, onGoToVisits }) => {
  const stats = useMemo(() => {
    const total = properties.length;
    const alugados = properties.filter(p => p.status === 'Alugado').length;
    const vazios = total - alugados;
    const taxaOcupacao = total === 0 ? 0 : Math.round((alugados / total) * 100);
    const receitaMensal = properties.filter(p => p.status === 'Alugado').reduce((acc, p) => acc + p.price, 0);
    const pendingVisits = visits.filter(v => v.status === 'pending').length;
    return { total, alugados, vazios, taxaOcupacao, receitaMensal, pendingVisits };
  }, [properties, visits]);

  const cards = [
    { label: 'Total de Imóveis', value: stats.total, icon: <IconBuilding />, color: 'bg-blue-500' },
    { label: 'Alugados', value: stats.alugados, icon: <IconUsers />, color: 'bg-green-500' },
    { label: 'Vazios', value: stats.vazios, icon: <IconHome />, color: 'bg-yellow-500' },
    { label: 'Receita Mensal', value: formatCurrency(stats.receitaMensal), icon: <IconTrendingUp />, color: 'bg-red-500' }
  ];

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-500 mt-1">Resumo do portfólio e atividades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {stats.pendingVisits > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <div className="text-amber-600 mt-0.5"><IconAlert /></div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">
              Você tem {stats.pendingVisits} solicitação(ões) de visita pendente(s) de aprovação.
            </p>
            <button onClick={onGoToVisits} className="text-sm text-amber-800 underline mt-1">
              Ver e aprovar agora
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Desempenho Financeiro</h3>
          <BarChart data={MOCK_FINANCES.history} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Taxa de Ocupação</h3>
          <div className="flex flex-col items-center justify-center h-48 relative">
            <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
              <path className="text-gray-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-red-600 transition-all duration-1000" strokeDasharray={`${stats.taxaOcupacao}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold text-gray-900">{stats.taxaOcupacao}%</span>
              <span className="text-xs text-gray-500">Ocupados</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewPanel;