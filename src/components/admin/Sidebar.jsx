import LogoAtlantida from '../common/LogoAtlantida';
import { IconDashboard, IconCalendar, IconSettings, IconBuilding } from '../icons';

const Sidebar = ({ section, setSection, onNavigate, pendingVisits }) => {
  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: <IconDashboard /> },
    { id: 'visits', label: 'Visitas', icon: <IconCalendar />, badge: pendingVisits },
    { id: 'properties', label: 'Imóveis', icon: <IconBuilding /> },
    { id: 'rules', label: 'Regras de Visita', icon: <IconSettings /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
      <div className="h-32 flex items-center justify-center px-4 border-b border-gray-800 bg-white">
        <LogoAtlantida size={90} />
      </div>
      <nav className="p-4 flex-1 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              section === item.id
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">{item.icon} {item.label}</span>
            {item.badge > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">DevOps Status</p>
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Git: v1.7.0 (Main)
          </div>
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> CI/CD: OK
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
  );
};

export default Sidebar;