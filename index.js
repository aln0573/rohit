const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/UMS");

const express = require("express");
const app = express();

const nocache = require("nocache");
app.use("/", nocache());
const path = require("path");

app.use("/static", express.static(path.join(__dirname, "public")));

//user route

const user_route = require("./routes/userRoute");
app.use("/", user_route);

//admin route

const admin_route = require("./routes/adminRoute");
app.use("/admin", admin_route);

app.listen(8000, () => {
  console.log(`Server is running at http://localhost:8000`);
});
