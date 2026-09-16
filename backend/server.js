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

app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});