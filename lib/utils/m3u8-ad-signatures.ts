import type { Block } from './m3u8-ad-types';

export function findDuplicateSignatureBlockIndices(blocks: Block[]): Set<number> {
    const duplicateIndices = new Set<number>();
    if (blocks.length < 2) return duplicateIndices;

    let mainBlockIndex = -1;
    let maxSegments = 0;
    blocks.forEach((block, index) => {
        if (block.segments.length > maxSegments) {
            maxSegments = block.segments.length;
            mainBlockIndex = index;
        }
    });

    const mainSegments = mainBlockIndex >= 0 ? blocks[mainBlockIndex].segments : [];
    const mainAvgDuration = mainSegments.length > 0
        ? mainSegments.reduce((sum, segment) => sum + segment.duration, 0) / mainSegments.length
        : 0;
    const signatureMap = new Map<string, number[]>();

    blocks.forEach((block, index) => {
        if (block.segments.length < 3) return;

        const firstDuration = block.segments[0].duration;
        const isUniform = block.segments.every(segment => (
            Math.abs(segment.duration - firstDuration) < 0.005
        ));
        const matchesMainDuration = mainAvgDuration > 0 &&
            Math.abs(firstDuration - mainAvgDuration) < 0.05;
        if (isUniform && matchesMainDuration) return;

        const signature = block.segments
            .map(segment => segment.duration.toFixed(3))
            .join(',');
        const matchingBlocks = signatureMap.get(signature) || [];
        matchingBlocks.push(index);
        signatureMap.set(signature, matchingBlocks);
    });

    const maxOccurrences = Math.max(2, Math.floor(blocks.length * 0.3));
    signatureMap.forEach((indices) => {
        if (indices.length < 2 || indices.length > maxOccurrences) return;

        indices.forEach((index) => {
            const isClearlySmallerThanMain = blocks[index].segments.length < maxSegments * 0.8;
            if (index !== mainBlockIndex && isClearlySmallerThanMain) {
                duplicateIndices.add(index);
            }
        });
    });

    return duplicateIndices;
}
