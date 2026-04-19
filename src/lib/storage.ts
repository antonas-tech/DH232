export const BUCKETS = {
  avatars: process.env.SUPABASE_BUCKET_AVATARS ?? "avatars",
  samples: process.env.SUPABASE_BUCKET_SAMPLES ?? "samples",
  beats: process.env.SUPABASE_BUCKET_BEATS ?? "beats",
  covers: process.env.SUPABASE_BUCKET_COVERS ?? "covers",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export function publicUrl(bucket: BucketName, path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${encodeURI(path)}`;
}
