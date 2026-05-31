import { Sparkles } from 'lucide-react';
import { AssistantChat } from '@/components/assistant/AssistantChat';

export const dynamic = 'force-dynamic';

export default function AssistantPage() {
  return (
    <section className="screen show stagger">
      <div className="page-head">
        <div>
          <h1 className="page-title">
            <span className="slab-frame" style={{ width: 24, height: 32, borderWidth: 2 }}>
              <Sparkles size={13} />
            </span>{' '}
            AI Assistant
          </h1>
          <p className="page-sub">Grounded on your live qualified items, top listings, and inventory</p>
        </div>
      </div>
      <AssistantChat />
    </section>
  );
}
