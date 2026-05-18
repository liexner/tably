import type { TogglProject, TogglTimeEntry } from '$lib/types/toggl';
import type { ProjectRow, TimeTable } from '$lib/types/timetable';

export function buildDateRange(days: number): string[] {
	const dates: string[] = [];
	const today = new Date();
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(today);
		d.setDate(d.getDate() - i);
		dates.push(d.toISOString().slice(0, 10));
	}
	return dates;
}
export function buildTimeTable(
	projects: TogglProject[],
	entries: TogglTimeEntry[],
	dates: string[]
): TimeTable {
	const dateIndex = new Map(dates.map((d, i) => [d, i]));
	const projectMap = new Map(projects.map((p) => [p.id, p]));
	const rowMap = new Map<number, ProjectRow>();

	for (const entry of entries) {
		if (entry.duration < 0 || entry.project_id === null) continue;

		const i = dateIndex.get(entry.start.slice(0, 10));
		if (i === undefined) continue;

		if (!rowMap.has(entry.project_id)) {
			const p = projectMap.get(entry.project_id);
			if (!p) continue;
			rowMap.set(entry.project_id, {
				id: p.id,
				name: p.name,
				color: p.color,
				hours: new Array(dates.length).fill(0)
			});
		}

		rowMap.get(entry.project_id)!.hours[i] += entry.duration / 3600;
	}

	const rows = [...rowMap.values()];
	const dailyTotals = dates.map((_, i) => rows.reduce((sum, row) => sum + row.hours[i], 0));

	return { dates, rows, dailyTotals };
}
