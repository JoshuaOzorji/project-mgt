"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { use, useState } from "react";
import {
	AlertCircle,
	AlertOctagon,
	AlertTriangle,
	Briefcase,
	ChevronDown,
	ChevronUp,
	Home,
	Layers3,
	LockIcon,
	LucideIcon,
	Search,
	Settings,
	ShieldAlert,
	User,
	Users,
	X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/src/app/redux";
import { setIsSidebarCollapsed } from "@/src/state";
import { useGetProjectsQuery } from "@/src/state/api";

interface SidebarLinkProps {
	href: string;
	icon: LucideIcon;
	label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
	const pathname = usePathname();
	const isActive =
		pathname === href ||
		(pathname === "/" && href === "/dashboard");

	return (
		<Link href={href} className='w-full'>
			<div
				className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
					isActive
						? "bg-gray-100 text-white dark:bg-gray-600"
						: ""
				} justify-start px-8 py-3`}>
				{isActive && (
					<div className='absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200' />
				)}

				<Icon className='size-6 text-gray-800 dark:text-gray-100' />
				<span
					className={`font-medium text-gray-800 dark:text-gray-100`}>
					{label}
				</span>
			</div>
		</Link>
	);
};

const Sidebar = () => {
	const [showProjects, setShowProjects] = useState(false);
	const [showPriority, setShowPriority] = useState(true);

	const { data: project } = useGetProjectsQuery();
	const dispatch = useDispatch();
	const isSidebarCollapsed = useAppSelector(
		(state) => state.global.isSidebarCollapsed,
	);

	const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl
    transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white
    ${isSidebarCollapsed ? "w-0 hidden" : "w-64"}
  `;

	return (
		<div className={sidebarClassNames}>
			<div></div>
		</div>
	);
};

export default Sidebar;
