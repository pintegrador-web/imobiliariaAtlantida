import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs 
} from 'firebase/firestore';

// ⬇️ IMPORTAÇÃO DO LOGO PNG (arquivo já existe em src/assets/logo.png)
import logoAtlantida from './assets/logo.png';

// --- Configuração Firebase ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key-123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-atlantida.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-atlantida",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-atlantida.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_APP_ID || "1:123456789:web:abcdef"
};

let app, auth, db;
let useMockData = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase config error, falling back to mock data for preview.", error);
  useMockData = true;
}

// --- Dados Mockados ---
const MOCK_PROPERTIES = [
  { id: '1', title: 'Apartamento Luxo Centro', type: 'Apartamento', status: 'Alugado', price: 3500, bedrooms: 3, area: 120, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Amplo apartamento no centro com vista panorâmica.' },
  { id: '2', title: 'Casa de Condomínio', type: 'Casa', status: 'Vazio', price: 5500, bedrooms: 4, area: 250, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Casa moderna em condomínio fechado com segurança 24h e piscina.' },
  { id: '3', title: 'Kitnet Universitária', type: 'Apartamento', status: 'Alugado', price: 1200, bedrooms: 1, area: 45, image: 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Compacto e prático, ideal para estudantes, próximo à UFPR.' },
  { id: '4', title: 'Sala Comercial', type: 'Comercial', status: 'Vazio', price: 2800, bedrooms: 0, area: 80, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Sala comercial bem localizada, perfeita para escritórios ou clínicas.' },
  { id: '5', title: 'Cobertura Duplex', type: 'Apartamento', status: 'Alugado', price: 8000, bedrooms: 4, area: 300, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Cobertura luxuosa com área gourmet privativa e jacuzzi.' },
  { id: '6', title: 'Terreno Industrial', type: 'Terreno', status: 'Vazio', price: 15000, bedrooms: 0, area: 10000, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Excelente terreno para instalação de galpões e indústrias, acesso fácil à rodovia.' },
];

const MOCK_FINANCES = {
  revenue: 35000,
  expenses: 8500,
  target: 50000,
  history: [
    { month: 'Jan', income: 28000 }, { month: 'Fev', income: 31000 },
    { month: 'Mar', income: 30500 }, { month: 'Abr', income: 35000 },
  ]
};

// --- Ícones SVG ---
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const IconBed = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>;
const IconArea = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>;
const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconBuilding = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>;

// ⬇️ COMPONENTE DO LOGO USANDO A IMAGEM PNG
const LogoAtlantida = ({ size = 60, className = "" }) => (
  <img 
    src={logoAtlantida} 
    alt="Atlântida Imóveis" 
    className={className}
    style={{ height: `${size}px`, width: 'auto', objectFit: 'contain' }}
  />
);

// Validação de datas
const isInvalidScheduleDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString + 'T12:00:00'); 
  const day = date.getDay();
  if (day === 0 || day === 6) return true;
  const holidays = ['01/01', '21/04', '01/05', '07/09', '12/10', '02/11', '15/11', '25/12'];
  const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  return holidays.includes(formattedDate);
};

// --- Visualização Pública ---
const PublicView = ({ properties, onNavigate }) => {
  const [filter, setFilter] = useState('Todos');
  const [schedulingProp, setSchedulingProp] = useState(null);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', name: '', email: '' });
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const filteredProps = useMemo(() => {
    if (filter === 'Todos') return properties.filter(p => p.status === 'Vazio');
    return properties.filter(p => p.status === 'Vazio' && p.type === filter);
  }, [properties, filter]);

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    setScheduleError('');
    if (isInvalidScheduleDate(scheduleData.date)) {
      setScheduleError('A data selecionada cai em um fim de semana ou feriado. Por favor, escolha um dia útil.');
      return;
    }
    const hour = parseInt(scheduleData.time.split(':')[0], 10);
    if (hour < 8 || hour >= 18) {
      setScheduleError('O horário de visitação é das 08:00 às 18:00.');
      return;
    }
    setScheduleSuccess(true);
  };

  const closeScheduleModal = () => {
    setSchedulingProp(null);
    setScheduleSuccess(false);
    setScheduleData({ date: '', time: '', name: '', email: '' });
    setScheduleError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => window.scrollTo(0, 0)} 
            role="button" 
            tabIndex={0} 
            onKeyDown={(e) => e.key === 'Enter' && window.scrollTo(0, 0)} 
            aria-label="Ir para o topo"
          >
            <LogoAtlantida size={80} />
          </div>
          
          <nav aria-label="Navegação principal">
            <button 
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              aria-label="Acessar área administrativa"
            >
              Área Restrita <IconDashboard />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Encontre o lugar que você sempre <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">sonhou</span>.
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A <strong className="text-gray-800">Imobiliária Atlântida</strong> oferece os melhores imóveis da região. Filtre por categoria e descubra seu novo lar ou espaço de negócios.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Filtrar imóveis por tipo">
            {['Todos', 'Apartamento', 'Casa', 'Comercial', 'Terreno'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  filter === type 
                    ? 'bg-red-600 text-white shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 hover:bg-red-50 border border-gray-200'
                }`}
                aria-pressed={filter === type}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Imóveis */}
        <section aria-label="Lista de Imóveis Disponíveis">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProps.length > 0 ? filteredProps.map((prop, idx) => (
              <article 
                key={prop.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative h-64 overflow-hidden group">
                  <img 
                    src={prop.image} 
                    alt={`Imóvel: ${prop.title}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-red-700">
                    {prop.type}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{prop.title}</h3>
                    <p className="text-lg font-extrabold text-red-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price)}<span className="text-sm font-normal text-gray-500">/mês</span>
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm mb-6 flex-1">{prop.description}</p>
                  
                  <div className="flex items-center gap-6 text-gray-500 text-sm border-t border-gray-100 pt-4">
                    {prop.bedrooms > 0 && (
                      <div className="flex items-center gap-1.5" title="Quartos">
                        <IconBed /> <span>{prop.bedrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5" title="Área">
                      <IconArea /> <span>{prop.area}m²</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSchedulingProp(prop)}
                    className="mt-6 w-full py-2.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    aria-label={`Agendar visita para ${prop.title}`}
                  >
                    <IconCalendar /> Agendar Visita
                  </button>
                </div>
              </article>
            )) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-lg">Nenhum imóvel disponível para esta categoria no momento.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-3">
            <LogoAtlantida size={70} />
          </div>
        </div>
        <p>© 2026 Imobiliária Atlântida. Todos os direitos reservados.</p>
        <p className="text-sm mt-2">Contato: (11) 9999-0000 | contato@atlantidaimoveis.com.br</p>
      </footer>

      {/* Modal de Agendamento */}
      {schedulingProp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {scheduleSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <IconCheck />
                <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Visita Agendada!</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Recebemos seu pedido para visitar o imóvel <strong>{schedulingProp.title}</strong>. 
                  Enviamos os detalhes e a confirmação para o seu e-mail.
                </p>
                <button 
                  onClick={closeScheduleModal} 
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors w-full"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">Agendar Visita</h3>
                  <button onClick={closeScheduleModal} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Fechar modal">
                    <IconClose />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="mb-6 flex gap-4 items-center bg-red-50/50 p-3 rounded-xl border border-red-50">
                    <img src={schedulingProp.image} alt="Imóvel" className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{schedulingProp.title}</p>
                      <p className="text-xs text-red-600 font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(schedulingProp.price)}/mês</p>
                    </div>
                  </div>

                  <form onSubmit={handleScheduleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                      <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm" placeholder="Seu nome completo" value={scheduleData.name} onChange={e => setScheduleData({...scheduleData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                      <input required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm" placeholder="seu@email.com" value={scheduleData.email} onChange={e => setScheduleData({...scheduleData, email: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm text-gray-600" value={scheduleData.date} onChange={e => setScheduleData({...scheduleData, date: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora (08h às 18h)</label>
                        <input required type="time" min="08:00" max="18:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm text-gray-600" value={scheduleData.time} onChange={e => setScheduleData({...scheduleData, time: e.target.value})} />
                      </div>
                    </div>
                    
                    {scheduleError && (
                      <p className="text-red-600 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                        {scheduleError}
                      </p>
                    )}

                    <button type="submit" className="w-full mt-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200">
                      Confirmar Agendamento
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Visualização Admin ---
const AdminView = ({ properties, onNavigate }) => {
  const stats = useMemo(() => {
    const total = properties.length;
    const alugados = properties.filter(p => p.status === 'Alugado').length;
    const vazios = total - alugados;
    const taxaOcupacao = total === 0 ? 0 : Math.round((alugados / total) * 100);
    const receitaMensal = properties.filter(p => p.status === 'Alugado').reduce((acc, p) => acc + p.price, 0);
    return { total, alugados, vazios, taxaOcupacao, receitaMensal };
  }, [properties]);

  const BarChart = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.income));
    return (
      <div className="flex items-end h-48 gap-4 pt-4 border-b border-gray-200" aria-label="Gráfico de receita mensal">
        {data.map((item, i) => {
          const heightPct = (item.income / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div 
                className="w-full bg-red-200 rounded-t-md relative group-hover:bg-red-400 transition-colors"
                style={{ height: `${heightPct}%` }}
                title={`Receita de ${item.month}: R$ ${item.income}`}
              >
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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="h-32 flex items-center justify-center px-4 border-b border-gray-800 bg-white">
          <LogoAtlantida size={90} />
        </div>
        <nav className="p-4 flex-1 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-red-600 rounded-lg text-sm font-medium text-white shadow-md">Visão Geral</a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg text-sm transition-colors">Imóveis</a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg text-sm transition-colors">Financeiro</a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg text-sm transition-colors">Configurações</a>
          
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">DevOps Status</p>
            <div className="px-4 py-2 flex items-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Git: v1.5.0 (Main)
            </div>
            <div className="px-4 py-2 flex items-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> CI/CD: Testes Passaram (42/42)
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => onNavigate('public')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Sair (Site Público)
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-24 bg-white shadow-sm flex items-center justify-between px-8 md:hidden">
          <LogoAtlantida size={70} />
          <button onClick={() => onNavigate('public')} className="text-sm font-medium text-red-600">Voltar ao Site</button>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
              <p className="text-gray-500 mt-1">Bem-vindo de volta. Aqui está o resumo do seu portfólio.</p>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
              Gerar Relatório
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total de Imóveis', value: stats.total, icon: <IconBuilding />, color: 'bg-blue-500' },
              { label: 'Imóveis Alugados', value: stats.alugados, icon: <IconUsers />, color: 'bg-green-500' },
              { label: 'Imóveis Vazios', value: stats.vazios, icon: <IconHome />, color: 'bg-yellow-500' },
              { label: 'Receita Mensal', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.receitaMensal), icon: <IconTrendingUp />, color: 'bg-red-500' }
            ].map((stat, i) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Desempenho Financeiro (Últimos Meses)</h3>
              <BarChart data={MOCK_FINANCES.history} />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Taxa de Ocupação</h3>
              <div className="flex flex-col items-center justify-center h-48 relative">
                <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
                  <path className="text-gray-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-red-600 transition-all duration-1000 ease-out" strokeDasharray={`${stats.taxaOcupacao}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-gray-900">{stats.taxaOcupacao}%</span>
                  <span className="text-xs text-gray-500">Ocupados</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Portfólio (Resumo)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">Imóvel</th>
                    <th scope="col" className="px-6 py-3 font-medium">Tipo</th>
                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                    <th scope="col" className="px-6 py-3 font-medium">Valor (Mês)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{prop.title}</td>
                      <td className="px-6 py-4 text-gray-500">{prop.type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          prop.status === 'Alugado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- App Principal ---
const App = () => {
  const [view, setView] = useState('public');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!useMockData && auth) {
          await signInAnonymously(auth);
        } else {
          setUser({ uid: 'mock-user-123' });
        }
      } catch (error) {
        console.warn("Auth error, using mock:", error);
        setUser({ uid: 'mock-user-123' });
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        if (!useMockData && db) {
          const querySnapshot = await getDocs(collection(db, "properties"));
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProperties(data);
          setLoading(false);
        } else {
          setTimeout(() => {
            setProperties(MOCK_PROPERTIES);
            setLoading(false);
          }, 800);
        }
      } catch (error) {
        console.warn("Error loading properties, using mock:", error);
        setProperties(MOCK_PROPERTIES);
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50" aria-busy="true">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Iniciando Atlântida Imóveis...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {view === 'public' ? (
        <PublicView properties={properties} onNavigate={setView} />
      ) : (
        <AdminView properties={properties} onNavigate={setView} />
      )}
    </>
  );
};

export default App;