/**
 * Utilidades para exportar datos a diferentes formatos
 * CSV, PDF, JSON
 */

/**
 * Exportar datos a CSV
 * @param {Array} data - Array de objetos
 * @param {string} filename - Nombre del archivo
 * @param {Array} headers - Headers personalizados (opcional)
 */
export const exportToCSV = (data, filename, headers = null) => {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Obtener headers del primer objeto si no se proporcionan
  const csvHeaders = headers || Object.keys(data[0]);

  // Crear contenido CSV
  const csvContent = [
    // Headers
    csvHeaders.map((h) => `"${h}"`).join(','),
    // Data rows
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header];
          // Manejar valores null/undefined y escapar comillas
          const stringValue = value === null || value === undefined ? '' : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exportar historial de peso a CSV
 * @param {Array} weightHistory - Historial de peso
 */
export const exportWeightHistory = (weightHistory) => {
  const data = weightHistory.map((entry) => ({
    Fecha: new Date(entry.date).toLocaleDateString('es-ES'),
    Peso: `${entry.weight} kg`,
    Notas: entry.notes || '',
  }));

  exportToCSV(data, 'historial_peso');
};

/**
 * Exportar rutina a formato compartible (JSON)
 * @param {Object} routine - Objeto de rutina
 */
export const exportRoutine = (routine) => {
  const routineData = {
    nombre: routine.name,
    descripcion: routine.description || '',
    ejercicios: routine.exercises.map((ex) => ({
      nombre: ex.exercise_name || ex.name,
      series: ex.sets,
      repeticiones: ex.reps,
      peso: ex.weight || 'N/A',
      descanso: ex.rest_seconds ? `${ex.rest_seconds}s` : 'N/A',
      notas: ex.notes || '',
    })),
    creada: new Date(routine.created_at).toLocaleDateString('es-ES'),
  };

  const jsonString = JSON.stringify(routineData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${routine.name.replace(/\s+/g, '_')}_rutina.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exportar datos nutricionales a CSV
 * @param {Array} mealItems - Items de comida
 * @param {Date} date - Fecha del registro
 */
export const exportNutritionData = (mealItems, date) => {
  const data = mealItems.map((item) => ({
    Fecha: new Date(date).toLocaleDateString('es-ES'),
    Comida: item.meal_type || 'N/A',
    Alimento: item.food_name || item.food?.name || 'N/A',
    Cantidad: `${item.quantity} g`,
    Calorías: `${item.calories} kcal`,
    Proteína: `${item.protein_g || 0} g`,
    Carbohidratos: `${item.carbs_g || 0} g`,
    Grasa: `${item.fat_g || 0} g`,
  }));

  exportToCSV(data, `nutricion_${new Date(date).toISOString().split('T')[0]}`);
};

/**
 * Generar PDF usando jsPDF (requiere librería externa)
 * @param {Object} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 * @param {string} title - Título del documento
 */
export const exportToPDF = async (data, filename, title = 'Reporte') => {
  // Nota: Esto requiere jsPDF instalado
  // npm install jspdf
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    // Contenido básico (se puede mejorar con tablas)
    let y = 30;
    doc.setFontSize(12);
    
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${index + 1}. ${JSON.stringify(item)}`, 14, y);
        y += 10;
      });
    } else {
      Object.entries(data).forEach(([key, value]) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${key}: ${value}`, 14, y);
        y += 10;
      });
    }

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error al generar PDF. Asegúrate de tener jsPDF instalado:', error);
    // Fallback a CSV si jsPDF no está disponible
    if (Array.isArray(data)) {
      exportToCSV(data, filename);
    }
  }
};

/**
 * Exportar todos los datos del usuario (GDPR compliance)
 * @param {Object} userData - Todos los datos del usuario
 */
export const exportAllUserData = async (userData) => {
  const exportData = {
    usuario: {
      email: userData.email,
      nombre: userData.name || 'N/A',
      fecha_registro: userData.created_at,
    },
    historial_peso: userData.weightHistory || [],
    rutinas: userData.routines || [],
    registros_diarios: userData.dailyLogs || [],
    objetivos: userData.goals || [],
    logros: userData.achievements || [],
    fecha_exportacion: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `datos_usuario_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};












