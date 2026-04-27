type EmptyStateProps = {
  onExampleClick: (example: string) => void;
};

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  const examples = [
    "前端架构主要包括哪些内容？",
    "什么是 RAG？",
    "大型前端项目可以怎么分层？",
  ];

  return (
    <div className="empty-state">
      <div className="empty-state-panel">
        <span className="empty-state-kicker">Knowledge Assistant</span>
        <h2>Frontend AI Assistant</h2>
        <p>基于你的知识库回答前端学习和架构问题。</p>

        <div className="example-list">
          {examples.map((example) => (
            <button
              className="example-card"
              key={example}
              onClick={() => onExampleClick(example)}
            >
              <span className="example-label">示例问题</span>
              <strong>{example}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
