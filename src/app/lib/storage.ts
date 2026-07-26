import { supabase } from "./supabase";

export async function uploadMagnetPhoto(
  userId: string,
  magnetId: string,
  blob: Blob,
): Promise<string> {
  const path = `${userId}/${magnetId}.png`;
  const { error } = await supabase.storage
    .from("magnet-photos")
    .upload(path, blob, { contentType: "image/png", upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("magnet-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteMagnetPhoto(
  userId: string,
  magnetId: string,
): Promise<void> {
  await supabase.storage
    .from("magnet-photos")
    .remove([`${userId}/${magnetId}.png`]);
}
