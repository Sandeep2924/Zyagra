// Hire (import) all our specialists
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // This loads our secret key from the .env file

const app = express(); // This starts our manager's shift

// --- Set up the office rules ---
app.use(cors()); // The security guard allows requests from our clubhouse
app.use(express.json()); // This allows the bouncer to understand requests written in JSON (a common data format)
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/admins", require("./routes/adminRoutes"));
// --- NEW LINE ---
app.use("/api/orders", require("./routes/orderRoutes"));
// ...
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Bouncer is connected to the Member List!")) // Success!
  .catch((err) => console.log(err)); // Something went wrong

// We will put the specific tasks for the bouncer here later

// --- Open the office for business ---
app.listen(5001, () => {
  console.log("Bouncer's office is open on port 5001");
});
