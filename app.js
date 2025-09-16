require("dotenv").config();

require("./db");

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

require("./config")(app);

const indexRoutes = require("./routes/index.routes");
const authRoutes = require('./routes/auth.routes');
app.use("/api", indexRoutes);
app.use("/auth", authRoutes);

require("./error-handling")(app);

module.exports = app;
