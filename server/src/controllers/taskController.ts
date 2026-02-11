import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { handleError } from "../utils/ErrorHandler";
import { prisma } from "../lib/prisma";

export const getTasks = async (req: Request, res: Response): Promise<void> => {
	const { projectId } = req.query;

	try {
		const tasks = await prisma.task.findMany({
			where: {
				projectId: Number(projectId),
			},
			include: {
				author: true,
				assignee: true,
				comments: true,
				attachments: true,
			},
		});
		res.status(StatusCodes.OK).json({
			success: true,
			data: tasks,
		});
	} catch (error) {
		handleError(res, error);
	}
};

export const createTask = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const {
		title,
		description,
		status,
		priority,
		tags,
		startDate,
		dueDate,
		points,
		projectId,
		authorUserId,
		assignedUserId,
	} = req.body;

	try {
		//Verify author exists

		const author = await prisma.user.findUnique({
			where: { userId: authorUserId },
		});

		if (!author) {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: `Author with userId ${authorUserId} does not exist`,
			});
			return;
		}

		// Verify assignee exists (if provided)
		if (assignedUserId) {
			const assignee = await prisma.user.findUnique({
				where: { userId: assignedUserId },
			});

			if (!assignee) {
				res.status(StatusCodes.BAD_REQUEST).json({
					success: false,
					error: `Assignee with userId ${assignedUserId} does not exist`,
				});
				return;
			}
		}

		const newTask = await prisma.task.create({
			data: {
				title,
				description,
				status,
				priority,
				tags,
				startDate,
				dueDate,
				points,
				projectId,
				authorUserId,
				assignedUserId,
			},
		});
		res.status(StatusCodes.CREATED).json({
			success: true,
			data: newTask,
		});
	} catch (error) {
		handleError(res, error);
	}
};

export const updateTaskStatus = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { taskId } = req.params;
	const { status } = req.body;

	try {
		const updatedTask = await prisma.task.update({
			where: { id: Number(taskId) },
			data: {
				status,
			},
		});
		res.status(StatusCodes.OK).json({
			success: true,
			data: updatedTask,
		});
	} catch (error) {
		handleError(res, error);
	}
};

export const getUserTasks = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { userId } = req.params;

	try {
		const tasks = await prisma.task.findMany({
			where: {
				OR: [
					{ authorUserId: Number(userId) },
					{ assignedUserId: Number(userId) },
				],
			},
			include: {
				author: true,
				assignee: true,
			},
		});
		res.status(StatusCodes.OK).json({
			success: true,
			data: tasks,
		});
	} catch (error) {
		handleError(res, error);
	}
};
