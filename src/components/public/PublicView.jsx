import { useState, useMemo } from 'react';
import LogoAtlantida from '../common/LogoAtlantida';
import PropertyCard from './PropertyCard';
import ScheduleModal from './ScheduleModal';
import { IconDashboard } from '../icons';
import { PROPERTY_TYPES } from '../../constants';

const PublicView = ({ properties, onNavigate, rules, visits, onNewVisit }) => {
  const [filter, setFilter] = useState('Todos');
  const [schedulingProp, setSchedulingProp] = useState(null);

  const filteredProps = useMemo(() => {
    if (filter === 'Todos') return properties.filter(p => p.status === 'Vazio');
    return properties.filter(p => p.status === 'Vazio' && p.type === filter);
  }, [properties, filter]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <LogoAtlantida size={80} />
          </div>
          <nav aria-label="Navegação principal">
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Área Restrita <IconDashboard />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Encontre o lugar que você sempre <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">sonhou</span>.
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A <strong className="text-gray-800">Imobiliária Atlântida</strong> oferece os melhores imóveis da região.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Todos', ...PROPERTY_TYPES].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  filter === type
                    ? 'bg-red-600 text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-red-50 border border-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProps.length > 0 ? filteredProps.map((prop, idx) => (
              <PropertyCard key={prop.id} property={prop} onSchedule={setSchedulingProp} delay={idx * 100} />
            )) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-lg">Nenhum imóvel disponível nesta categoria.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-3"><LogoAtlantida size={70} /></div>
        </div>
        <p>© 2026 Imobiliária Atlântida. Todos os direitos reservados.</p>
        <p className="text-sm mt-2">Contato: (11) 9999-0000 | contato@atlantidaimoveis.com.br</p>
      </footer>

      {schedulingProp && (
        <ScheduleModal
          property={schedulingProp}
          rules={rules}
          allVisits={visits}
          onClose={() => setSchedulingProp(null)}
          onConfirm={(visit) => onNewVisit(visit)}
        />
      )}
    </div>
  );
};

export default PublicView;