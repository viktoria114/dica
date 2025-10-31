import { jsPDF } from 'jspdf';

interface BalanceData {
  ingresos: { descripcion: string; monto: number }[];
  egresos: { descripcion: string; monto: number }[];
  totalIngresos: number;
  totalEgresos: number;
}

export async function generarBalancePDF(datos: BalanceData, periodo: string) {
  const doc = new jsPDF();

  let yOffset = 10; // Initial y-offset for text

  doc.setFontSize(20);
  doc.text('Balance del Negocio', 105, yOffset, { align: 'center' });
  yOffset += 10;

  doc.setFontSize(12);
  doc.text(`Período: ${periodo}`, 10, yOffset);
  yOffset += 7;
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 10, yOffset);
  yOffset += 15;

  doc.setFontSize(14);
  doc.text('Ingresos', 10, yOffset);
  yOffset += 7;
  datos.ingresos.forEach((i) => {
    doc.text(`${i.descripcion}: $${i.monto.toFixed(2)}`, 15, yOffset);
    yOffset += 7;
  });
  yOffset += 5;
  doc.text(`Total Ingresos: $${datos.totalIngresos.toFixed(2)}`, 10, yOffset);
  yOffset += 15;

  doc.setFontSize(14);
  doc.text('Egresos', 10, yOffset);
  yOffset += 7;
  datos.egresos.forEach((e) => {
    doc.text(`${e.descripcion}: $${e.monto.toFixed(2)}`, 15, yOffset);
    yOffset += 7;
  });
  yOffset += 5;
  doc.text(`Total Egresos: $${datos.totalEgresos.toFixed(2)}`, 10, yOffset);
  yOffset += 15;

  const balance = datos.totalIngresos - datos.totalEgresos;
  doc.setFontSize(14);
  doc.text(`Balance Neto: $${balance.toFixed(2)}`, 10, yOffset);

  doc.save(`balance_${periodo}.pdf`);
}