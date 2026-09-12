import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  console.warn("Firebase config error, falling back to mock data.", error);
  useMockData = true;
}

// --- Dados Mockados ---
const MOCK_PROPERTIES = [
  { id: '1', title: 'Apartamento Luxo Centro', type: 'Apartamento', status: 'Alugado', price: 3500, bedrooms: 3, area: 120, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Amplo apartamento no centro com vista panorâmica.' },
  { id: '2', title: 'Casa de Condomínio', type: 'Casa', status: 'Vazio', price: 5500, bedrooms: 4, area: 250, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Casa moderna em condomínio fechado com segurança 24h e piscina.' },
  { id: '3', title: 'Kitnet Universitária', type: 'Apartamento', status: 'Alugado', price: 1200, bedrooms: 1, area: 45, image: 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Compacto e prático, ideal para estudantes.' },
  { id: '4', title: 'Sala Comercial', type: 'Comercial', status: 'Vazio', price: 2800, bedrooms: 0, area: 80, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Sala comercial bem localizada, perfeita para escritórios ou clínicas.' },
  { id: '5', title: 'Cobertura Duplex', type: 'Apartamento', status: 'Alugado', price: 8000, bedrooms: 4, area: 300, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Cobertura luxuosa com área gourmet privativa e jacuzzi.' },
  { id: '6', title: 'Terreno Industrial', type: 'Terreno', status: 'Vazio', price: 15000, bedrooms: 0, area: 10000, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', description: 'Excelente terreno para instalação de galpões e indústrias.' },
];

const MOCK_FINANCES = {
  history: [
    { month: 'Jan', income: 28000 }, { month: 'Fev', income: 31000 },
    { month: 'Mar', income: 30500 }, { month: 'Abr', income: 35000 },
  ]
};

// --- Regras padrão de visitação ---
const DEFAULT_VISIT_RULES = {
  weekdays: [1, 2, 3, 4, 5],
  startHour: '08:00',
  endHour: '18:00',
  slotDuration: 60,
  blockedDates: []
};

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// --- localStorage helpers ---
const STORAGE_KEYS = {
  VISITS: 'atlantida_visits',
  RULES: 'atlantida_visit_rules'
};

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Erro ao salvar no localStorage:', e);
  }
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
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconAlert = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

// --- Logo ---
const LogoAtlantida = ({ size = 60, className = "" }) => (
  <img 
    src={logoAtlantida} 
    alt="Atlântida Imóveis" 
    className={className}
    style={{ height: `${size}px`, width: 'auto', objectFit: 'contain' }}
  />
);

// --- Helpers ---
const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (min) => {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const generateSlots = (rules) => {
  const slots = [];
  const start = timeToMinutes(rules.startHour);
  const end = timeToMinutes(rules.endHour);
  for (let t = start; t < end; t += rules.slotDuration) {
    slots.push(minutesToTime(t));
  }
  return slots;
};

const formatDateBR = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

const getWeekdayFromISO = (isoDate) => {
  const date = new Date(isoDate + 'T12:00:00');
  return date.getDay();
};

const validateSchedule = (dateStr, timeStr, rules, isSpecial) => {
  if (!dateStr) return 'Informe a data.';
  if (!timeStr) return 'Informe o horário.';

  const weekday = getWeekdayFromISO(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateStr + 'T12:00:00');
  if (selectedDate < today) return 'A data não pode estar no passado.';

  if (rules.blockedDates?.includes(dateStr)) {
    return 'Esta data está bloqueada pela imobiliária.';
  }

  if (isSpecial) {
    return null;
  }

  if (!rules.weekdays.includes(weekday)) {
    return `Visitas não são permitidas em ${WEEKDAY_NAMES[weekday]}. Solicite uma visita especial.`;
  }

  const t = timeToMinutes(timeStr);
  const start = timeToMinutes(rules.startHour);
  const end = timeToMinutes(rules.endHour);

  if (t < start || t >= end) {
    return `Horário fora do permitido. Atendemos das ${rules.startHour} às ${rules.endHour}. Solicite uma visita especial.`;
  }

  const slots = generateSlots(rules);
  if (!slots.includes(timeStr)) {
    return `Horário inválido. Escolha um dos horários disponíveis.`;
  }

  return null;
};

// 🆕 NOVA FUNÇÃO: Verifica se um slot (imóvel + data + hora) já está ocupado
const isSlotOccupied = (visits, propertyId, dateStr, timeStr, ignoreVisitId = null) => {
  return visits.some(v => 
    v.id !== ignoreVisitId &&
    v.propertyId === propertyId &&
    v.date === dateStr &&
    v.time === timeStr &&
    (v.status === 'approved' || v.status === 'pending')
  );
};

// ================================================================
// COMPONENTE: Modal de Agendamento (público)
// ================================================================
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

  // Slots ocupados para este imóvel na data selecionada
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
    if (err) {
      setError(err);
      return;
    }

    if (form.isSpecial && !form.reason.trim()) {
      setError('Por favor, descreva o motivo da visita especial.');
      return;
    }

    // 🚫 Bloqueio de conflito
    if (isSlotOccupied(allVisits, property.id, form.date, form.time)) {
      setError('Este horário já está reservado para este imóvel. Escolha outro horário ou data.');
      return;
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
            <button 
              onClick={onClose} 
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors w-full"
            >
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
                      required 
                      type="date" 
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
                      required 
                      rows="3"
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

// ================================================================
// COMPONENTE: Visualização Pública
// ================================================================
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
            {['Todos', 'Apartamento', 'Casa', 'Comercial', 'Terreno'].map(type => (
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
              <article 
                key={prop.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative h-64 overflow-hidden group">
                  <img src={prop.image} alt={prop.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
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
                    {prop.bedrooms > 0 && <div className="flex items-center gap-1.5"><IconBed /> {prop.bedrooms}</div>}
                    <div className="flex items-center gap-1.5"><IconArea /> {prop.area}m²</div>
                  </div>
                  <button 
                    onClick={() => setSchedulingProp(prop)}
                    className="mt-6 w-full py-2.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <IconCalendar /> Agendar Visita
                  </button>
                </div>
              </article>
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

// ================================================================
// ADMIN: Painel de Visitas (com detecção de conflitos)
// ================================================================
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

  // 🆕 Detecta conflitos
  const getConflict = (visit) => {
    return visits.find(v => 
      v.id !== visit.id &&
      v.propertyId === visit.propertyId &&
      v.date === visit.date &&
      v.time === visit.time &&
      (v.status === 'approved' || v.status === 'pending')
    );
  };

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
                tab === t.id 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.label} <span className="ml-1 opacity-75">({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-gray-500 text-sm">
          Nenhuma visita nesta categoria.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filtered.map(visit => {
            const conflict = getConflict(visit);
            const hasConflict = conflict && visit.status !== 'rejected';
            
            return (
              <div 
                key={visit.id} 
                className={`p-5 transition-colors ${hasConflict ? 'bg-red-50/40' : 'hover:bg-gray-50/50'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <img 
                    src={visit.propertyImage} 
                    alt={visit.propertyTitle} 
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0" 
                  />
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
                        {visit.status === 'pending' ? 'Pendente' :
                         visit.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
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
                            hasConflict 
                              ? 'bg-amber-600 hover:bg-amber-700' 
                              : 'bg-green-600 hover:bg-green-700'
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

// ================================================================
// ADMIN: Painel de Regras
// ================================================================
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
                  local.weekdays.includes(day)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
            <input 
              type="time" 
              value={local.startHour}
              onChange={e => setLocal({...local, startHour: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fim</label>
            <input 
              type="time" 
              value={local.endHour}
              onChange={e => setLocal({...local, endHour: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duração do slot</label>
            <select
              value={local.slotDuration}
              onChange={e => setLocal({...local, slotDuration: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            >
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
              <span key={s} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                {s}
              </span>
            )) : <span className="text-xs text-gray-400">Nenhum horário válido</span>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Datas bloqueadas</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="date" 
              value={newBlockedDate}
              onChange={e => setNewBlockedDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
            <button
              type="button"
              onClick={addBlockedDate}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Adicionar
            </button>
          </div>
          {local.blockedDates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {local.blockedDates.map(d => (
                <span key={d} className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-800">
                  {formatDateBR(d)}
                  <button onClick={() => removeBlockedDate(d)} className="text-red-600 hover:text-red-800">
                    <IconClose />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Nenhuma data bloqueada.</p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm shadow-red-200"
          >
            Salvar Regras
          </button>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// ADMIN: Visualização Principal
// ================================================================
const AdminView = ({ properties, onNavigate, visits, rules, onApprove, onReject, onDeleteVisit, onSaveRules }) => {
  const [section, setSection] = useState('overview');

  const stats = useMemo(() => {
    const total = properties.length;
    const alugados = properties.filter(p => p.status === 'Alugado').length;
    const vazios = total - alugados;
    const taxaOcupacao = total === 0 ? 0 : Math.round((alugados / total) * 100);
    const receitaMensal = properties.filter(p => p.status === 'Alugado').reduce((acc, p) => acc + p.price, 0);
    const pendingVisits = visits.filter(v => v.status === 'pending').length;
    return { total, alugados, vazios, taxaOcupacao, receitaMensal, pendingVisits };
  }, [properties, visits]);

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

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: <IconDashboard /> },
    { id: 'visits', label: 'Visitas', icon: <IconCalendar />, badge: stats.pendingVisits },
    { id: 'rules', label: 'Regras de Visita', icon: <IconSettings /> },
    { id: 'portfolio', label: 'Imóveis', icon: <IconBuilding /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
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
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Git: v1.6.1 (Main)
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

      <main className="flex-1 overflow-y-auto">
        <header className="h-24 bg-white shadow-sm flex items-center justify-between px-8 md:hidden">
          <LogoAtlantida size={70} />
          <button onClick={() => onNavigate('public')} className="text-sm font-medium text-red-600">Voltar ao Site</button>
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
            <>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
                <p className="text-gray-500 mt-1">Resumo do portfólio e atividades.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total de Imóveis', value: stats.total, icon: <IconBuilding />, color: 'bg-blue-500' },
                  { label: 'Alugados', value: stats.alugados, icon: <IconUsers />, color: 'bg-green-500' },
                  { label: 'Vazios', value: stats.vazios, icon: <IconHome />, color: 'bg-yellow-500' },
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

              {stats.pendingVisits > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
                  <div className="text-amber-600 mt-0.5"><IconAlert /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900">
                      Você tem {stats.pendingVisits} solicitação(ões) de visita pendente(s) de aprovação.
                    </p>
                    <button 
                      onClick={() => setSection('visits')} 
                      className="text-sm text-amber-800 underline mt-1"
                    >
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

          {section === 'rules' && (
            <>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Regras de Visita</h1>
                <p className="text-gray-500 mt-1">Configure os dias, horários e bloqueios de agendamento.</p>
              </div>
              <RulesPanel rules={rules} onSave={onSaveRules} />
            </>
          )}

          {section === 'portfolio' && (
            <>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Imóveis</h1>
                <p className="text-gray-500 mt-1">Portfólio completo.</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-6 py-3 font-medium">Imóvel</th>
                        <th className="px-6 py-3 font-medium">Tipo</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {properties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-gray-50/50">
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// ================================================================
// APP PRINCIPAL
// ================================================================
const App = () => {
  const [view, setView] = useState('public');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState(() => loadFromStorage(STORAGE_KEYS.VISITS, []));
  const [rules, setRules] = useState(() => loadFromStorage(STORAGE_KEYS.RULES, DEFAULT_VISIT_RULES));

  useEffect(() => { saveToStorage(STORAGE_KEYS.VISITS, visits); }, [visits]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RULES, rules); }, [rules]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!useMockData && auth) {
          await signInAnonymously(auth);
        } else {
          setUser({ uid: 'mock-user-123' });
        }
      } catch (error) {
        console.warn("Auth error:", error);
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
        console.warn("Error loading properties:", error);
        setProperties(MOCK_PROPERTIES);
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  const handleNewVisit = (visit) => {
    setVisits(prev => [visit, ...prev]);
  };

  const handleApproveVisit = (id) => {
    setVisits(prev => prev.map(v => v.id === id ? { ...v, status: 'approved' } : v));
  };

  const handleRejectVisit = (id) => {
    setVisits(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected' } : v));
  };

  const handleDeleteVisit = (id) => {
    if (!window.confirm('Excluir esta visita?')) return;
    setVisits(prev => prev.filter(v => v.id !== id));
  };

  const handleSaveRules = (newRules) => {
    setRules(newRules);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
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
        <PublicView 
          properties={properties} 
          onNavigate={setView} 
          rules={rules}
          visits={visits}
          onNewVisit={handleNewVisit}
        />
      ) : (
        <AdminView 
          properties={properties} 
          onNavigate={setView} 
          visits={visits}
          rules={rules}
          onApprove={handleApproveVisit}
          onReject={handleRejectVisit}
          onDeleteVisit={handleDeleteVisit}
          onSaveRules={handleSaveRules}
        />
      )}
    </>
  );
};

export default App;