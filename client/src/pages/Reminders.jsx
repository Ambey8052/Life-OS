import { Bell } from "lucide-react";
import ComingSoon from "./ComingSoon";

export default function Reminders() {
  return (
    <ComingSoon
      icon={Bell}
      title="Reminder Engine"
      description="Scheduled email/push/in-app reminders backed by Redis + BullMQ. Today's dashboard already surfaces urgency — standalone scheduled reminders are next."
      phase="Phase 4 — Reminder Engine"
    />
  );
}
