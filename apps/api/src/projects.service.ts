import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Request } from "express";
export type ProjectInput = {
  id: string;
  title: string;
  lessonId: string;
  blocks: unknown[];
  scene?: { backdrop: string; sprite: string };
};
@Injectable()
export class ProjectsService {
  private readonly url = process.env.SUPABASE_URL;
  private readonly key = process.env.SUPABASE_PUBLISHABLE_KEY;
  configured() {
    return Boolean(this.url && this.key);
  }
  private async client(
    request: Request,
  ): Promise<{ client: SupabaseClient; userId: string }> {
    if (!this.url || !this.key)
      throw new ServiceUnavailableException("Supabase belum dikonfigurasi.");
    const token = request.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) throw new UnauthorizedException("Sesi diperlukan.");
    const client = createClient(this.url, this.key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user)
      throw new UnauthorizedException("Sesi tidak valid.");
    return { client, userId: data.user.id };
  }
  async list(request: Request) {
    const { client, userId } = await this.client(request);
    const { data, error } = await client
      .from("projects")
      .select("id,title,lesson_id,blocks,scene,updated_at")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error)
      throw new ServiceUnavailableException("Proyek belum bisa dibaca.");
    return (
      data?.map((row) => ({
        id: row.id,
        title: row.title,
        lessonId: row.lesson_id,
        blocks: row.blocks,
        scene: row.scene,
        updatedAt: row.updated_at,
      })) || []
    );
  }
  async get(request: Request, id: string) {
    const { client, userId } = await this.client(request);
    const { data, error } = await client
      .from("projects")
      .select("id,title,lesson_id,blocks,scene,updated_at")
      .eq("id", id)
      .eq("owner_id", userId)
      .maybeSingle();
    if (error)
      throw new ServiceUnavailableException("Proyek belum bisa dibaca.");
    if (!data) throw new NotFoundException("Proyek tidak ditemukan.");
    return {
      id: data.id,
      title: data.title,
      lessonId: data.lesson_id,
      blocks: data.blocks,
      scene: data.scene,
      updatedAt: data.updated_at,
    };
  }
  async save(request: Request, input: ProjectInput) {
    const { client, userId } = await this.client(request);
    if (JSON.stringify(input).length > 65536)
      throw new BadRequestException("Proyek terlalu besar.");
    const row = {
      id: input.id,
      owner_id: userId,
      title: input.title,
      lesson_id: input.lessonId,
      blocks: input.blocks,
      scene: input.scene ?? { backdrop: "space", sprite: "bot" },
      updated_at: new Date().toISOString(),
    };
    const { error } = await client
      .from("projects")
      .upsert(row, { onConflict: "id" });
    if (error)
      throw new ServiceUnavailableException("Proyek belum bisa disimpan.");
    return { ok: true, id: input.id };
  }
  async remove(request: Request, id: string) {
    const { client, userId } = await this.client(request);
    const { error } = await client
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId);
    if (error)
      throw new ServiceUnavailableException("Proyek belum bisa dihapus.");
    return { ok: true };
  }
}
