import { Lock } from "lucide-react";
import ComingSoon from "./ComingSoon";

export default function AccountsVault() {
  return (
    <ComingSoon
      icon={Lock}
      title="Account Vault"
      description="Store website logins with credentials encrypted using AES-256-GCM — never in plaintext. This needs a dedicated encryption/key-derivation layer before it ships."
      phase="Phase 7 — Account Vault"
    />
  );
}
