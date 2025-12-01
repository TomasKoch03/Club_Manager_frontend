/**
 * Calcula la duración en horas entre dos tiempos
 * @param {string} startTime - Hora de inicio en formato "HH:MM"
 * @param {string} endTime - Hora de fin en formato "HH:MM"
 * @returns {number} Duración en horas
 */
export const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return durationMinutes > 0 ? durationMinutes / 60 : 0;
};

/**
 * Ajusta la hora de inicio manteniendo la duración fija
 * @param {string} currentStartTime - Hora de inicio actual en formato "HH:MM"
 * @param {string} currentEndTime - Hora de fin actual en formato "HH:MM"
 * @param {number} minutes - Minutos a sumar/restar (puede ser negativo)
 * @returns {object|null} { startTime, endTime } o null si no es válido
 */
export const adjustStartTime = (currentStartTime, currentEndTime, minutes) => {
    if (!currentStartTime || !currentEndTime) return null;

    // Calcular duración actual
    const [startHours, startMins] = currentStartTime.split(':').map(Number);
    const [endHours, endMins] = currentEndTime.split(':').map(Number);
    const currentDurationMinutes = (endHours * 60 + endMins) - (startHours * 60 + startMins);

    // Calcular nueva hora de inicio
    let newStartTotalMinutes = startHours * 60 + startMins + minutes;

    // Asegurar que no sea negativo
    if (newStartTotalMinutes < 0) newStartTotalMinutes = 0;

    // Asegurar que no pase de 23:30
    if (newStartTotalMinutes > 23 * 60 + 30) newStartTotalMinutes = 23 * 60 + 30;

    // Calcular nueva hora de fin manteniendo la duración
    const newEndTotalMinutes = newStartTotalMinutes + currentDurationMinutes;

    // Verificar que no pase de las 23:59
    if (newEndTotalMinutes > 23 * 60 + 59) return null;

    const newStartHours = Math.floor(newStartTotalMinutes / 60);
    const newStartMinutes = newStartTotalMinutes % 60;
    const newEndHours = Math.floor(newEndTotalMinutes / 60);
    const newEndMinutes = newEndTotalMinutes % 60;

    return {
        startTime: `${String(newStartHours).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`,
        endTime: `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`
    };
};

/**
 * Ajusta la duración manteniendo la hora de inicio fija
 * @param {string} currentStartTime - Hora de inicio en formato "HH:MM"
 * @param {string} currentEndTime - Hora de fin actual en formato "HH:MM"
 * @param {number} minutes - Minutos a sumar/restar a la duración (puede ser negativo)
 * @returns {string|null} Nueva hora de fin o null si no es válido
 */
export const adjustDuration = (currentStartTime, currentEndTime, minutes) => {
    if (!currentStartTime || !currentEndTime) return null;

    const [endHours, endMins] = currentEndTime.split(':').map(Number);
    let endTotalMinutes = endHours * 60 + endMins + minutes;

    const [startHours, startMins] = currentStartTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMins;

    // Asegurar que la duración mínima sea 30 minutos
    if (endTotalMinutes <= startTotalMinutes) {
        endTotalMinutes = startTotalMinutes + 30;
    }

    // Asegurar que no pase de 23:59
    if (endTotalMinutes > 23 * 60 + 59) endTotalMinutes = 23 * 60 + 59;

    const newEndHours = Math.floor(endTotalMinutes / 60);
    const newEndMinutes = endTotalMinutes % 60;

    return `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`;
};

/**
 * Recalcula la hora de fin cuando cambia la hora de inicio manualmente, manteniendo la duración
 * @param {string} oldStartTime - Hora de inicio anterior en formato "HH:MM"
 * @param {string} newStartTime - Nueva hora de inicio en formato "HH:MM"
 * @param {string} currentEndTime - Hora de fin actual en formato "HH:MM"
 * @returns {string|null} Nueva hora de fin o null si no es válido
 */
export const recalculateEndTime = (oldStartTime, newStartTime, currentEndTime) => {
    if (!oldStartTime || !newStartTime || !currentEndTime) return null;

    // Calcular duración actual
    const [oldStartHours, oldStartMins] = oldStartTime.split(':').map(Number);
    const [endHours, endMins] = currentEndTime.split(':').map(Number);
    const currentDurationMinutes = (endHours * 60 + endMins) - (oldStartHours * 60 + oldStartMins);

    // Aplicar nueva hora de inicio
    const [newStartHours, newStartMins] = newStartTime.split(':').map(Number);
    const newStartTotalMinutes = newStartHours * 60 + newStartMins;

    // Calcular nueva hora de fin manteniendo la duración
    const newEndTotalMinutes = newStartTotalMinutes + currentDurationMinutes;

    // Verificar que no pase de 23:59
    if (newEndTotalMinutes > 23 * 60 + 59) return null;

    const newEndHours = Math.floor(newEndTotalMinutes / 60);
    const newEndMinutes = newEndTotalMinutes % 60;

    return `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`;
};

/**
 * Ajusta una fecha sumando/restando días
 * @param {string} currentDate - Fecha actual en formato "YYYY-MM-DD"
 * @param {number} days - Días a sumar/restar (puede ser negativo)
 * @param {boolean} preventPast - Si es true, no permite fechas anteriores a hoy
 * @returns {string|null} Nueva fecha en formato "YYYY-MM-DD" o null si no es válido
 */
export const adjustDate = (currentDate, days, preventPast = true) => {
    if (!currentDate) return null;

    const date = new Date(currentDate + 'T00:00:00');
    date.setDate(date.getDate() + days);

    // No permitir fechas en el pasado si preventPast es true
    if (preventPast) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Valida que una fecha no esté en el pasado
 * @param {string} dateString - Fecha en formato "YYYY-MM-DD"
 * @returns {boolean} true si la fecha es válida (hoy o futura), false si está en el pasado
 */
export const isValidFutureDate = (dateString) => {
    if (!dateString) return false;

    const selectedDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate >= today;
};

/**
 * Valida que la hora de fin sea posterior a la hora de inicio
 * @param {string} startTime - Hora de inicio en formato "HH:MM"
 * @param {string} endTime - Hora de fin en formato "HH:MM"
 * @returns {boolean} true si endTime > startTime
 */
export const isValidTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return false;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return endTotalMinutes > startTotalMinutes;
};
