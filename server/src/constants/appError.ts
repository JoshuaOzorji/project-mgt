import { StatusCodes } from "http-status-codes";

class AppError extends Error {
	constructor(
		public statusCode: StatusCodes,
		public message: string,
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;
