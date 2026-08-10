import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";
import { uploadEditorialAsset } from "@/lib/media";
import { toast } from "sonner";

const AssetsManager = () => {
  const { user } = useAuth(); const [file, setFile] = useState<File | null>(null); const [alt, setAlt] = useState(""); const [uploading, setUploading] = useState(false);
  const upload = async () => { if (!user || !file) return; setUploading(true); try { await uploadEditorialAsset(user.id, file, alt); setFile(null); setAlt(""); toast.success("Asset uploaded — it is ready to attach in Studio."); } catch (error) { toast.error((error as Error).message); } finally { setUploading(false); } };
  return <div className="paper-card space-y-4 p-5"><div><h3 className="font-display text-lg font-semibold">Asset Library</h3><p className="mt-1 text-sm text-muted-foreground">Upload your own images, video demos and share-card templates. Nothing is AI-generated here.</p></div><Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /><Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Description for accessibility / internal reference" /><Button onClick={upload} disabled={!file || uploading} className="rounded-full">{uploading ? "Uploading…" : "Upload asset"}</Button></div>;
};
export default AssetsManager;
