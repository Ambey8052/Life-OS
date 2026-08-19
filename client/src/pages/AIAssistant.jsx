import { Bot } from "lucide-react";
import ComingSoon from "./ComingSoon";

export default function AIAssistant() {
  return (
    <ComingSoon
      icon={Bot}
      title="AI Assistant"
      description="Ask what to focus on today, get job-description skill matching, and generate follow-up messages — powered by an LLM layer on top of your opportunity data."
      phase="Phase 9 — AI Assistant"
    />
  );
}
