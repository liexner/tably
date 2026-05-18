<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<form method="POST" use:enhance>
	<input name="token" type="password" placeholder="Toggl API token" />
	<button type="submit">Fetch</button>
</form>

{#if form?.error}
	<p>{form.error}</p>
{/if}

{#if form?.timetable}
	{@const { dates, rows, dailyTotals } = form.timetable}
	<table>
		<thead>
			<tr>
				<th>Project</th>
				{#each dates as date (date)}
					<th>{date}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.id)}
				<tr>
					<td>{row.name}</td>
					{#each row.hours as h, i (i)}
						<td>{h.toFixed(1)}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<td>Total</td>
				{#each dailyTotals as total, i (i)}
					<td>{total.toFixed(1)}</td>
				{/each}
			</tr>
		</tfoot>
	</table>
{/if}
