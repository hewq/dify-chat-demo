import type { Source } from "../types/chat";

type SourceListProps = {
  sources: Source[];
};

export function SourceList({ sources }: SourceListProps) {
  // 对 sources 进行去重，保留 documentName 不重复的项
  const uniqueSources = Array.from(
    new Set(sources.map((source) => source.documentName)),
  ).map(
    (documentName) =>
      sources.find((source) => source.documentName === documentName)!,
  );

  return (
    <div className="source-list">
      <div className="source-title">引用来源</div>
      <ul>
        {uniqueSources.map((source, index) => (
          <li key={index}>
            <span>{source.documentName || "未知文档"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
