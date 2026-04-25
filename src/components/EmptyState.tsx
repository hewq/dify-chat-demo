export function EmptyState() {
  const examples = [
    "前端架构设计通常需要考虑哪些核心模块？",
    "什么是 RAG，它在知识库问答里怎么工作？",
    "大型前端项目怎么做目录分层和状态管理？",
  ];

  return (
    <div className="empty-state">
      <div className="empty-state-panel">
        <span className="empty-state-kicker">Knowledge Assistant</span>
        <h2>把知识库问答界面做得更像一个成熟产品</h2>
        <p>这里适合提问前端工程、组件设计、架构拆分和知识库检索相关问题。</p>

        <div className="example-list">
          {examples.map((example) => (
            <div className="example-card" key={example}>
              <span className="example-label">示例问题</span>
              <strong>{example}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
