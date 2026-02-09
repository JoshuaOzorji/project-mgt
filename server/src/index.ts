import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import getMorganMiddleware from "./config/morganConfig";
import userRoutes from "./routes/userRoutes";
import teamRoutes from "./routes/teamRoutes";
import projectRoutes from "./routes/projectRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "cross-origin" },
	}),
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(getMorganMiddleware());

/* ROUTES */
app.get("/", (req, res) => {
	res.send("This is Home route");
});

app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/projects", projectRoutes);

/* SERVER */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
