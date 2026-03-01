"use client";

import { useGetUsersQuery } from "@/src/state/api";
import { useAppSelector } from "../redux";
import Header from "@/src/components/Header";
import {
	DataGrid,
	GridColDef,
	Toolbar,
	ExportPrint,
	ExportCsv,
	ToolbarButton,
} from "@mui/x-data-grid";
import Image from "next/image";
import { dataGridClassNames, dataGridSxStyles } from "@/src/lib/utils";

const CustomToolbar = () => (
	<Toolbar className='toolbar flex gap-2'>
		<ToolbarButton />
		<ExportPrint />
		<ExportCsv />
	</Toolbar>
);

const columns: GridColDef[] = [
	{ field: "userId", headerName: "ID", width: 100 },
	{ field: "username", headerName: "Username", width: 150 },
	{
		field: "profilePicture",
		headerName: "Profile Picture",
		width: 100,
		renderCell: (params) => (
			<div className='flex h-full w-full items-center justify-center'>
				<div className='h-9 w-9'>
					<Image
						src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${params.value}`}
						alt={params.row.username}
						width={100}
						height={50}
						className='h-full rounded-full object-cover'
					/>
				</div>
			</div>
		),
	},
];

const Users = () => {
	const { data: users, isLoading, isError } = useGetUsersQuery();

	const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

	if (isLoading) return <div>Loading...</div>;
	if (isError || !users) return <div>Error fetching users</div>;

	return (
		<div className='flex w-full flex-col p-8'>
			<Header name='Users' />
			<div style={{ height: 650, width: "100%" }}>
				<DataGrid
					rows={users || []}
					columns={columns}
					getRowId={(row) => row.userId}
					pagination
					slots={{
						toolbar: CustomToolbar,
					}}
					className={dataGridClassNames}
					sx={dataGridSxStyles(isDarkMode)}
				/>
			</div>
		</div>
	);
};

export default Users;
