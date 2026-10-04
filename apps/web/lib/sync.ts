import { createClient } from "@supabase/supabase-js";
import type { Project } from "./projects";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const api = process.env.NEXT_PUBLIC_API_URL;
export const syncAvailable = Boolean(url && key && api);
export async function syncProject(project: Project): Promise<void> {
  if (!url || !key || !api)
    throw new Error(
      "Sinkronisasi belum disiapkan. Proyek tetap aman di browser ini.",
    );
  const supabase = createClient(url, key);
  let {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    const result = await supabase.auth.signInAnonymously();
    if (result.error || !result.data.session)
      throw new Error("Tidak dapat memulai sesi sinkronisasi.");
    session = result.data.session;
  }
  const response = await fetch(`${api.replace(/\/$/, "")}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      id: project.id,
      title: project.title,
      lessonId: project.lessonId,
      blocks: project.blocks,
      scene: project.scene,
    }),
  });
  if (!response.ok)
    throw new Error("Gagal sinkron. Proyek masih tersimpan di browser ini.");
}
