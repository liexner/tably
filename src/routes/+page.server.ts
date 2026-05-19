import type { Actions } from './$types';
import { fetchProjects, fetchTimeEntries } from '$lib/server/toggl';
import { buildDateRange, buildTimeTable } from '$lib/server/mapper';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request }) => {
		const token = (await request.formData()).get('token');

		if (!token || typeof token !== 'string') {
			return fail(400, { error: 'API token is required' });
		}

		const dates = buildDateRange(7);

		const start = dates[0];
		const end = new Date();
		end.setDate(end.getDate() + 1);
		const endStr = end.toISOString().slice(0, 10);

		try {
			const [projects, entries] = await Promise.all([
				fetchProjects(token),
				fetchTimeEntries(token, start, endStr)
			]);

			return { timetable: buildTimeTable(projects, entries, dates) };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Failed tofetch data' });
		}
	}
};
