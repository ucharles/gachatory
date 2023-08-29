const express = require("express");
require("dotenv").config();

const app = express();
app.use("/contents", express.static("contents"));
app.listen(process.env.PORT, () => {
  console.log("Image server is running on port " + process.env.PORT);
});
