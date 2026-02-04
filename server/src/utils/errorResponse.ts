import { Response } from "express";
import { Prisma } from "@prisma/client";
import AppError from "../constants/appErrorCode";
import { INTERNAL_SERVER_ERROR, CONFLICT, NOT_FOUND } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

export const handleError = (
	res: Response,
	error: any,
	customMessage?: string,
) => {
	// If it's our custom AppError
	if (error instanceof AppError) {
		return res.status(error.statusCode).json({
			success: false,
			message: error.message,
			errorCode: error.errorCode,
		});
	}

	// If it's a Prisma error
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		return handlePrismaError(res, error);
	}

	// Generic error
	console.error("Error:", error);
	res.status(INTERNAL_SERVER_ERROR).json({
		success: false,
		message: customMessage || "An error occurred",
		...(process.env.NODE_ENV === "development" && {
			error: error.message,
		}),
	});
};

// Handle common Prisma errors
const handlePrismaError = (
	res: Response,
	error: Prisma.PrismaClientKnownRequestError,
) => {
	switch (error.code) {
		case "P2002": // Unique constraint
			return res.status(CONFLICT).json({
				success: false,
				message: "A record with this value already exists",
				errorCode: AppErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
			});

		case "P2025": // Record not found
			return res.status(NOT_FOUND).json({
				success: false,
				message: "Record not found",
				errorCode: AppErrorCode.DATABASE_ERROR,
			});

		default:
			return res.status(INTERNAL_SERVER_ERROR).json({
				success: false,
				message: "Database error occurred",
				errorCode: AppErrorCode.DATABASE_ERROR,
			});
	}
};
