const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();
const WIALON_BASE = "https://hst-api.wialon.com/wialon/ajax.html";

// Login seguro con token desde variable de entorno
app.get("/wialon-login", async (req, res) => {
  const token = process.env.WIALON_TOKEN;
  if (!token) return res.status(500).json({ error: "Token no definido en backend" });

  const loginUrl = `${WIALON_BASE}?svc=token/login&params=${encodeURIComponent(JSON.stringify({ token }))}`;
  try {
    const response = await fetch(loginUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Login fallido", detalle: err.message });
  }
});

// Proxy genérico para otros servicios
app.post("/wialon", async (req, res) => {
  const { svc, params, sid } = req.body;
  if (!svc || !params) {
    return res.status(400).json({ error: "Faltan parámetros: svc o params." });
  }

  const url = `${WIALON_BASE}?svc=${svc}&params=${encodeURIComponent(JSON.stringify(params))}${sid ? `&sid=${sid}` : ""}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al contactar Wialon", detalles: error.message });
  }
});

// Proxy para subir imagen
app.post("/upload_icon", upload.single("image"), async (req, res) => {
  const { sid, params } = req.body;
  const file = req.file;

  if (!sid || !params || !file) {
    return res.status(400).json({ error: "Faltan parámetros requeridos o archivo." });
  }

  const form = new FormData();
  form.append("sid", sid);
  form.append("params", params);
  form.append("image", file.buffer, file.originalname);

  try {
    const response = await fetch(`${WIALON_BASE}?svc=unit/upload_image`, {
      method: "POST",
      body: form,
      headers: form.getHeaders()
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al subir ícono a Wialon", detalles: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy Wialon activo en puerto ${PORT}`));
