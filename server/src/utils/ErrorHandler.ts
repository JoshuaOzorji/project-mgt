import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../constants/appError";

export const handleError = (
	res: Response,
	error: unknown,
	customMessage?: string,
) => {
	// If it's our custom AppError
	if (error instanceof AppError) {
		return res.status(error.statusCode).json({
			success: false,
			message: error.message,
			statusCode: error.statusCode,
			...(process.env.NODE_ENV === "development" && {
				stack: error.stack,
			}),
		});
	}

	// If it's a Prisma error (check for code property)
	if ((error as any)?.code && typeof (error as any).code === "string") {
		return handlePrismaError(res, error as any);
	}

	// Generic error
	console.error("Unhandled Error:", error);
	return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
		success: false,
		message: customMessage || "An unexpected error occurred",
		statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		...(process.env.NODE_ENV === "development" && {
			error:
				error instanceof Error
					? error.message
					: String(error),
			stack: error instanceof Error ? error.stack : undefined,
		}),
	});
};

// Handle common Prisma errors
const handlePrismaError = (res: Response, error: any) => {
	interface PrismaErrorInfo {
		status: StatusCodes;
		message: string;
	}

	const prismaErrorMap: Record<string, PrismaErrorInfo> = {
		// Unique constraint violation
		P2002: {
			status: StatusCodes.CONFLICT,
			message: "A record with this value already exists",
		},
		// Record not found
		P2025: {
			status: StatusCodes.NOT_FOUND,
			message: "Record not found",
		},
		// Foreign key constraint failed
		P2003: {
			status: StatusCodes.BAD_REQUEST,
			message: "Foreign key constraint failed",
		},
		// Database table does not exist
		P2021: {
			status: StatusCodes.INTERNAL_SERVER_ERROR,
			message: "Database table does not exist",
		},
		// Connection timeout
		P2024: {
			status: StatusCodes.REQUEST_TIMEOUT,
			message: "Database connection timeout",
		},
		// Required field missing
		P2011: {
			status: StatusCodes.BAD_REQUEST,
			message: "Required field is missing",
		},
		// Invalid value for field
		P2006: {
			status: StatusCodes.BAD_REQUEST,
			message: "Invalid value provided for field",
		},
		// Related record not found
		P2018: {
			status: StatusCodes.NOT_FOUND,
			message: "Required related record not found",
		},
	};

	const errorInfo = prismaErrorMap[error.code] || {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Database error occurred",
	};

	let enhancedMessage = errorInfo.message;

	// For unique constraint violations (P2002), specify which field
	if (error.code === "P2002" && error.meta?.target) {
		const fields = Array.isArray(error.meta.target)
			? error.meta.target.join(", ")
			: error.meta.target;
		const modelName = error.meta.modelName || "record";
		enhancedMessage = `${modelName} with this ${fields} already exists`;
	}

	// For foreign key failures (P2003), specify the field
	if (error.code === "P2003" && error.meta?.field_name) {
		enhancedMessage = `Invalid reference: ${error.meta.field_name}`;
	}

	// For record not found (P2025), add context
	if (error.code === "P2025" && error.meta?.cause) {
		enhancedMessage = `Record not found: ${error.meta.cause}`;
	}

	// Build response object
	const response: any = {
		success: false,
		message: enhancedMessage,
		statusCode: errorInfo.status,
	};

	// Add detailed debugging info in development
	if (process.env.NODE_ENV === "development") {
		response.debug = {
			prismaCode: error.code,
			meta: error.meta,
			originalMessage: error.message,
			clientVersion: error.clientVersion,
		};

		// Special debugging for P2002 (unique constraint)
		if (error.code === "P2002") {
			response.debug.hint =
				"Check if you're sending duplicate values or if your database sequence is out of sync";
			response.debug.affectedFields = error.meta?.target;
		}

		// Special debugging for P2003 (foreign key)
		if (error.code === "P2003") {
			response.debug.hint =
				"Ensure the referenced record exists in the related table";
			response.debug.affectedField = error.meta?.field_name;
		}
	}

	// Log the error for server-side debugging
	console.error("Prisma Error:", {
		code: error.code,
		message: error.message,
		meta: error.meta,
	});

	return res.status(errorInfo.status).json(response);
};
