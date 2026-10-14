import { useState, useMemo } from 'react';
import PropertyFormModal from './PropertyFormModal';
import { formatCurrency } from '../../utils/dateHelpers';
import { PROPERTY_TYPES } from '../../constants';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '../icons';

const PropertiesPanel = ({ properties, onAdd, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'Todos' || p.type === filterType;
      const matchesStatus = filterStatus === 'Todos' || p.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, search, filterType, filterStatus]);

  const handleNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (property) => {
    setEditing(property);
    setModalOpen(true);
  };

  const handleDelete = (property) => {
    if (window.confirm(`Excluir "${property.title}"? Esta ação não pode ser desfeita.`)) {
      onDelete(property.id);
    }
  };

  const handleSave = (payload, id) => {
    if (id) {
      onUpdate(id, payload);
    } else {
      onAdd(payload);
    }
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Portfólio de Imóveis</h3>
            <p className="text-xs text-gray-500 mt-1">{filtered.length} de {properties.length} imóveis</p>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-red-200"
          >
            <IconPlus /> Adicionar Imóvel
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
          >
            <option value="Todos">Todos os tipos</option>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
          >
            <option value="Todos">Todos os status</option>
            <option value="Vazio">Vazio</option>
            <option value="Alugado">Alugado</option>
            <option value="Vendido">Vendido</option>
            <option value="Manutenção">Manutenção</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">Nenhum imóvel encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Imóvel</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(prop => (
                  <tr key={prop.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={prop.image} alt={prop.title} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{prop.title}</p>
                          <p className="text-xs text-gray-500">{prop.area}m² · {prop.bedrooms} quartos</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{prop.type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        prop.status === 'Alugado' ? 'bg-green-100 text-green-800' :
                        prop.status === 'Vazio' ? 'bg-yellow-100 text-yellow-800' :
                        prop.status === 'Vendido' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prop.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{formatCurrency(prop.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(prop)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(prop)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <PropertyFormModal
          property={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default PropertiesPanel;