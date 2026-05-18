export interface ProjectRow {
	id: number;
	name: string;
	color: string;
	hours: number[]; 
}

export interface TimeTable {
	dates: string[]; // ordered list of date strings
	rows: ProjectRow[];
	dailyTotals: number[]; 
}
