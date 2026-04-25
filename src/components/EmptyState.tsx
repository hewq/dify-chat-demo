export function EmptyState() {
  const examples = [
    "前端架构主要包括哪些内容？",
    "什么是 RAG？",
    "大型前端项目可以怎么分层？",
  ];

  return (
    <div className="empty-state">
      <h2>Frontend AI Assistant</h2>
      <p>基于你的知识库回答前端学习和架构问题。</p>

      <div className="example-list">
        {examples.map((example) => (
          <div className="example-card" key={example}>
            {example}
          </div>
        ))}
      </div>
    </div>
  );
}
