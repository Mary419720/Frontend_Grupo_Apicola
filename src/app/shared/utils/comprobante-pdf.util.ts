import jsPDF from 'jspdf';

export interface ComprobantePago {
  folio: string;
  fecha: string;
  cliente: {
    nombre: string;
    rfc?: string;
    direccion?: string;
    email?: string;
  };
  productos: Array<{
    cantidad: number;
    descripcion: string;
    precio_unitario: number;
    subtotal_producto: number;
  }>;
  totales: {
    subtotal: number;
    iva: number;
    descuento: number;
    total: number;
    moneda: string;
  };
  metodoPago: {
    tipo: string;
    referencia?: string;
    fechaPago?: string;
  };
  estatus: string;
  notas?: string;
  qr?: string;
}

export function generarComprobantePDF(data: ComprobantePago) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text('Comprobante de Pago', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Folio: ${data.folio}`, 15, 25);
  doc.text(`Fecha: ${data.fecha}`, 150, 25);
  doc.text(`Cliente: ${data.cliente.nombre}`, 15, 33);
  if (data.cliente.rfc) doc.text(`RFC: ${data.cliente.rfc}`, 15, 39);
  if (data.cliente.direccion) doc.text(`Dirección: ${data.cliente.direccion}`, 15, 45);
  if (data.cliente.email) doc.text(`Email: ${data.cliente.email}`, 15, 51);

  // Tabla de productos
  let startY = 60;
  doc.text('Productos:', 15, startY);
  startY += 6;
  doc.setFontSize(9);
  doc.text('Cant.', 15, startY);
  doc.text('Descripción', 30, startY);
  doc.text('P. Unit.', 120, startY);
  doc.text('Subtotal', 160, startY);
  startY += 5;
  data.productos.forEach((prod) => {
    doc.text(String(prod.cantidad), 15, startY);
    doc.text(prod.descripcion, 30, startY, { maxWidth: 85 });
    doc.text(prod.precio_unitario.toFixed(2), 120, startY);
    doc.text(prod.subtotal_producto.toFixed(2), 160, startY);
    startY += 5;
  });
  startY += 2;
  doc.setFontSize(10);
  doc.text(`Subtotal: $${data.totales.subtotal.toFixed(2)}`, 150, startY);
  startY += 5;
  doc.text(`IVA: $${data.totales.iva.toFixed(2)}`, 150, startY);
  startY += 5;
  doc.text(`Descuento: $${data.totales.descuento.toFixed(2)}`, 150, startY);
  startY += 5;
  doc.text(`Total: $${data.totales.total.toFixed(2)} ${data.totales.moneda}`, 150, startY);
  startY += 8;
  doc.text(`Método de pago: ${data.metodoPago.tipo}`, 15, startY);
  if (data.metodoPago.referencia) doc.text(`Referencia: ${data.metodoPago.referencia}`, 15, startY + 6);
  if (data.metodoPago.fechaPago) doc.text(`Fecha de pago: ${data.metodoPago.fechaPago}`, 15, startY + 12);
  startY += 18;
  doc.text(`Estatus: ${data.estatus}`, 15, startY);
  if (data.notas) doc.text(data.notas, 15, startY + 6, { maxWidth: 180 });
  if (data.qr) {
    // Si tienes una librería para QR, aquí puedes agregarla
    doc.text('Consulta tu comprobante en el QR adjunto.', 15, startY + 14);
    // doc.addImage(qrImage, 'PNG', 150, startY + 4, 30, 30);
  }
  doc.save(`comprobante_${data.folio}.pdf`);
}
