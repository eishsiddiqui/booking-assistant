import { Bot, Sparkles, ArrowRight } from "lucide-react";

export default function AiAssistantCta({ onStartChat }) {
  return (
    <section className="ai-cta-card">
      <div className="ai-cta-content">
        <div className="ai-cta-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Conversational Scheduling</span>
        </div>

        <h2 className="ai-cta-title">Need help booking?</h2>
        <p className="ai-cta-description">
          Tell our Appointment Assistant when you&apos;d like your appointment and
          we&apos;ll help you schedule it effortlessly in natural language.
        </p>

        <button type="button" onClick={onStartChat} className="ai-cta-btn">
          <Bot size={18} />
          <span>Start Chat</span>
          <ArrowRight size={16} className="btn-arrow" />
        </button>
      </div>

      <div className="ai-cta-visual" aria-hidden="true">
        <div className="ai-avatar-large">
          <Bot size={42} />
        </div>
        <div className="ai-speech-bubble">
          <span>&quot;Find me an opening on Friday at 3 PM&quot;</span>
        </div>
      </div>
    </section>
  );
}
