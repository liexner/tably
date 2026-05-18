import type { TogglProject, TogglTimeEntry } from '$lib/types/toggl';

const BASE = 'https://api.track.toggl.com/api/v9';

function auth(token: string) {
	return 'Basic ' + btoa(`${token}:api_token`);
}

export async function fetchProjects(token: string): Promise<TogglProject[]> {
	const res = await fetch(`${BASE}/me/projects`, {
		headers: { Authorization: auth(token) }
	});
	if (!res.ok) throw new Error(`Toggl ${res.status}`);
	return res.json();
}

export async function fetchTimeEntries(
	token: string,
	start: string,
	end: string
): Promise<TogglTimeEntry[]> {
	const res = await fetch(`${BASE}/me/time_entries?start_date=${start}&end_date=${end}`, {
		headers: { Authorization: auth(token) }
	});
	if (!res.ok) throw new Error(`Toggl ${res.status}`);
	return res.json();
}
