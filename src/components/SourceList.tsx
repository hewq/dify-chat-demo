import type { Source } from "../types/chat";

type SourceListProps = {
  sources: Source[];
};

export function SourceList({ sources }: SourceListProps) {
  return (
    <div className="source-list">
      <div className="source-title">引用来源</div>
      <ul>
        {sources.map((source, index) => (
          <li key={index}>
            <span>{source.documentName || "未知文档"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
