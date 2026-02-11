import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { handleError } from "../utils/ErrorHandler";
import { prisma } from "../lib/prisma";

export const search = async (req: Request, res: Response): Promise<void> => {
	const { query } = req.query;

	// Validate query
	if (!query || typeof query !== "string") {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			error: "Search query is required",
		});
		return;
	}

	const searchTerm = query.trim();

	if (!searchTerm) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			error: "Search query cannot be empty",
		});
		return;
	}

	try {
		const tasks = await prisma.task.findMany({
			where: {
				OR: [
					{
						title: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
					{
						description: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				],
			},
			include: {
				author: true,
				assignee: true,
			},
		});

		const projects = await prisma.project.findMany({
			where: {
				OR: [
					{
						name: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
					{
						description: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				],
			},
		});

		const users = await prisma.user.findMany({
			where: {
				OR: [
					{
						username: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				],
			},
		});

		res.status(StatusCodes.OK).json({
			success: true,
			tasks,
			projects,
			users,
		});
	} catch (error) {
		handleError(res, error);
	}
};
