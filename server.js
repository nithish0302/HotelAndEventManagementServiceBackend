require("dotenv").config(); // Load .env first

const app = require("./src/app.js");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();
