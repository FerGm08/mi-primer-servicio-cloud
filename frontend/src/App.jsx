import { useEffect, useState } from "react";
import productosData from "./productos.json";

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

  useEffect(() => {
    setProductos(productosData);
    setCargando(false);
  }, []);

  // Extraer categorías únicas para el selector
  const categorias = ["Todas", ...new Set(productosData.map((p) => p.categoria))];

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
      <p>Aplicación React consumiendo una API desarrollada con Node.js</p>

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

      {cargando && <p>Cargando información...</p>}

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