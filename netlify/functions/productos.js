const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhCocsZ3zEH45F5-DqaCsvNaeQD4Zlvk0lEkdyC9sFXI5NZWAosW8JlMTR4FGxRlJF/exec";

exports.handler = async function (event, context) {
  const method = event.httpMethod;
  const pathSegments = event.path.split("/");
  const possibleId = pathSegments[pathSegments.length - 1];

  // Configurar cabeceras para CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };

  if (method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // 1. GET: Consultar registros
    if (method === "GET") {
      const response = await fetch(APPS_SCRIPT_URL);
      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    // 2. POST: Crear un registro
    if (method === "POST") {
      const bodyData = JSON.parse(event.body);
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "create", ...bodyData }),
      });
      const result = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    }

    // 3. PUT: Actualizar un registro (Ej: /.netlify/functions/productos/123)
    if (method === "PUT") {
      const bodyData = JSON.parse(event.body);
      const idToUpdate = possibleId && possibleId !== "productos" ? possibleId : bodyData.id;

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update", id: idToUpdate, ...bodyData }),
      });
      const result = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    }

    // 4. DELETE: Eliminar un registro (Ej: /.netlify/functions/productos/123)
    if (method === "DELETE") {
      const bodyData = event.body ? JSON.parse(event.body) : {};
      const idToDelete = possibleId && possibleId !== "productos" ? possibleId : bodyData.id;

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "delete", id: idToDelete }),
      });
      const result = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método no permitido" }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};