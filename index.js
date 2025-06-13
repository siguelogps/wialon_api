const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer(); // memoria

// Proxy para JSON
app.post("/wialon", async (req, res) => {
  const { svc, params, sid } = req.body;
  const url = `https://hst-api.wialon.com/wialon/ajax.html?svc=${svc}&params=${encodeURIComponent(JSON.stringify(params))}${sid ? `&sid=${sid}` : ""}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al contactar la API de Wialon", detalles: error.message });
  }
});

// Proxy para subir imagen
app.post("/upload_icon", upload.single("image"), async (req, res) => {
  const { sid, params } = req.body;
  const file = req.file;

  if (!file || !sid || !params) {
    return res.status(400).json({ error: "Faltan parámetros o archivo." });
  }

  const form = new FormData();
  form.append("sid", sid);
  form.append("params", params);
  form.append("image", file.buffer, file.originalname);

  try {
    const response = await fetch("https://hst-api.wialon.com/wialon/ajax.html?svc=unit/upload_image", {
      method: "POST",
      body: form,
      headers: form.getHeaders()
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al subir imagen a Wialon", detalles: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Proxy Wialon activo en puerto " + PORT));
