import { useRef, useState } from "react";
import { Upload, X, Check, Loader2, FileImage } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/svg+xml", "application/pdf"];
const ACCEPT_ATTR = ".png,.jpg,.jpeg,.svg,.pdf";

interface LogoUploadProps {
  value?: { url: string; filename: string } | null;
  onChange: (value: { url: string; filename: string } | null) => void;
}

export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    if (!ACCEPTED_MIME.includes(file.type)) {
      toast.error(t("logoUpload.errInvalidType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("logoUpload.errTooLarge"));
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const safeBase = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .slice(0, 60) || "logo";
      const path = `client-logos/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeBase}.${ext}`;
      const { error } = await supabase.storage.from("quote-uploads").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("quote-uploads").getPublicUrl(path);
      onChange({ url: data.publicUrl, filename: file.name });
      toast.success(t("logoUpload.success"));
    } catch (err) {
      console.error("Logo upload failed:", err);
      toast.error(t("logoUpload.errUpload"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null);
    toast.success(t("logoUpload.removed"));
  };

  return (
    <div className="mt-3 animate-fade-in">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {value ? (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-3 flex items-center gap-3">
          <div className="size-9 rounded-md bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Check className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{value.filename}</div>
            <a
              href={value.url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline truncate block"
            >
              {t("logoUpload.preview")}
            </a>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={t("logoUpload.remove")}
            className="size-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className={cn(
            "w-full rounded-lg border-2 border-dashed border-border hover:border-foreground/30 p-4 flex flex-col items-center justify-center gap-2 transition-colors text-center",
            uploading && "opacity-60 cursor-not-allowed",
          )}
        >
          {uploading ? (
            <Loader2 className="size-5 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="size-5 text-muted-foreground" />
          )}
          <div className="text-sm font-medium">
            {uploading ? t("logoUpload.uploading") : t("logoUpload.cta")}
          </div>
          <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <FileImage className="size-3" />
            {t("logoUpload.hint")}
          </div>
        </button>
      )}
    </div>
  );
}
