# Utilidad para generación de comprobantes PDF

Este archivo contiene la utilidad TypeScript para generar comprobantes de pago en PDF usando jsPDF en el proyecto Melarium.

- Archivo principal: `comprobante-pdf.util.ts`
- Uso: importar la función `generarComprobantePDF` y pasarle un objeto con la estructura `ComprobantePago`.
- Requiere tener instalada la dependencia `jspdf`.

## Instalación de jsPDF

```
npm install jspdf
```

## Ejemplo de uso

```typescript
import { generarComprobantePDF } from 'src/app/shared/utils/comprobante-pdf.util';

const comprobante: ComprobantePago = { /* ... */ };
generarComprobantePDF(comprobante);
```
