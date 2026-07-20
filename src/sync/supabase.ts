/**
 * Supabase 云端同步(移植自 handoff/supabase.js)。
 *
 * ⚠️ 已知安全弱点(P2「安全模型」待修):
 * 当前是「共享同步码」模型,RLS 对 anon 全放开。任何知道 space_key 的人都能读写,
 * 且可暴力枚举。个人自用 + 足够随机的 key 勉强可接受,**对外分享前必须接 Supabase Auth
 * + user_id + RLS `auth.uid() = user_id`**。
 *
 * ⚠️ 冲突处理(P1 待修):
 * pull 是整份覆盖,push 是整份 upsert。两端同改 → 后写赢、前面全丢。
 * 本文件的 pull() 已返回 updatedAt,供上层做「云端 vs 本地」时间戳比较提示 —— 这是最低限度护栏。
 */

import type { Doc } from '../core/types';

const SB_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://nxiyifglhycvbrccbdhg.supabase.co';
const SB_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'sb_publishable_25WBqS3QpqCIhJiEvdahSg__AG6yqx4';
const TABLE = 'mindmap_docs';

const headers: Record<string, string> = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
};

export interface PushResult {
  ok: true;
  at: number;
}

export interface PullResult {
  doc: Partial<Doc>;
  updatedAt: number;
}

/** 上传。Prefer: resolution=merge-duplicates 让 POST 变 upsert(依赖 space_key 主键) */
export async function push(spaceKey: string, doc: Doc): Promise<PushResult> {
  if (!spaceKey) throw new Error('请先填同步码');

  const res = await fetch(`${SB_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      space_key: spaceKey,
      data: doc,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) throw new Error(`上传失败 ${res.status}`);
  return { ok: true, at: Date.now() };
}

/** 下载。返回 null 表示云端没有该 key 的记录。调用方负责二次确认后再覆盖本地 */
export async function pull(spaceKey: string): Promise<PullResult | null> {
  if (!spaceKey) throw new Error('请先填同步码');

  const url =
    `${SB_URL}/rest/v1/${TABLE}` +
    `?space_key=eq.${encodeURIComponent(spaceKey)}` +
    `&select=data,updated_at`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`下载失败 ${res.status}`);

  const rows = (await res.json()) as { data: Partial<Doc>; updated_at: string }[];
  if (!rows.length) return null;

  return {
    doc: rows[0].data,
    updatedAt: new Date(rows[0].updated_at).getTime(),
  };
}
