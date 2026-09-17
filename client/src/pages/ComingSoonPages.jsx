import { Bell, Bot, Calendar as CalendarIcon, FileText } from "lucide-react";
import ComingSoon from "../components/layout/ComingSoon";

export function AIAssistant() {
  return (
    <ComingSoon
      icon={Bot}
      title="AI Assistant"
      description="Ask what to focus on today, match yourself against a job description, and draft follow-up messages."
    />
  );
}

export function Calendar() {
  return (
    <ComingSoon
      icon={CalendarIcon}
      title="Calendar"
      description="Two-way sync with Google Calendar and Outlook for interviews, exams and deadlines."
    />
  );
}

export function Documents() {
  return (
    <ComingSoon
      icon={FileText}
      title="Documents"
      description="Attach resumes, offer letters and certificates, kept in secure file storage."
    />
  );
}

export function Reminders() {
  return (
    <ComingSoon
      icon={Bell}
      title="Reminders"
      description="Scheduled email and push reminders before deadlines. Today's Focus already ranks what's urgent."
    />
  );
}
