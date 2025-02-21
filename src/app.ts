import express from "express";
import bodyParser from "body-parser";
import paystackRoutes from "./routes/paystackRoutes";

const app = express();

app.use(bodyParser.raw({ type: "application/json" }));
app.use("/api", paystackRoutes);

export default app;
