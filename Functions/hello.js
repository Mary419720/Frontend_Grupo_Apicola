// Frontend_Grupo_Apicola/Functions/hello.js
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hola desde Netlify Functions!" })
  };
};
