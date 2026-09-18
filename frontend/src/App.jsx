import { useEffect, useState } from "react";
import productosData from "./productos.json";

function App() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setProductos(productosData);
    setCargando(false);
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Mi Primer Servicio Cloud</h1>
      <p>Aplicación React consumiendo una API desarrollada con Node.js</p>

      {cargando && <p>Cargando información...</p>}

      {!cargando &&
        productos.map((producto) => (
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
    </div>
  );
}

export default App;