const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
  res.json({
    mensaje: "Mi primer servicio Cloud",
    estado: "Online",
    tecnologia: "Node.js + Express",
  });
});

app.listen(PORT, () => {
  console.log("Servidor ejecutándose en puerto " + PORT);
});

app.get("/api/productos",  (req, res) => {
  const productos = [
    {
      id:1,
      nombre: "Laptop,",
      precio: 13.500,
      categoria:"computadoras"
    },
    
    {
      id:2,
      nombre: "Mouse,",
      precio: 350,
      categoria:"accesorios"
    },

  ];
  res.json(productos)
});