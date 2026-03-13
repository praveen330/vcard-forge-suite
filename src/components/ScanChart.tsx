import { Scan } from '@/types/database';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';

interface ScanChartProps {
  scans: Scan[];
  days?: number;
}

export function ScanChart({ scans, days = 14 }: ScanChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = scans.filter(s => format(parseISO(s.created_at), 'yyyy-MM-dd') === dateStr).length;
      result.push({ date: format(date, 'MMM dd'), count });
    }
    return result;
  }, [scans, days]);

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fill: 'hsl(217, 14%, 56%)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'hsl(217, 14%, 56%)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'hsl(240, 22%, 9%)', border: '1px solid hsl(252, 17%, 19%)', borderRadius: 8, color: 'hsl(36, 33%, 94%)' }}
            cursor={{ fill: 'hsl(252, 17%, 19%, 0.3)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="hsl(36, 53%, 51%)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
