import { useState, useMemo } from 'react';
import { generateSlots, validateSchedule, isSlotOccupied, getWeekdayFromISO } from '../../utils/scheduleHelpers';
import { formatDateBR } from '../../utils/dateHelpers';
import { WEEKDAY_NAMES } from '../../constants';
import { IconClose, IconCheck, IconClock, IconAlert } from '../icons';

const ScheduleModal = ({ property, rules, allVisits, onClose, onConfirm }) => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    date: '', time: '',
    isSpecial: false,
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const slots = useMemo(() => generateSlots(rules), [rules]);

  const occupiedSlots = useMemo(() => {
    if (!form.date) return new Set();
    return new Set(
      allVisits
        .filter(v =>
          v.propertyId === property.id &&
          v.date === form.date &&
          (v.status === 'approved' || v.status === 'pending')
        )
        .map(v => v.time)
    );
  }, [allVisits, property.id, form.date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const err = validateSchedule(form.date, form.time, rules, form.isSpecial);
    if (err) return setError(err);

    if (form.isSpecial && !form.reason.trim()) {
      return setError('Por favor, descreva o motivo da visita especial.');
    }

    if (isSlotOccupied(allVisits, property.id, form.date, form.time)) {
      return setError('Este horário já está reservado para este imóvel. Escolha outro horário ou data.');
    }

    const visit = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.image,
      name: form.name,
      email: form.email,
      phone: form.phone,
      date: form.date,
      time: form.time,
      isSpecial: form.isSpecial,
      reason: form.isSpecial ? form.reason : '',
      status: form.isSpecial ? 'pending' : 'approved',
      createdAt: new Date().toISOString()
    };

    onConfirm(visit);
    setSuccess(true);
  };

  const weekday = form.date ? getWeekdayFromISO(form.date) : null;
  const isWeekdayAllowed = weekday !== null && rules.weekdays.includes(weekday);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[95vh] flex flex-col">
        {success ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <IconCheck />
            <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
              {form.isSpecial ? 'Solicitação Enviada!' : 'Visita Agendada!'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              {form.isSpecial
                ? 'Sua solicitação de visita especial foi enviada. Nossa equipe analisará e responderá em breve.'
                : 'Recebemos seu agendamento. Enviaremos a confirmação por e-mail.'}
            </p>
            <button onClick={onClose} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors w-full">
              Concluir
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {form.isSpecial ? 'Solicitar Visita Especial' : 'Agendar Visita'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar">
                <IconClose />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="mb-5 flex gap-4 items-center bg-red-50/50 p-3 rounded-xl border border-red-50">
                <img src={property.image} alt="Imóvel" className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{property.title}</p>
                  <p className="text-xs text-red-600 font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}/mês
                  </p>
                </div>
              </div>

              <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <IconClock /> Horários disponíveis para visita
                </div>
                <p><strong>Dias:</strong> {rules.weekdays.map(d => WEEKDAY_NAMES[d]).join(', ')}</p>
                <p><strong>Horário:</strong> {rules.startHour} às {rules.endHour} (intervalos de {rules.slotDuration}min)</p>
                <p className="mt-2 text-blue-700">
                  Não encontrou um horário? Marque a opção <strong>Visita Especial</strong> abaixo.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Seu nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                    <input required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="seu@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                    <input
                      required type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm text-gray-600"
                      value={form.date}
                      onChange={e => setForm({...form, date: e.target.value, time: ''})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {form.isSpecial ? 'Horário desejado *' : 'Horário *'}
                    </label>
                    {form.isSpecial ? (
                      <input required type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm text-gray-600" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                    ) : (
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm text-gray-600"
                        value={form.time}
                        onChange={e => setForm({...form, time: e.target.value})}
                        disabled={!form.date}
                      >
                        <option value="">{form.date ? 'Selecione um horário' : 'Escolha uma data primeiro'}</option>
                        {slots.map(s => {
                          const isOccupied = occupiedSlots.has(s);
                          return (
                            <option key={s} value={s} disabled={isOccupied}>
                              {s} {isOccupied ? '(ocupado)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                </div>

                {form.date && !form.isSpecial && (
                  <div className={`text-xs p-3 rounded-lg ${isWeekdayAllowed ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-amber-50 text-amber-800 border border-amber-100'}`}>
                    {isWeekdayAllowed
                      ? `✓ ${WEEKDAY_NAMES[weekday]} é um dia de visita disponível.`
                      : `⚠ ${WEEKDAY_NAMES[weekday]} não é um dia disponível. Solicite uma visita especial.`}
                  </div>
                )}

                {form.date && !form.isSpecial && occupiedSlots.size > 0 && (
                  <div className="text-xs p-3 rounded-lg bg-gray-50 text-gray-600 border border-gray-100">
                    ℹ️ {occupiedSlots.size} horário(s) já reservado(s) para {formatDateBR(form.date)}. Os slots ocupados aparecem desabilitados acima.
                  </div>
                )}

                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 accent-red-600"
                    checked={form.isSpecial}
                    onChange={e => setForm({...form, isSpecial: e.target.checked, time: ''})}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      <IconAlert /> Solicitar visita especial
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Para visitas fora dos dias/horários disponíveis. Sujeita à aprovação da imobiliária.
                    </p>
                  </div>
                </label>

                {form.isSpecial && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da solicitação *</label>
                    <textarea
                      required rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                      placeholder="Explique o motivo da visita fora do horário normal..."
                      value={form.reason}
                      onChange={e => setForm({...form, reason: e.target.value})}
                    />
                  </div>
                )}

                {error && (
                  <p className="text-red-600 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className={`w-full mt-2 py-3 text-white font-medium rounded-lg transition-colors shadow-sm ${
                    form.isSpecial
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                      : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                  }`}
                >
                  {form.isSpecial ? 'Enviar Solicitação' : 'Confirmar Agendamento'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleModal;