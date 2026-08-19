import { Calendar as CalendarIcon } from "lucide-react";
import ComingSoon from "./ComingSoon";

export default function Calendar() {
  return (
    <ComingSoon
      icon={CalendarIcon}
      title="Calendar"
      description="Two-way sync with Google Calendar / Outlook for interviews, exams and deadlines."
      phase="Phase 8 — Documents + Calendar"
    />
  );
}
