import { useState, useEffect } from 'react';
import { generateSlots } from '../../utils/scheduleHelpers';
import { formatDateBR } from '../../utils/dateHelpers';
import { WEEKDAY_SHORT } from '../../constants';
import { IconSettings, IconClose } from '../icons';

const RulesPanel = ({ rules, onSave }) => {
  const [local, setLocal] = useState(rules);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { setLocal(rules); }, [rules]);

  const toggleWeekday = (day) => {
    setLocal(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day].sort((a, b) => a - b)
    }));
  };

  const addBlockedDate = () => {
    if (!newBlockedDate) return;
    if (local.blockedDates.includes(newBlockedDate)) return;
    setLocal(prev => ({
      ...prev,
      blockedDates: [...prev.blockedDates, newBlockedDate].sort()
    }));
    setNewBlockedDate('');
  };

  const removeBlockedDate = (date) => {
    setLocal(prev => ({
      ...prev,
      blockedDates: prev.blockedDates.filter(d => d !== date)
    }));
  };

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const slots = generateSlots(local);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <IconSettings /> Regras de Visita
        </h3>
        {saved && <span className="text-xs text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full">✓ Salvo</span>}
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dias disponíveis para visita</label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_SHORT.map((name, day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  local.weekdays.includes(day) ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Início</label>
            <input type="time" value={local.startHour} onChange={e => setLocal({...local, startHour: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fim</label>
            <input type="time" value={local.endHour} onChange={e => setLocal({...local, endHour: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duração do slot</label>
            <select value={local.slotDuration} onChange={e => setLocal({...local, slotDuration: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm">
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1h30</option>
              <option value={120}>2 horas</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-2">Horários que serão exibidos ao cliente:</p>
          <div className="flex flex-wrap gap-2">
            {slots.length > 0 ? slots.map(s => (
              <span key={s} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">{s}</span>
            )) : <span className="text-xs text-gray-400">Nenhum horário válido</span>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Datas bloqueadas</label>
          <div className="flex gap-2 mb-3">
            <input type="date" value={newBlockedDate} onChange={e => setNewBlockedDate(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" />
            <button type="button" onClick={addBlockedDate} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors">Adicionar</button>
          </div>
          {local.blockedDates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {local.blockedDates.map(d => (
                <span key={d} className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-800">
                  {formatDateBR(d)}
                  <button onClick={() => removeBlockedDate(d)} className="text-red-600 hover:text-red-800"><IconClose /></button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Nenhuma data bloqueada.</p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button onClick={handleSave} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm shadow-red-200">
            Salvar Regras
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesPanel;