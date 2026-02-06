import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { handleError } from "../utils/ErrorHandler";
import { prisma } from "../lib/prisma";

export const getUsers = async (req: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany();
		return res.status(StatusCodes.OK).json({
			success: true,
			data: users,
		});
	} catch (error) {
		return handleError(res, error);
	}
};

export const getUser = async (req: Request, res: Response) => {
	const { cognitoId } = req.params;

	if (!cognitoId || Array.isArray(cognitoId)) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			error: "Invalid Cognito ID",
		});
	}

	try {
		const user = await prisma.user.findUnique({
			where: {
				cognitoId: cognitoId,
			},
		});
		return res.status(StatusCodes.OK).json({
			success: true,
			data: user,
		});
	} catch (error) {
		return handleError(res, error);
	}
};

export const postUser = async (req: Request, res: Response) => {
	try {
		const { username, cognitoId, profileImageUrl, teamId } =
			req.body;

		// Validate required fields
		if (!username || !cognitoId) {
			return res.status(400).json({
				message: "Username and Cognito ID are required",
			});
		}

		const newUser = await prisma.user.create({
			data: {
				username,
				cognitoId,
				profileImageUrl,
				teamId: teamId || null,
			},
		});

		return res.status(StatusCodes.CREATED).json({
			success: true,
			data: newUser,
		});
	} catch (error) {
		return handleError(res, error);
	}
};
