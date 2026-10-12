const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    mensaje: "Mi primer servicio Cloud",
    estado: "Online",
    tecnologia: "Node.js + Express",
  });
});

// Endpoint de productos
app.get("/api/productos", (req, res) => {
  const productos = [
    {
      id: 1,
      nombre: "Laptop",
      precio: 13500,
      categoria: "computadoras"
    },
    {
      id: 2,
      nombre: "Mouse",
      precio: 350,
      categoria: "accesorios"
    },
  ];
  res.json(productos);
});

// RETO 3: Nuevo endpoint de estado del servicio
app.get("/api/estado", (req, res) => {
  res.json({
    estado: "Online",
    servidor: "Node.js",
    servicio: "Cloud API",
    version: "1.0"
  });
});

// NUEVO ENDPOINT: Login
app.post("/api/login", (req, res) => {
  const { usuario, password } = req.body;

  // Validación de credenciales solicitadas
  if (usuario === "admin" && password === "12345") {
    res.json({
      success: true,
      mensaje: "¡Bienvenido al sistema!",
      token: "token-seguro-simulado-123"
    });
  } else {
    res.status(401).json({
      success: false,
      mensaje: "Usuario o contraseña incorrectos"
    });
  }
});

// Arrancar el servidor
app.listen(PORT, () => {
  console.log("Servidor ejecutándose en puerto " + PORT);
});