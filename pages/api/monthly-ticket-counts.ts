  import type { NextApiRequest, NextApiResponse } from 'next';
  import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
      const { projectId } = req.query;
      if (typeof projectId !== 'string') {
        res.status(400).end('Invalid query: project_id is required and must be a string')
      return
      }


      const BATCH = 1000;
      let from = 0;
      let allRows: { prediction_executed_at: string }[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('tickets')
          .select('prediction_executed_at')
          .eq('project_id', projectId)
          .not('prediction_executed_at', 'is', null)
          .range(from, from + BATCH - 1);   // rows from..to, INCLUSIVE, zero-based

        if (error) {
          res.status(500).json({ message: error.message });
          return;
        }
        allRows = allRows.concat(data);
        if (data.length < BATCH) break;  // short slice = last slice
        from += BATCH;
      }
      

      const tally: Record<string, number> = {};
      for (const row of allRows) {
        const month = row.prediction_executed_at.slice(0, 7);
        tally[month] = (tally[month] ?? 0) + 1;
} 

      const result = Object.entries(tally)                    
        .map(([name, n]) => ({ month: name, count: n }))
        .sort((a, b) => a.month.localeCompare(b.month));      

      res.status(200).json(result);
    } else {  
      res.status(405).json({ message: "Method not allowed" });
    }
  }
