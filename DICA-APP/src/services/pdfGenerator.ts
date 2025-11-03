import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Gasto, type Pago } from '../types';

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

export const generarBalancePDFConTabla = (gastos: Gasto[], pagos: Pago[], periodo: string) => {
  const doc = new jsPDF();
  doc.text(`Balance del período: ${periodo}`, 14, 15);

  // Expenses Table
  const gastosTableColumn = ["Descripción", "Categoría", "Monto", "Fecha"];
  const gastosTableRows = gastos.map(g => [
    g.descripcion,
    g.categoria,
    `$${g.monto}`,
    new Date(g.fecha).toLocaleDateString("es-AR"),
  ]);

  autoTable(doc, {
    head: [['Egresos']],
    body: [],
    theme: 'plain',
    styles: { fontStyle: 'bold' },
  });

  autoTable(doc, {
    head: [gastosTableColumn],
    body: gastosTableRows,
  });

  // Income Table
  const ingresosTableColumn = ["Descripción", "Método de pago", "Monto", "Fecha"];
  const ingresosTableRows = pagos.map(p => [
    `Ingreso por venta (pedido #${p.fk_pedido})`,
    p.metodo_pago,
    `$${p.monto}`,
    new Date(p.fk_fecha).toLocaleDateString("es-AR"),
  ]);

  autoTable(doc, {
    head: [['Ingresos']],
    body: [],
    theme: 'plain',
    styles: { fontStyle: 'bold' },
    startY: (doc as any).lastAutoTable.finalY + 10,
  });

  autoTable(doc, {
    head: [ingresosTableColumn],
    body: ingresosTableRows,
  });

  const totalIngresos = pagos.reduce((acc, pago) => acc + Number(pago.monto), 0);
  const totalEgresos = gastos.reduce((acc, gasto) => acc + Number(gasto.monto), 0);
  const balanceNeto = totalIngresos - totalEgresos;

  let finalY = (doc as any).lastAutoTable.finalY;
  doc.text("Resumen del Balance", 14, finalY + 15);
  doc.text(`Total Ingresos: $${totalIngresos.toFixed(2)}`, 14, finalY + 22);
  doc.text(`Total Egresos: $${totalEgresos.toFixed(2)}`, 14, finalY + 29);
  doc.text(`Balance Neto: $${balanceNeto.toFixed(2)}`, 14, finalY + 36);

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = pdfUrl;
  a.download = `balance_${periodo}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(pdfUrl);
};
  