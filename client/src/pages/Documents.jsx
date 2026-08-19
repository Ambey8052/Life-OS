import { FileText } from "lucide-react";
import ComingSoon from "./ComingSoon";

export default function Documents() {
  return (
    <ComingSoon
      icon={FileText}
      title="Documents"
      description="Attach resumes, offer letters and certificates via secure object storage (S3 / Cloudinary / R2), with MongoDB storing only metadata."
      phase="Phase 8 — Documents + Calendar"
    />
  );
}
