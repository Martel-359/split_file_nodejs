// index.js
import express from 'express';
import fileRoute from './src/route/file.route.js';
import cors from "cors";
const app = express();

const PORT = 3000;
app.use(cors())
app.use("/api/file", fileRoute);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
