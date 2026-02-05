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

	return res.status(errorInfo.status).json({
		success: false,
		message: errorInfo.message,
		statusCode: errorInfo.status,
		...(process.env.NODE_ENV === "development" && {
			prismaCode: error.code,
			details: error.meta,
		}),
	});
};
