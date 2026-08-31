import { test, expect } from 'vitest';

test('project_1 returns all rows across the 1000-row cap', async () => {
  const res = await fetch('http://localhost:3000/api/monthly-ticket-counts?projectId=project_1');
  const rows = await res.json();

  let sum = 0;
      for (const row of rows) {
        sum += row.count;
} 
  expect(sum).toBe(2340);
});