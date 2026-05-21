import type { TogglProject, TogglTimeEntry } from '$lib/types/toggl';
import type { ProjectRow, TimeTable } from '$lib/types/timetable';

export function buildDateRange(days: number): string[] {
	const dates: string[] = [];
	const today = Temporal.Now.plainDateISO();
	for (let i = days - 1; i >= 0; i--) {
		dates.push(today.subtract({ days: i }).toString());
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
	const NO_PROJECT_ID = 0;

	for (const entry of entries) {
		if (entry.duration < 0) continue;

        const entryDate = Temporal.PlainDate.from(entry.start).toString();
		const i = dateIndex.get(entryDate);

		if (i === undefined) continue;

		const projectId = entry.project_id ?? NO_PROJECT_ID;

		if (!rowMap.has(projectId)) {
			if (projectId === NO_PROJECT_ID) {
				rowMap.set(projectId, {
					id: projectId,
					name: 'NoName',
					color: 'white',
					hours: new Array(dates.length).fill(0)
				});
			} else {
				const p = projectMap.get(projectId);
				if (!p) continue;
				rowMap.set(projectId, {
					id: p.id,
					name: p.name,
					color: p.color,
					hours: new Array(dates.length).fill(0)
				});
			}
		}

		rowMap.get(projectId)!.hours[i] += entry.duration / 3600;
	}

	const rows = [...rowMap.values()];
	const dailyTotals = dates.map((_, i) => rows.reduce((sum, row) => sum + row.hours[i], 0));

	return { dates, rows, dailyTotals };
}
