import type { ScheduleSlot } from '../types';
import type { ClassData } from './classData';

export type SlotEntry = { slot: ScheduleSlot; start: number; sks: number };

export interface Cluster {
  members: SlotEntry[];
  start: number;
  end: number;
}

export function slotStartIndex(slot: ScheduleSlot, labels: string[]): number {
  return labels.findIndex((label) => label.startsWith(slot.startTime));
}

export function slotSks(slot: ScheduleSlot, classById: Map<string, ClassData>): number {
  return classById.get(slot.classId)?.course.sks ?? 0;
}

// group a column's slots into overlapping clusters — one cluster = one grid cell
export function clusterSlots(entries: SlotEntry[]): Cluster[] {
  const sorted = [...entries].sort((a, b) => a.start - b.start || b.sks - a.sks);
  const out: Cluster[] = [];
  for (const e of sorted) {
    const cur = out[out.length - 1];
    if (cur && e.start < cur.end) {
      cur.members.push(e);
      cur.end = Math.max(cur.end, e.start + e.sks);
    } else {
      out.push({ members: [e], start: e.start, end: e.start + e.sks });
    }
  }
  return out;
}

// first-fit side-by-side lanes so overlapping members don't occlude each other
export function assignLanes(members: SlotEntry[]): number[] {
  const laneEnds: number[] = [];
  return members.map((m) => {
    let lane = laneEnds.findIndex((end) => end <= m.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(m.start + m.sks);
    } else {
      laneEnds[lane] = m.start + m.sks;
    }
    return lane;
  });
}
