export const DEFAULT_VISIT_RULES = {
  weekdays: [1, 2, 3, 4, 5],
  startHour: '08:00',
  endHour: '18:00',
  slotDuration: 60,
  blockedDates: []
};

export const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const PROPERTY_TYPES = ['Apartamento', 'Casa', 'Comercial', 'Terreno'];
export const PROPERTY_STATUS = ['Vazio', 'Alugado', 'Vendido', 'Manutenção'];

export const STORAGE_KEYS = {
  VISITS: 'atlantida_visits',
  RULES: 'atlantida_visit_rules',
  PROPERTIES: 'atlantida_properties'
};