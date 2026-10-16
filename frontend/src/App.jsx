import { useEffect, useState } from "react";

// URL de tu API de Apps Script conectada a Google Sheets
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhCocsZ3zEH45F5-DqaCsvNaeQD4Zlvk0lEkdyC9sFXI5NZWAosW8JlMTR4FGxRlJF/exec";

function App() {
  // Estado para controlar el inicio de sesión
  const [autenticado, setAutenticado] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  // Estados del CRUD y datos
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para el formulario (Crear / Editar)
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [stock, setStock] = useState("");
  const [idEditando, setIdEditando] = useState(null);

  // Estados para el buscador y filtro
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

  // Estados para el Asistente Cloud con IA (Gemini)
  const [promptAi, setPromptAi] = useState("");
  const [mensajesAi, setMensajesAi] = useState([
    { sender: 'ai', text: '¡Hola! Soy tu Asistente Cloud con IA. Pregúntame sobre el inventario, stock o precios.' }
  ]);
  const [cargandoAi, setCargandoAi] = useState(false);

  // Estado del servicio
  const [estadoServicio] = useState({
    estado: "Online",
    servidor: "Google Apps Script Cloud",
    servicio: "Cloud API REST",
    version: "1.0"
  });

  // Operación READ: Obtener registros desde Google Sheets vía Apps Script
  useEffect(() => {
    if (autenticado) {
      setCargando(true);
      fetch(APPS_SCRIPT_URL)
        .then((res) => res.json())
        .then((data) => {
          setProductos(data);
          setCargando(false);
        })
        .catch((error) => {
          console.error("Error al obtener los datos de Google Sheets:", error);
          setCargando(false);
        });
    }
  }, [autenticado]);

  // Manejador del Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (usuario === "admin" && password === "12345") {
      setErrorLogin("");
      setAutenticado(true);
    } else {
      setErrorLogin("Usuario o contraseña incorrectos");
    }
  };

  // Operación CREATE o UPDATE
  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    if (!nombre || !precio || !categoria || !stock) {
      alert("Por favor completa todos los campos.");
      return;
    }

    if (idEditando !== null) {
      // UPDATE
      try {
        await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "update",
            id: idEditando,
            nombre,
            precio: parseFloat(precio),
            categoria,
            stock: parseInt(stock),
          }),
        });

        setProductos(
          productos.map((p) =>
            p.id == idEditando
              ? { ...p, nombre, precio: parseFloat(precio), categoria, stock: parseInt(stock) }
              : p
          )
        );
        setIdEditando(null);
      } catch (error) {
        console.error("Error al actualizar el registro:", error);
        alert("Hubo un error al actualizar en la nube.");
      }
    } else {
      // CREATE
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "create",
            nombre,
            precio: parseFloat(precio),
            categoria,
            stock: parseInt(stock),
          }),
        });
        const resultado = await response.json();

        const nuevoProducto = {
          id: resultado.id || (productos.length > 0 ? Math.max(...productos.map(p => Number(p.id) || 0)) + 1 : 1),
          nombre,
          precio: parseFloat(precio),
          categoria,
          stock: parseInt(stock),
        };
        setProductos([...productos, nuevoProducto]);
      } catch (error) {
        console.error("Error al crear el registro:", error);
        alert("Hubo un error al guardar en la nube.");
      }
    }

    setNombre("");
    setPrecio("");
    setCategoria("");
    setStock("");
  };

  // Preparar formulario para Editar
  const handleEditar = (producto) => {
    setIdEditando(producto.id);
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setCategoria(producto.categoria);
    setStock(producto.stock);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Operación DELETE
  const handleEliminar = async (id) => {
    if (window.confirm("¿Deseas eliminar este registro de la base de datos?")) {
      try {
        await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "delete",
            id: id,
          }),
        });
        setProductos(productos.filter((p) => p.id != id));
      } catch (error) {
        console.error("Error al eliminar el registro:", error);
        alert("Hubo un error al eliminar en la nube.");
      }
    }
  };

  // Manejador del Asistente de IA (Gemini)
  const handleEnviarAi = async (e) => {
    e.preventDefault();
    if (!promptAi.trim()) return;

    const consultaUsuario = promptAi;
    setMensajesAi(prev => [...prev, { sender: 'user', text: consultaUsuario }]);
    setPromptAi("");
    setCargandoAi(true);

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "ask_ai",
          prompt: consultaUsuario
        })
      });
      const data = await response.json();
      setMensajesAi(prev => [...prev, { sender: 'ai', text: data.response || "Respuesta recibida de la IA." }]);
    } catch (error) {
      console.error("Error con la IA:", error);
      setMensajesAi(prev => [...prev, { sender: 'ai', text: "Error de conexión con el Asistente Cloud." }]);
    } finally {
      setCargandoAi(false);
    }
  };

  // Pantalla de Login
  if (!autenticado) {
    return (
      <div style={styles.loginContainer}>
        <form onSubmit={handleLogin} style={styles.loginCard}>
          <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#38bdf8" }}>SISTEMA CLOUD</h2>
          {errorLogin && <div style={styles.errorBanner}>{errorLogin}</div>}
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Usuario:</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="admin"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="12345"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.primaryButton}>INICIAR SESIÓN</button>
        </form>
      </div>
    );
  }

  // Filtrado de productos
  const categorias = ["Todas", ...new Set(productos.map((p) => p.categoria || "Sin Categoría"))];
  const productosFiltrados = productos.filter((producto) => {
    const nombreProd = producto.nombre || "";
    const catProd = producto.categoria || "";
    const coincideNombre = nombreProd.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === "Todas" || catProd === categoriaSeleccionada;
    return coincideNombre && coincideCategoria;
  });

  return (
    <div style={styles.dashboardContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#f8fafc" }}>Sistema CRUD en la nube</h1>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>Gestión de inventario y Google Sheets en tiempo real</p>
        </div>
        <button onClick={() => setAutenticado(false)} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      {/* Estado del Servicio */}
      <div style={styles.statusCard}>
        <span style={{ color: "#22c55e", fontWeight: "bold" }}>● Estado: {estadoServicio.estado}</span>
        <span><strong>Servidor:</strong> {estadoServicio.servidor}</span>
        <span><strong>Servicio:</strong> {estadoServicio.servicio} v{estadoServicio.version}</span>
      </div>

      <div style={styles.mainGrid}>
        {/* Formulario CRUD */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>{idEditando !== null ? "✏️ Editar Producto" : "➕ Agregar Nuevo Producto"}</h3>
          <form onSubmit={handleSubmitProducto} style={styles.formGrid}>
            <div>
              <label style={styles.label}>Nombre:</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Laptop" required style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Precio ($):</label>
              <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej. 15000" required style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Categoría:</label>
              <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej. Computación" required style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Stock:</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Ej. 10" required style={styles.input} />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" style={{ ...styles.primaryButton, flex: 2, background: idEditando !== null ? "#eab308" : "#22c55e" }}>
                {idEditando !== null ? "ACTUALIZAR REGISTRO" : "AGREGAR AL SISTEMA"}
              </button>
              {idEditando !== null && (
                <button 
                  type="button" 
                  onClick={() => { setIdEditando(null); setNombre(""); setPrecio(""); setCategoria(""); setStock(""); }} 
                  style={{ ...styles.primaryButton, flex: 1, background: "#64748b" }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Búsqueda y Filtros */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔍 Buscar y Filtrar</h3>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={styles.label}>Buscar producto:</label>
              <input
                type="text"
                placeholder="Escribe para buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={{ minWidth: "200px" }}>
              <label style={styles.label}>Filtrar por categoría:</label>
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                style={styles.input}
              >
                {categorias.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat === "Todas" ? "Todas las categorías" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Registros */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={styles.cardTitle}><span style={{ margin: 0 }}>📋 Tabla de Registros</span></h3>
            <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Total encontrados: {productosFiltrados.length}</span>
          </div>

          {cargando ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Cargando información desde Google Sheets...</p>
          ) : productosFiltrados.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>No se encontraron registros.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thTr}>
                    <th style={styles.thTd}>ID</th>
                    <th style={styles.thTd}>Nombre</th>
                    <th style={styles.thTd}>Precio</th>
                    <th style={styles.thTd}>Categoría</th>
                    <th style={styles.thTd}>Stock</th>
                    <th style={styles.thTd}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((prod) => (
                    <tr key={prod.id} style={styles.trRow}>
                      <td style={styles.thTd}>{prod.id}</td>
                      <td style={{ ...styles.thTd, fontWeight: "600" }}>{prod.nombre}</td>
                      <td style={styles.thTd}>${parseFloat(prod.precio || 0).toLocaleString()}</td>
                      <td style={styles.thTd}>
                        <span style={styles.badge}>{prod.categoria}</span>
                      </td>
                      <td style={styles.thTd}>{prod.stock}</td>
                      <td style={styles.thTd}>
                        <button onClick={() => handleEditar(prod)} style={styles.editButton}>Editar</button>
                        <button onClick={() => handleEliminar(prod.id)} style={styles.deleteButton}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 🤖 Módulo del Asistente Cloud con IA (Gemini) */}
        <div style={{ ...styles.card, borderLeft: "4px solid #38bdf8" }}>
          <h3 style={styles.cardTitle}>🤖 Asistente Cloud con Inteligencia Artificial</h3>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "15px" }}>
            Consulta en lenguaje natural el estado de tu inventario mediante Google Gemini API.
          </p>
          
          <div style={{ maxHeight: "220px", overflowY: "auto", marginBottom: "15px", padding: "10px", background: "#0f172a", borderRadius: "8px", border: "1px solid #334155" }}>
            {mensajesAi.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: "8px 0" }}>
                <span style={{ 
                  background: msg.sender === 'user' ? '#3b82f6' : '#334155', 
                  color: "#fff", 
                  padding: "8px 12px", 
                  borderRadius: "12px", 
                  display: "inline-block",
                  fontSize: "0.9rem",
                  maxWidth: "80%",
                  textAlign: "left"
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
            {cargandoAi && <p style={{ fontSize: "0.8rem", color: "#38bdf8", textAlign: "center" }}>Analizando inventario con Gemini...</p>}
          </div>

          <form onSubmit={handleEnviarAi} style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={promptAi}
              onChange={(e) => setPromptAi(e.target.value)}
              placeholder="Ej: ¿Qué productos tienen poco stock?"
              style={{ ...styles.input, flex: 1 }}
            />
            <button type="submit" disabled={cargandoAi} style={{ ...styles.primaryButton, background: "#38bdf8", color: "#0f172a" }}>
              Preguntar
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

// Estilos limpios y modernos (Dark Theme profesional)
const styles = {
  loginContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  loginCard: {
    background: "#1e293b",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    width: "350px",
    color: "#f8fafc",
  },
  dashboardContainer: {
    padding: "30px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    color: "#f8fafc",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#1e293b",
    padding: "20px 25px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  statusCard: {
    display: "flex",
    gap: "20px",
    background: "#1e293b",
    padding: "12px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "0.9rem",
    color: "#cbd5e1",
    flexWrap: "wrap",
    borderLeft: "4px solid #22c55e",
  },
  mainGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  card: {
    background: "#1e293b",
    padding: "20px 25px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    margin: "0 0 15px 0",
    color: "#38bdf8",
    fontSize: "1.1rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "0.85rem",
    color: "#cbd5e1",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #475569",
    backgroundColor: "#0f172a",
    color: "#fff",
    fontSize: "0.95rem",
    boxSizing: "border-box",
  },
  primaryButton: {
    padding: "10px 15px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  errorBanner: {
    backgroundColor: "#ef444420",
    border: "1px solid #ef4444",
    color: "#f87171",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    marginBottom: "15px",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  thTr: {
    borderBottom: "2px solid #334155",
    color: "#94a3b8",
    fontSize: "0.85rem",
    textTransform: "uppercase",
  },
  thTd: {
    padding: "12px 10px",
    fontSize: "0.9rem",
  },
  trRow: {
    borderBottom: "1px solid #334155",
  },
  badge: {
    backgroundColor: "#334155",
    color: "#38bdf8",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem",
  },
  editButton: {
    backgroundColor: "#eab308",
    color: "#000",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    marginRight: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.8rem",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.8rem",
  },
};

export default App;