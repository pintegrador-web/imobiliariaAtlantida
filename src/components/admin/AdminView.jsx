import { useState } from 'react';
import LogoAtlantida from '../common/LogoAtlantida';
import Sidebar from './Sidebar';
import OverviewPanel from './OverviewPanel';
import VisitsPanel from './VisitsPanel';
import RulesPanel from './RulesPanel';
import PropertiesPanel from './PropertiesPanel';
import { IconDashboard, IconCalendar, IconSettings, IconBuilding } from '../icons';

const AdminView = ({
  properties, onNavigate, visits, rules,
  onApprove, onReject, onDeleteVisit, onSaveRules,
  onAddProperty, onUpdateProperty, onDeleteProperty
}) => {
  const [section, setSection] = useState('overview');

  const pendingVisits = visits.filter(v => v.status === 'pending').length;

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: <IconDashboard /> },
    { id: 'visits', label: 'Visitas', icon: <IconCalendar />, badge: pendingVisits },
    { id: 'properties', label: 'Imóveis', icon: <IconBuilding /> },
    { id: 'rules', label: 'Regras de Visita', icon: <IconSettings /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        section={section}
        setSection={setSection}
        onNavigate={onNavigate}
        pendingVisits={pendingVisits}
      />

      <main className="flex-1 overflow-y-auto">
        <header className="h-24 bg-white shadow-sm flex items-center justify-between px-8 md:hidden">
          <LogoAtlantida size={70} />
          <button onClick={() => onNavigate('public')} className="text-sm font-medium text-red-600">
            Voltar ao Site
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
          <div className="md:hidden flex flex-wrap gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  section === item.id ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {item.label} {item.badge > 0 && `(${item.badge})`}
              </button>
            ))}
          </div>

          {section === 'overview' && (
            <OverviewPanel
              properties={properties}
              visits={visits}
              onGoToVisits={() => setSection('visits')}
            />
          )}

          {section === 'visits' && (
            <>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Visitas</h1>
                <p className="text-gray-500 mt-1">Gerencie solicitações de visita dos clientes.</p>
              </div>
              <VisitsPanel
                visits={visits}
                onApprove={onApprove}
                onReject={onReject}
                onDelete={onDeleteVisit}
              />
            </>
          )}

          {section === 'properties' && (
            <>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Imóveis</h1>
                <p className="text-gray-500 mt-1">Adicione, edite ou remova imóveis do portfólio.</p>
              </div>
              <PropertiesPanel
                properties={properties}
                onAdd={onAddProperty}
                onUpdate={onUpdateProperty}
                onDelete={onDeleteProperty}
              />
            </>
          )}

          {section === 'rules' && (
            <>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Regras de Visita</h1>
                <p className="text-gray-500 mt-1">Configure os dias, horários e bloqueios de agendamento.</p>
              </div>
              <RulesPanel rules={rules} onSave={onSaveRules} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminView;