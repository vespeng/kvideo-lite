import { Metadata } from 'next';

export const metadata: Metadata = {
    referrer: 'no-referrer',
};

export default function PlayerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
