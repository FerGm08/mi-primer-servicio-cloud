import { useEffect, useState } from "react";

function App() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para el buscador y filtro
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

  // Estado del servicio (Reto 3)
  const [estadoServicio, setEstadoServicio] = useState({
    estado: "Online",
    servidor: "Node.js (Simulado)",
    servicio: "Cloud API",
    version: "1.0"
  });

  // URL del archivo CSV publicado desde Google Sheets (Reto 4)
  const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtv8X1VrgIth_-sYJ1aCtItmwn92oq4cMQX6F6x7jhAWCuLsMSSGHiRBUZ99GMORAsUQJYPCkPDhmh/pub?output=csv";

  useEffect(() => {
    fetch(SPREADSHEET_CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        // Separar las filas ignorando renglones vacíos
        const lineas = csvText.split("\n").filter((linea) => linea.trim() !== "");
        
        // Mapear cada renglón descartando la fila de encabezados [0]
        const datosParseados = lineas.slice(1).map((linea, index) => {
          const valores = linea.split(",");
          return {
            id: valores[0] ? valores[0].trim() : index + 1,
            nombre: valores[1] ? valores[1].trim() : "",
            precio: valores[2] ? parseFloat(valores[2].trim().replace(",", "")) : 0,
            categoria: valores[3] ? valores[3].trim() : "Sin Categoría",
          };
        });

        setProductos(datosParseados);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al obtener los datos de Google Sheets:", error);
        setCargando(false);
      });
  }, []);

  // Extraer categorías únicas dinámicamente según la hoja de cálculo
  const categorias = ["Todas", ...new Set(productos.map((p) => p.categoria))];

  // Filtrar productos por búsqueda y categoría
  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoriaSeleccionada === "Todas" ||
      producto.categoria === categoriaSeleccionada;

    return coincideNombre && coincideCategoria;
  });

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Mi Primer Servicio Cloud</h1>
      <p>Aplicación React consumiendo inventario en tiempo real desde Google Sheets</p>

      {/* Reto 3: Estado del Servicio */}
      <div style={{ background: "#f0f0f0", padding: "10px 15px", borderRadius: "5px", marginBottom: "20px", color: "#333" }}>
        <p style={{ margin: "2px 0" }}><strong>Estado:</strong> {estadoServicio.estado}</p>
        <p style={{ margin: "2px 0" }}><strong>Servidor:</strong> {estadoServicio.servidor}</p>
        <p style={{ margin: "2px 0" }}><strong>Servicio:</strong> {estadoServicio.servicio} v{estadoServicio.version}</p>
      </div>

      {/* Reto 1 y 2: Controles de Búsqueda y Filtro */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Buscar producto:</label>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Categoría:</label>
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            style={{ padding: "8px" }}
          >
            {categorias.map((cat, index) => (
              <option key={index} value={cat}>
                {cat === "Todas" ? "Todas las categorías" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cargando && <p>Cargando información desde la nube...</p>}

      {/* Lista de productos filtrados */}
      {!cargando &&
        productosFiltrados.map((producto) => (
          <div
            key={producto.id}
            style={{
              border: "1px solid gray",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{producto.nombre}</h3>
            <p>Precio: ${producto.precio}</p>
            <p>Categoría: {producto.categoria}</p>
          </div>
        ))}

      {!cargando && productosFiltrados.length === 0 && (
        <p>No se encontraron productos.</p>
      )}
    </div>
  );
}

export default App;