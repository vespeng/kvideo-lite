'use client';

import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icon';

interface NoResultsProps {
  onReset: () => void;
}

export function NoResults({ onReset }: NoResultsProps) {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div 
        className="inline-flex items-center justify-center w-32 h-32 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] mb-6 rounded-[var(--radius-full)]" 
      >
        <Icons.Search size={64} className="text-[var(--text-color-secondary)]" />
      </div>
      <h3 className="text-3xl font-bold text-[var(--text-color)] mb-4">
        未找到相关内容
      </h3>
      <p className="text-lg text-[var(--text-color-secondary)] mb-6">
        试试其他关键词或检查拼写
      </p>
      <Button variant="primary" onClick={onReset}>
        返回首页
      </Button>
    </div>
  );
}
