'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ActivityItem {
  date:   string;
  xp:     number;
}

interface XpHistoryChartProps {
  activity: ActivityItem[];
}

export function XpHistoryChart({ activity }: XpHistoryChartProps) {
  const data = useMemo(() => {
    // We want a cumulative sum of XP over the last 30 days
    const last30 = [...activity]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    let cumulative = 0;
    return last30.map(item => {
      cumulative += item.xp;
      // Format date nicely (e.g., "May 12")
      const d = new Date(item.date);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        fullDate: item.date,
        xp: item.xp,
        total: cumulative
      };
    });
  }, [activity]);

  return (
    <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <TrendingUp size={18} className="text-emerald-400" />
        <h3 className="font-semibold text-[--text-primary] text-sm">XP History</h3>
      </div>
      <p className="text-xs text-[--text-muted] mb-4">Cumulative experience over the last 30 days</p>

      <div className="flex-1 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis 
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'var(--bg-elevated)', 
                borderColor: 'var(--border-default)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
              itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
              formatter={(value: number) => [`${value} XP`, 'Total']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#34d399" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
