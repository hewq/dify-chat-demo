type EmptyStateProps = {
  onExampleClick: (example: string) => void;
};

type ExampleCard = {
  label: string;
  title: string;
  description: string;
  icon: "search" | "gauge" | "compass" | "code";
};

const examples: ExampleCard[] = [
  {
    label: "Exploration",
    title: "什么是 RAG?",
    description: "了解检索增强生成如何通过您的专有文档库提升 AI 准确度。",
    icon: "search",
  },
  {
    label: "Performance",
    title: "如何优化 React 性能?",
    description: "探讨 memoization、代码分割和虚拟列表等现代前端优化策略。",
    icon: "gauge",
  },
  {
    label: "Architecture",
    title: "前端架构建议",
    description: "关于微前端、状态管理选型以及领域驱动设计的深度探讨。",
    icon: "compass",
  },
  {
    label: "Debugging",
    title: "代码质量审查",
    description: "粘贴一段代码，让我为您分析潜在的 Bug 和改进空间。",
    icon: "code",
  },
];

function ExampleIcon({ icon }: { icon: ExampleCard["icon"] }) {
  if (icon === "search") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
        <path d="M11 8v6" />
        <path d="M8 11h6" />
      </svg>
    );
  }

  if (icon === "gauge") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 14 15.5 10.5" />
        <path d="M20 14a8 8 0 1 0-16 0" />
        <path d="M6 18h12" />
      </svg>
    );
  }

  if (icon === "compass") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-2.8 6.2L7 17l2.8-6.2L16 8Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 9h8" />
      <path d="M8 15h5" />
      <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="m9 9-2 3 2 3" />
      <path d="m15 9 2 3-2 3" />
    </svg>
  );
}

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-status">
        <span className="empty-state-pill live">
          <span className="empty-state-pill-dot" />
          Live
        </span>
        <span className="empty-state-pill model">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
          DeepSeek-V3
        </span>
      </div>

      <div className="empty-state-panel">
        <div className="empty-state-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="34"
            height="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M7 9h4l-4 4h4" />
            <path d="M14 15h3" />
          </svg>
        </div>

        <h2>Frontend AI Assistant</h2>
        <p>
          基于 Dify + DeepSeek 的前端知识库助手。我可以为您提供架构建议、
          代码重构以及最新的 React 开发实践。
        </p>

        <div className="example-list refined">
          {examples.map((example) => (
            <button
              className="example-card refined"
              key={example.title}
              onClick={() => onExampleClick(example.title)}
            >
              <div className="example-card-header">
                <span className="example-icon">
                  <ExampleIcon icon={example.icon} />
                </span>
                <span className="example-label">{example.label}</span>
              </div>
              <strong>{example.title}</strong>
              <p>{example.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
