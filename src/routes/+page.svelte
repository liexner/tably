<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { onMount } from 'svelte';
	import type { TimeTable } from '$lib/types/timetable';

	const CACHE_VERSION = 1;
	let cachedTimetable = $state<TimeTable | null>(null);
	let { form }: { form: ActionData } = $props();
	let token = $state('');
	let roundToHalf = $state(false);
	let lunchDeduct = $state(false);

	let timetable = $derived(form?.timetable ?? cachedTimetable);

	onMount(() => {
		token = localStorage.getItem('toggl_token') ?? '';

		const raw = localStorage.getItem('timetable_cache');
		if (raw) {
			const { version, data } = JSON.parse(raw);
			if (version === CACHE_VERSION) {
				cachedTimetable = data;
			} else {
				localStorage.removeItem('timetable_cache');
			}
		}
	});

	function handleEnhance({ formData }: { formData: FormData }) {
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			if (form?.timetable) {
				localStorage.setItem('toggl_token', formData.get('token') as string);
				localStorage.setItem(
					'timetable_cache',
					JSON.stringify({
						version: CACHE_VERSION,
						data: form.timetable
					})
				);
			}
		};
	}
	function formatDate(date: string) {
		const d = new Date(date);
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${month}/${day}`;
	}
	function isWeekend(date: string) {
		const day = new Date(date).getDay();
		return day === 0 || day === 6;
	}
	function roundHours(h: number) {
		if (!roundToHalf) return h.toFixed(1);
		return (Math.round(h * 2) / 2).toFixed(1);
	}

	let displayRows = $derived(
		(() => {
			if (!lunchDeduct || !timetable) return timetable?.rows ?? [];
			const t = timetable;
			return t.rows.map((row, rowIndex) => ({
				...row,
				hours: row.hours.map((h, dayIndex) => {
					const maxRowIndex = t.rows.reduce(
						(maxIdx, r, i) => (r.hours[dayIndex] > t.rows[maxIdx].hours[dayIndex] ? i : maxIdx),
						0
					);
					return rowIndex === maxRowIndex && h > 0 ? h - 0.5 : h;
				})
			}));
		})()
	);
</script>

<div>
	<div class="grid place-content-center p-4">
		<form method="POST" use:enhance={handleEnhance}>
			<div class="flex">
				<input
					bind:value={token}
					class="border-1 border-r-0 border-white p-1"
					name="token"
					type="password"
					placeholder="toggl-token"
				/>
				<button class=" border-1 border-white p-1 lowercase" type="submit">Fetch</button>
			</div>
		</form>
	</div>

	<div class="flex gap-4 justify-center ">
		<label>
			<input type="checkbox" bind:checked={roundToHalf} />
			30m rounding
		</label>

		<label>
			<input type="checkbox" bind:checked={lunchDeduct} />
			Deduct lunch
		</label>
	</div>

	<div>
		{#if form?.error}
			<p>{form.error}</p>
		{/if}

		{#if timetable}
			{@const { dates, rows, dailyTotals } = timetable!}
			<table>
				<thead class="border-b-1 border-white">
					<tr>
						<th>Project</th>
						{#each dates as date (date)}
							<th style={isWeekend(date) ? 'color: #ff6b6b; opacity: 1' : ''}>
								{formatDate(date)}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each displayRows as row (row.id)}
						<tr style="border-bottom: 1px solid {row.color}">
							<td style="color: {row.color}">{row.name}</td>
							{#each row.hours as h, i (i)}
								<td class="text-center" style={h === 0 ? 'opacity: 0.3' : ''}> {roundHours(h)}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
<!-- 				<tfoot>
					<tr>
						<td>Total</td>
						{#each dailyTotals as total, i (i)}
							<td class="text-center" style="{total === 0 ? 'opacity: 0.3' : ''}  "
								>{total.toFixed(1)}</td
							>
						{/each}
					</tr>
				</tfoot> -->
			</table>
		{/if}
	</div>
</div>
