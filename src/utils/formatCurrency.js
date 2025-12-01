/**
 * Formatea un número como moneda en formato argentino
 * @param {number|string} amount - El monto a formatear
 * @param {number} decimals - Cantidad de decimales a mostrar (default: 2)
 * @returns {string} - Monto formateado (ej: "20.000,83")
 */
export const formatCurrency = (amount, decimals = 2) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(num)) return '0,00';
    
    // Separar parte entera y decimal
    const [integer, decimal] = num.toFixed(decimals).split('.');
    
    // Agregar puntos cada 3 dígitos en la parte entera
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Retornar con coma decimal
    return decimals > 0 ? `${formattedInteger},${decimal}` : formattedInteger;
};
