export interface Scale {
  min: number;
  max: number;
  breaks: number[];
}

/** Quantile breaks for `buckets` color classes (returns buckets-1 interior breaks). */
export function computeScale(values: (number | null)[], buckets: number): Scale {
  const finite = values
    .filter((v): v is number => v !== null && Number.isFinite(v))
    .sort((a, b) => a - b);

  if (finite.length === 0) {
    return { min: 0, max: 0, breaks: [] };
  }

  const round = (n: number): number => Number(n.toFixed(4));
  const min = round(finite[0]!);
  const max = round(finite[finite.length - 1]!);

  const breaks: number[] = [];
  for (let i = 1; i < buckets; i++) {
    const q = i / buckets;
    const pos = q * (finite.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    const loVal = finite[lo]!;
    const hiVal = finite[hi]!;
    const value = lo === hi ? loVal : loVal + (hiVal - loVal) * (pos - lo);
    breaks.push(Number(value.toFixed(4)));
  }

  return { min, max, breaks };
}
