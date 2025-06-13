const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const WIALON_BASE = "https://hst-api.wialon.com/wialon/ajax.html";

app.post("/wialon", async (req, res) => {
  const { svc, params, sid } = req.body;

  if (!svc || !params) {
    return res.status(400).json({ error: "Faltan parámetros requeridos: svc o params." });
  }

  const url = `${WIALON_BASE}?svc=${svc}&params=${encodeURIComponent(JSON.stringify(params))}${sid ? `&sid=${sid}` : ""}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al contactar la API de Wialon", detalles: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Proxy Wialon corriendo en puerto " + PORT));
