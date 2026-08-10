import { supabase } from "@/integrations/supabase/client";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

export const uploadChallengeVideo = async (userId: string, challengeId: string, file: File, caption: string) => {
  if (!file.type.startsWith("video/")) throw new Error("Please choose a video file.");
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Please keep videos under 80 MB.");
  const extension = file.name.split(".").pop() || "mp4";
  const path = `${userId}/${challengeId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("challenge-submissions").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { data: asset, error: assetError } = await supabase.from("media_assets").insert({ owner_id: userId, bucket: "challenge-submissions", path, media_type: "video" }).select("id").single();
  if (assetError) throw assetError;
  const { error: submissionError } = await supabase.from("challenge_submissions").insert({ user_id: userId, challenge_id: challengeId, media_asset_id: asset.id, caption: caption.trim() || null });
  if (submissionError) throw submissionError;
};

export const uploadEditorialAsset = async (userId: string, file: File, altText: string) => {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) throw new Error("Choose an image or video.");
  const path = `${userId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error } = await supabase.storage.from("editorial-assets").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: dbError } = await supabase.from("media_assets").insert({ owner_id: userId, bucket: "editorial-assets", path, media_type: file.type.startsWith("video/") ? "video" : "image", alt_text: altText || null }).select("id,path,media_type,alt_text").single();
  if (dbError) throw dbError;
  return data;
};
