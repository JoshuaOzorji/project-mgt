"use client";
import { useState } from "react";
import ProjectHeader from "../ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Timeline from "../TimelineView";
import Table from "../TableView";
import ModalNewTask from "@/src/components/ModalNewTask";
import { use } from "react";

type Props = {
	params: Promise<{ id: string }>;
};

const Project = ({ params }: Props) => {
	const { id } = use(params);
	const [activeTab, setActiveTab] = useState("Board");
	const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

	return (
		<div>
			<ModalNewTask
				isOpen={isModalNewTaskOpen}
				onClose={() => setIsModalNewTaskOpen(false)}
			/>

			<ProjectHeader
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
			{activeTab === "Board" && (
				<Board
					id={id}
					setIsModalNewTaskOpen={
						setIsModalNewTaskOpen
					}
				/>
			)}
			{activeTab === "List" && (
				<List
					id={id}
					setIsModalNewTaskOpen={
						setIsModalNewTaskOpen
					}
				/>
			)}
			{activeTab === "Timeline" && (
				<Timeline
					id={id}
					setIsModalNewTaskOpen={
						setIsModalNewTaskOpen
					}
				/>
			)}
			{activeTab === "Table" && (
				<Table
					id={id}
					setIsModalNewTaskOpen={
						setIsModalNewTaskOpen
					}
				/>
			)}
		</div>
	);
};

export default Project;
