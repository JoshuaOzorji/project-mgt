"use client";
import Header from "@/src/components/Header";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/src/lib/utils";
import { useAppSelector } from "../redux";
import {
	Priority,
	Project,
	Task,
	useGetProjectsQuery,
	useGetTasksQuery,
} from "@/src/state/api";

const taskColumns: GridColDef[] = [
	{ field: "title", headerName: "Title", width: 200 },
	{ field: "status", headerName: "Status", width: 150 },
	{ field: "priority", headerName: "Priority", width: 150 },
	{ field: "dueDate", headerName: "Due Date", width: 150 },
];

const HomePage = () => {
	return <div>Homepage</div>;
};

export default HomePage;
