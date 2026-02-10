import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { handleError } from "../utils/ErrorHandler";
import { prisma } from "../lib/prisma";

export const getProjects = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const projects = await prisma.project.findMany();
		res.status(StatusCodes.OK).json({
			success: true,
			data: projects,
		});
	} catch (error) {
		handleError(res, error);
	}
};

export const createProject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { name, description, startDate, endDate } = req.body;
	try {
		const newProject = await prisma.project.create({
			data: {
				name,
				description,
				startDate,
				endDate,
			},
		});

		res.status(StatusCodes.CREATED).json({
			success: true,
			data: newProject,
		});
	} catch (error: any) {
		handleError(res, error);
	}
};
