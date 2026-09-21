const express = require("express");
const cors = require("cors");

const recursoRoutes = require("./routes/recursoRoutes");
const reservaRoutes = require("./routes/reservaRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/recursos", recursoRoutes);
app.use("/reservas", reservaRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API SisLab funcionando!"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando na porta ${PORT}`);
});