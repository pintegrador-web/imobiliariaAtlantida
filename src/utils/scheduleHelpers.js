import { WEEKDAY_NAMES } from '../constants';

export const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (min) => {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export const generateSlots = (rules) => {
  const slots = [];
  const start = timeToMinutes(rules.startHour);
  const end = timeToMinutes(rules.endHour);
  for (let t = start; t < end; t += rules.slotDuration) {
    slots.push(minutesToTime(t));
  }
  return slots;
};

export const getWeekdayFromISO = (isoDate) => new Date(isoDate + 'T12:00:00').getDay();

export const validateSchedule = (dateStr, timeStr, rules, isSpecial) => {
  if (!dateStr) return 'Informe a data.';
  if (!timeStr) return 'Informe o horário.';

  const weekday = getWeekdayFromISO(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateStr + 'T12:00:00');
  if (selectedDate < today) return 'A data não pode estar no passado.';

  if (rules.blockedDates?.includes(dateStr)) return 'Esta data está bloqueada pela imobiliária.';
  if (isSpecial) return null;

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
  if (!slots.includes(timeStr)) return 'Horário inválido. Escolha um dos horários disponíveis.';
  return null;
};

export const isSlotOccupied = (visits, propertyId, dateStr, timeStr, ignoreVisitId = null) => {
  return visits.some(v =>
    v.id !== ignoreVisitId &&
    v.propertyId === propertyId &&
    v.date === dateStr &&
    v.time === timeStr &&
    (v.status === 'approved' || v.status === 'pending')
  );
};