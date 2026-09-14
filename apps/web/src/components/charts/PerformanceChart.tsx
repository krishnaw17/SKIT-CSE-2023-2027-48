import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

interface DataPoint {
  name: string;
  score: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
  className?: string;
  title?: string;
}

export function PerformanceChart({ data, className, title = "Performance Over Time" }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={clsx("bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center h-64", className)}>
        <p className="text-slate-500">Not enough data to display chart.</p>
      </div>
    );
  }

  let displayData = data;
  
  // Recharts requires at least 2 points to draw a line/area. 
  // If we only have 1 data point, we pad it so it draws a flat line.
  if (data && data.length === 1) {
    displayData = [
      { name: '', score: data[0]!.score },
      data[0]!,
      { name: ' ', score: data[0]!.score }
    ];
  }

  return (
    <div className={clsx("bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm", className)}>
      {title && <h3 className="font-heading font-semibold text-lg mb-6">{title}</h3>}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData}
            margin={{
              top: 5,
              right: 0,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-slate-700" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#2563EB" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
