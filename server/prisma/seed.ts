import { PrismaClient } from "../src/generated/prisma";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

function getModelName(fileName: string): string {
	return path.basename(fileName, path.extname(fileName));
}

function getModel(modelName: string) {
	const model = prisma[modelName as keyof typeof prisma];
	if (!model || typeof model !== "object" || !("deleteMany" in model)) {
		throw new Error(
			`Model "${modelName}" not found on PrismaClient`,
		);
	}
	return model as {
		deleteMany: (args?: object) => Promise<unknown>;
		createMany: (args: object) => Promise<unknown>;
	};
}

async function deleteAllData(orderedFileNames: string[]) {
	// Reverse order so child tables (dependents) are cleared before parents
	const reversed = [...orderedFileNames].reverse();

	for (const fileName of reversed) {
		const modelName = getModelName(fileName);
		try {
			const model = getModel(modelName);
			await model.deleteMany({});
			console.log(`Cleared data from ${modelName}`);
		} catch (error) {
			console.error(
				`Error clearing data from ${modelName}:`,
				error,
			);
		}
	}
}

async function main() {
	const dataDirectory = path.join(__dirname, "seedData");

	const orderedFileNames = [
		"team.json",
		"project.json",
		"projectTeam.json",
		"user.json",
		"task.json",
		"attachment.json",
		"comment.json",
		"taskAssignment.json",
	];

	await deleteAllData(orderedFileNames);

	for (const fileName of orderedFileNames) {
		const filePath = path.join(dataDirectory, fileName);
		const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
		const modelName = getModelName(fileName);

		try {
			const model = getModel(modelName);
			await model.createMany({
				data: jsonData,
				skipDuplicates: true,
			});
			console.log(
				`Seeded ${modelName} with ${jsonData.length} records from ${fileName}`,
			);
		} catch (error) {
			console.error(
				`Error seeding data for ${modelName}:`,
				error,
			);
		}
	}
}

main()
	.catch((e) => console.error(e))
	.finally(async () => await prisma.$disconnect());
