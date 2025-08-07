import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


// Interfaz para extender jsPDF con la funcionalidad de autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

// Interfaz que define la estructura de datos para el comprobante de pago
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
  qr?: string; // Código QR (opcional)
}

/**
 * Genera un comprobante de pago en formato PDF con un diseño moderno y profesional.
 * @param data - Objeto con toda la información necesaria para el comprobante.
 */
/**
 * Carga una imagen desde una URL y la convierte a formato Base64.
 * @param url - La URL de la imagen (p. ej., 'assets/images/logo.png').
 * @returns Una promesa que se resuelve con la cadena Base64 de la imagen.
 */
async function loadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generarComprobantePDF(data: ComprobantePago) {
  const logoBase64 = await loadImageAsBase64('assets/images/logo.png').catch(() => null);
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // --- DEFINICIÓN DE ESTILOS ---
  const BRAND_COLOR = '#FFB703'; // Un dorado más vibrante y moderno
  const PRIMARY_TEXT_COLOR = '#1a1a1a'; // Negro suave para mejor legibilidad
  const SECONDARY_TEXT_COLOR = '#555555'; // Gris oscuro para información secundaria
  const BORDER_COLOR = '#E0E0E0'; // Un gris muy claro para bordes sutiles
  const HEADER_BG_COLOR = '#F5F5F5'; // Fondo suave para el encabezado

  const PAGE_MARGIN = 15;
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();

  // --- FUNCIÓN PARA EL ENCABEZADO (REUTILIZABLE EN CADA PÁGINA) ---
  const addHeader = () => {
    // Fondo del encabezado
    doc.setFillColor(HEADER_BG_COLOR);
    doc.rect(0, 0, PAGE_WIDTH, 45, 'F');

    // Logo de la empresa
    if (logoBase64) {
      const logoData = logoBase64.split(',')[1]; // Extraer solo los datos Base64
      doc.addImage(logoData, 'PNG', PAGE_MARGIN, 10, 35, 18); // Aumentar la altura para mejor proporción
    }

    // Título del documento
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(PRIMARY_TEXT_COLOR);
    doc.text('COMPROBANTE DE PAGO', PAGE_WIDTH / 2, 18, { align: 'center' });

    // Información del folio y fecha
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(SECONDARY_TEXT_COLOR);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PRIMARY_TEXT_COLOR);
    doc.text(`Folio: ${data.folio}`, PAGE_WIDTH - PAGE_MARGIN, 18, { align: 'right' });
    doc.text(`Fecha: ${new Date(data.fecha).toLocaleDateString('es-MX')}`, PAGE_WIDTH - PAGE_MARGIN, 24, { align: 'right' });

    // Línea divisoria
    doc.setDrawColor(BORDER_COLOR);
    doc.line(PAGE_MARGIN, 32, PAGE_WIDTH - PAGE_MARGIN, 32);
  };

  // --- DATOS DEL CLIENTE Y DE LA EMPRESA ---
  const addClientInfo = () => {
    const startY = 50;

    // Datos de la empresa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY_TEXT_COLOR);
    doc.text('EMITIDO POR:', PAGE_MARGIN, startY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(SECONDARY_TEXT_COLOR);
    doc.text('Grupo Apícola de Oaxaca S.A. de C.V.', PAGE_MARGIN, startY + 6);
    doc.text('www.melarium.mx', PAGE_MARGIN, startY + 11);

    // Datos del cliente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY_TEXT_COLOR);
    doc.text('FACTURADO A:', PAGE_WIDTH - PAGE_MARGIN, startY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(SECONDARY_TEXT_COLOR);
    const clientX = PAGE_WIDTH - PAGE_MARGIN;
    doc.text(data.cliente.nombre, clientX, startY + 6, { align: 'right' });
    if (data.cliente.direccion) doc.text(data.cliente.direccion, clientX, startY + 11, { align: 'right' });
    if (data.cliente.email) doc.text(data.cliente.email, clientX, startY + 16, { align: 'right' });
    if (data.cliente.rfc) doc.text(`RFC: ${data.cliente.rfc}`, clientX, startY + 21, { align: 'right' });
  };

  // --- TABLA DE PRODUCTOS ---
  const addProductsTable = () => {
    const tableBody = data.productos.map(p => [
      p.cantidad.toString(),
      p.descripcion,
      `$${p.precio_unitario.toFixed(2)}`,
      `$${p.subtotal_producto.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Cant.', 'Descripción', 'P. Unitario', 'Importe']],
      body: tableBody,
      theme: 'grid', // Un tema más limpio que 'striped'
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: PRIMARY_TEXT_COLOR,
        lineColor: BORDER_COLOR
      },
      headStyles: {
        fillColor: BRAND_COLOR,
        textColor: '#FFFFFF', // Texto blanco para contraste
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      didDrawPage: (hookData) => {
        // Añadir el encabezado en cada nueva página que la tabla genere
        addHeader();
      }
    });
  };

  // --- TOTALES, MÉTODO DE PAGO Y NOTAS ---
  const addTotalsAndNotes = () => {
    const yStart = (doc as any).lastAutoTable.finalY + 10;
    const xTotalLabel = 130;
    const xTotalValue = PAGE_WIDTH - PAGE_MARGIN;

    // Contenedor para los totales
    doc.setFillColor(HEADER_BG_COLOR);
    doc.roundedRect(xTotalLabel - 5, yStart - 5, (PAGE_WIDTH - PAGE_MARGIN) - (xTotalLabel - 5), 38, 3, 3, 'F');

    let y = yStart;

    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(SECONDARY_TEXT_COLOR);
    doc.text('Subtotal:', xTotalLabel, y, { align: 'left' });
    doc.text(`$${data.totales.subtotal.toFixed(2)}`, xTotalValue, y, { align: 'right' });

    // Descuento
    if (data.totales.descuento > 0) {
      y += 6;
      doc.text('Descuento:', xTotalLabel, y, { align: 'left' });
      doc.text(`-$${data.totales.descuento.toFixed(2)}`, xTotalValue, y, { align: 'right' });
    }

    // IVA
    if (data.totales.iva && data.totales.iva > 0) {
      y += 6;
      doc.text('IVA (16%):', xTotalLabel, y, { align: 'left' });
      doc.text(`$${data.totales.iva.toFixed(2)}`, xTotalValue, y, { align: 'right' });
    }

    // Línea divisoria para el total
    y += 4;
    doc.setDrawColor(BORDER_COLOR);
    doc.line(xTotalLabel, y, xTotalValue, y);
    y += 6;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(PRIMARY_TEXT_COLOR);
    doc.text('TOTAL:', xTotalLabel, y, { align: 'left' });
    doc.text(`$${data.totales.total.toFixed(2)} ${data.totales.moneda}`, xTotalValue, y, { align: 'right' });

    // Información de pago y notas a la izquierda
    let leftY = yStart;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY_TEXT_COLOR);
    doc.text('Información de Pago:', PAGE_MARGIN, leftY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(SECONDARY_TEXT_COLOR);
    leftY += 6;
    doc.text(`Método: ${data.metodoPago.tipo}`, PAGE_MARGIN, leftY);
    leftY += 5;
    doc.text(`Estatus: ${data.estatus}`, PAGE_MARGIN, leftY);

    if (data.notas) {
      leftY += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(PRIMARY_TEXT_COLOR);
      doc.text('Notas Adicionales:', PAGE_MARGIN, leftY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(SECONDARY_TEXT_COLOR);
      doc.text(data.notas, PAGE_MARGIN, leftY + 5, { maxWidth: 100 });
    }
  };

  // --- PIE DE PÁGINA ---
  const addFooter = () => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const y = doc.internal.pageSize.getHeight() - 15;

      // Línea superior del footer
      doc.setDrawColor(BORDER_COLOR);
      doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);

      doc.setFontSize(8);
      doc.setTextColor(SECONDARY_TEXT_COLOR);
      doc.text('Gracias por su compra.', PAGE_MARGIN, y + 8);
      doc.text(`Página ${i} de ${pageCount}`, PAGE_WIDTH - PAGE_MARGIN, y + 8, { align: 'right' });
    }
  };

  // --- SECUENCIA DE GENERACIÓN DEL DOCUMENTO ---
  addHeader();
  addClientInfo();
  addProductsTable();
  addTotalsAndNotes();
  addFooter();

  // --- GUARDAR EL ARCHIVO PDF ---
  doc.save(`Comprobante-Melarium-${data.folio}.pdf`);
}

