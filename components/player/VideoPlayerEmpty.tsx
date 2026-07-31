'use client';

import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';

export function VideoPlayerEmpty() {
    return (
        <Card hover={false} className="p-0 overflow-hidden">
            <div className="aspect-video bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] rounded-[var(--radius-2xl)] flex items-center justify-center border border-[var(--glass-border)]">
                <div className="text-center text-[var(--text-secondary)]">
                    <Icons.TV size={64} className="text-[var(--text-color-secondary)] mx-auto mb-4" />
                    <p>暂无播放源</p>
                </div>
            </div>
        </Card>
    );
}
