import morgan from "morgan";
import fs from "fs";
import path from "path";

const getMorganMiddleware = () => {
	const env = process.env.NODE_ENV || "development";

	if (env === "production") {
		// From server/src/config/ go up to server/logs/
		const logsDir = path.join(__dirname, "../../logs");

		// Create logs directory if it doesn't exist
		if (!fs.existsSync(logsDir)) {
			fs.mkdirSync(logsDir, { recursive: true });
		}

		const accessLogStream = fs.createWriteStream(
			path.join(logsDir, "access.log"),
			{ flags: "a" },
		);

		return morgan("combined", { stream: accessLogStream });
	} else {
		return morgan("dev");
	}
};

export default getMorganMiddleware;
