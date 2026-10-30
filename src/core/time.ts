/**
 * 时间格式化(移植自 handoff/time.js)。
 *
 * ADHD 用户对「多久以前」的感知比绝对时间戳强,所以策略是 相对优先、绝对兜底。
 *   今天 → "今天 14:30"    昨天 → "昨天"
 *   明天 → "明天 09:00"    其他 → "3/5" 或 "3/5 09:00"
 *   超过 300 天 → 补年份 "2025/3/5"(相对原型的改进,修跨年歧义)
 */

import { SOON_WINDOW } from './model';

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export function formatTime(ts: number | null | undefined): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();

  const hhmm = d.toTimeString().slice(0, 5);

  if (sameDay(d, now)) return `今天 ${hhmm}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(d, yesterday)) return '昨天';

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (sameDay(d, tomorrow)) return `明天 ${hhmm}`;

  const hasTime = d.getHours() || d.getMinutes();
  const farAway = Math.abs(Date.now() - ts) > 300 * 86400000;
  const md = farAway
    ? `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
    : `${d.getMonth() + 1}/${d.getDate()}`;
  return hasTime ? `${md} ${hhmm}` : md;
}

/** dueAt 是否临近(标红)。已过期也返回 true —— 过期比临近更该显眼 */
export function isSoon(due: number | null | undefined): boolean {
  if (!due) return false;
  return due - Date.now() < SOON_WINDOW;
}

/** 已过期 */
export function isOverdue(due: number | null | undefined): boolean {
  return !!due && due < Date.now();
}

/**
 * datetime-local input 需要本地时区的 "YYYY-MM-DDTHH:mm"。
 * 直接 toISOString() 是 UTC 会差时区 —— 原型踩过的坑。
 */
export function toDatetimeLocal(ts: number | null | undefined): string {
  if (!ts) return '';
  const offset = new Date().getTimezoneOffset() * 60000;
  return new Date(ts - offset).toISOString().slice(0, 16);
}

export function fromDatetimeLocal(value: string): number | null {
  return value ? new Date(value).getTime() : null;
}
