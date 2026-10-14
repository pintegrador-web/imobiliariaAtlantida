import { useState, useMemo } from 'react';
import { formatDateBR } from '../../utils/dateHelpers';
import { IconAlert, IconTrash } from '../icons';

const VisitsPanel = ({ visits, onApprove, onReject, onDelete }) => {
  const [tab, setTab] = useState('pending');

  const filtered = useMemo(() => {
    if (tab === 'pending') return visits.filter(v => v.status === 'pending');
    if (tab === 'approved') return visits.filter(v => v.status === 'approved');
    if (tab === 'rejected') return visits.filter(v => v.status === 'rejected');
    return visits;
  }, [visits, tab]);

  const counts = useMemo(() => ({
    all: visits.length,
    pending: visits.filter(v => v.status === 'pending').length,
    approved: visits.filter(v => v.status === 'approved').length,
    rejected: visits.filter(v => v.status === 'rejected').length,
  }), [visits]);

  const getConflict = (visit) => visits.find(v =>
    v.id !== visit.id &&
    v.propertyId === visit.propertyId &&
    v.date === visit.date &&
    v.time === visit.time &&
    (v.status === 'approved' || v.status === 'pending')
  );

  const handleApprove = (visit) => {
    const conflict = getConflict(visit);
    if (conflict) {
      const ok = window.confirm(
        `⚠️ CONFLITO DE HORÁRIO\n\n` +
        `Já existe uma visita ${conflict.status === 'approved' ? 'APROVADA' : 'PENDENTE'} para este imóvel no mesmo horário:\n\n` +
        `Cliente: ${conflict.name}\n` +
        `E-mail: ${conflict.email}\n` +
        `Data: ${formatDateBR(conflict.date)} às ${conflict.time}\n\n` +
        `Deseja aprovar mesmo assim?`
      );
      if (!ok) return;
    }
    onApprove(visit.id);
  };

  const tabs = [
    { id: 'pending', label: 'Pendentes', count: counts.pending },
    { id: 'approved', label: 'Aprovadas', count: counts.approved },
    { id: 'rejected', label: 'Rejeitadas', count: counts.rejected },
    { id: 'all', label: 'Todas', count: counts.all },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Visitas Agendadas</h3>
        <div className="flex flex-wrap gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.label} <span className="ml-1 opacity-75">({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-gray-500 text-sm">Nenhuma visita nesta categoria.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filtered.map(visit => {
            const conflict = getConflict(visit);
            const hasConflict = conflict && visit.status !== 'rejected';

            return (
              <div key={visit.id} className={`p-5 transition-colors ${hasConflict ? 'bg-red-50/40' : 'hover:bg-gray-50/50'}`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <img src={visit.propertyImage} alt={visit.propertyTitle} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-900">{visit.propertyTitle}</h4>
                      {visit.isSpecial && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <IconAlert /> Especial
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        visit.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        visit.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {visit.status === 'pending' ? 'Pendente' : visit.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                      </span>
                      {hasConflict && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                          <IconAlert /> CONFLITO
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                      <p><strong className="text-gray-500">Cliente:</strong> {visit.name}</p>
                      <p><strong className="text-gray-500">E-mail:</strong> {visit.email}</p>
                      {visit.phone && <p><strong className="text-gray-500">Telefone:</strong> {visit.phone}</p>}
                      <p><strong className="text-gray-500">Data:</strong> {formatDateBR(visit.date)} às {visit.time}</p>
                    </div>
                    {visit.isSpecial && visit.reason && (
                      <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2">
                        <strong>Motivo:</strong> {visit.reason}
                      </p>
                    )}
                    {hasConflict && conflict && (
                      <p className="mt-2 text-xs text-red-800 bg-red-100 border border-red-200 rounded-lg p-2">
                        <strong>⚠️ Conflito com:</strong> {conflict.name} ({conflict.email}) — {formatDateBR(conflict.date)} às {conflict.time} [{conflict.status === 'approved' ? 'Aprovada' : 'Pendente'}]
                      </p>
                    )}
                  </div>
                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    {visit.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(visit)}
                          className={`flex-1 lg:flex-none px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
                            hasConflict ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {hasConflict ? 'Aprovar (c/ conflito)' : 'Aprovar'}
                        </button>
                        <button
                          onClick={() => onReject(visit.id)}
                          className="flex-1 lg:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(visit.id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <IconTrash /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisitsPanel;