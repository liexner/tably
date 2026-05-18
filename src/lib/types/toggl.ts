export interface TogglProject {
	id: number;
	name: string;
	color: string;
	active: boolean;
}

export interface TogglTimeEntry {
	id: number;
	project_id: number | null;
	start: string; 
	stop: string | null;
	duration: number; 
	description: string | null;
}
