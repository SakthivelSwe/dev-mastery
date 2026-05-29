'use client';

import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Target } from 'lucide-react';
import { PathProgressSummary } from '@/hooks/useProgress';

interface SkillRadarChartProps {
  pathProgress: PathProgressSummary[];
}

export function SkillRadarChart({ pathProgress }: SkillRadarChartProps) {
  const data = useMemo(() => {
    // Group path progress into broad skills for the radar chart
    // We'll map the 18 paths into 6 main axes
    const axes = [
      { name: 'Core Java', keys: ['java-intro', 'java-collections', 'java-concurrency', 'java-memory-model'] },
      { name: 'Spring Boot', keys: ['spring-boot-basics', 'spring-data-jpa', 'spring-security', 'spring-microservices'] },
      { name: 'Frontend', keys: ['react-fundamentals', 'advanced-react', 'angular-mastery'] },
      { name: 'DSA & Patterns', keys: ['dsa-foundations', 'advanced-dsa', 'system-design'] },
      { name: 'DevOps & Cloud', keys: ['docker-kubernetes', 'aws-cloud-developer'] },
      { name: 'Databases', keys: ['sql-mastery', 'nosql-mongodb'] },
    ];

    return axes.map(axis => {
      let totalCompleted = 0;
      let totalTopics = 0;
      
      axis.keys.forEach(key => {
        const path = pathProgress.find(p => p.pathSlug === key);
        if (path) {
          totalCompleted += path.completedTopics;
          totalTopics += path.totalTopics;
        }
      });

      const value = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;
      return {
        subject: axis.name,
        value: value,
        fullMark: 100,
      };
    });
  }, [pathProgress]);

  return (
    <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <Target size={18} className="text-indigo-400" />
        <h3 className="font-semibold text-[--text-primary] text-sm">Skill Proficiency</h3>
      </div>
      <p className="text-xs text-[--text-muted] mb-4">Your mastery across domains</p>
      
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--border-muted)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            />
            <Radar
              name="Proficiency"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.3}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-elevated)', 
                borderColor: 'var(--border-default)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#6366f1' }}
              formatter={(value: number) => [`${value}%`, 'Mastery']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
