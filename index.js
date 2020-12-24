const express = require("express");
const Bot = require("./src/services/bot");

const app = express();

require("dotenv").config();

const PORT = 8080 || process.env.PORT;

app.listen(PORT, () => {
  Bot.run("follow");

  console.log(`server is running at http://localhost:${PORT}`);
});
