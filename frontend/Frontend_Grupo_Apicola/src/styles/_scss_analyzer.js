// Script para analizar variables SCSS
const fs = require('fs');
const path = require('path');

// Directorio de componentes
const componentsDir = path.join(__dirname, 'components');
// Archivo de variables
const variablesFile = path.join(__dirname, '_variables.scss');
// Archivo de compatibilidad
const compatibilityFile = path.join(__dirname, '_compatibility.scss');

// Leer archivo de variables para extraer las variables definidas
const variablesContent = fs.readFileSync(variablesFile, 'utf8');
// Leer archivo de compatibilidad para extraer las variables definidas
const compatibilityContent = fs.readFileSync(compatibilityFile, 'utf8');

// Extraer todas las variables definidas
const variableRegex = /\$([\w-]+):/g;
let match;
const definedVariables = new Set();

// Buscar en archivo de variables
while ((match = variableRegex.exec(variablesContent)) !== null) {
  definedVariables.add(match[1]);
}

// Buscar en archivo de compatibilidad
variableRegex.lastIndex = 0;
while ((match = variableRegex.exec(compatibilityContent)) !== null) {
  definedVariables.add(match[1]);
}

console.log('Variables definidas:', definedVariables.size);

// Analizar cada archivo de componente
const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.scss'));

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Buscar todas las variables utilizadas
  const usedVariablesRegex = /\$([\w-]+)(?!:)/g;
  const usedVariables = new Set();
  
  while ((match = usedVariablesRegex.exec(content)) !== null) {
    const varName = match[1];
    usedVariables.add(varName);
    
    // Verificar si la variable está definida
    if (!definedVariables.has(varName)) {
      console.log(`[${file}] Variable no definida: $${varName}`);
    }
  }
  
  console.log(`${file}: ${usedVariables.size} variables utilizadas`);
});
