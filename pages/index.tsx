import { useState , useEffect } from 'react';

export default function Home() {
    const [projectId, setProjectId] = useState('project_1'); 
    const [rows, setRows] = useState<{ month: string; count: number }[]>([]);
    useEffect(() => {

        fetch('/api/monthly-ticket-counts?projectId=' + projectId )
        .then((r) => r.json())
        .then((data) => setRows(data));
}, [projectId]);

    return <div>

        <h1>Monthly Ticket Counts</h1>

        <label  htmlFor = "projectId">Choose a project:</label>

        <select name="tickets" id="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value) }>
        <option value="project_1">Project_1</option>
        <option value="project_2">Project_2</option>
        <option value="project_3">Project_3</option>
        </select>
        
    <p>Selected: {projectId}</p>
    <p>Rows: {rows.length}</p>
    <table>
            <thead>
                <tr><th>Month</th><th>Count</th></tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{row.count}</td>
                </tr>
                ))}
            </tbody>
    </table>
    </div>
};