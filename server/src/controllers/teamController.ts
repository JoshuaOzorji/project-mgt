import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { handleError } from "../utils/ErrorHandler";
import { prisma } from "../lib/prisma";

export const getTeams = async (req: Request, res: Response): Promise<void> => {
	try {
		const teams = await prisma.team.findMany();

		const teamsWithUsernames = await Promise.all(
			teams.map(async (team: any) => {
				const productOwner =
					await prisma.user.findUnique({
						where: {
							userId: team.productOwnerUserId!,
						},
						select: { username: true },
					});

				const projectManager =
					await prisma.user.findUnique({
						where: {
							userId: team.projectManagerUserId!,
						},
						select: { username: true },
					});

				return {
					...team,
					productOwnerUsername:
						productOwner?.username,
					projectManagerUsername:
						projectManager?.username,
				};
			}),
		);
		res.status(StatusCodes.OK).json({
			success: true,
			data: teamsWithUsernames,
		});
	} catch (error) {
		handleError(res, error);
	}
};
