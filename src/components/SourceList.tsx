import type { Source } from '../types/chat'

type SourceListProps = {
  sources: Source[]
}

export function SourceList({ sources }: SourceListProps) {
  const uniqueSources = Array.from(
    new Map(
      sources.map((source) => [
        source.documentName || `unknown-${source.content}`,
        source,
      ])
    ).values()
  )

  return (
    <div className="source-list">
      <div className="source-title">引用来源</div>
      <ul>
        {uniqueSources.map((source, index) => (
          <li key={`${source.documentName}-${index}`}>
            <span>{source.documentName || '未知文档'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
