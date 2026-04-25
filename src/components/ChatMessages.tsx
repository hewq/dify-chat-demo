import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { Source } from "../types/chat";

type ChatMessagesProps = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export function ChatMessages({ role, content, sources }: ChatMessagesProps) {
  const isUser = role === "user";
  const sanitizedContent = isUser ? content : sanitizeAssistantContent(content);
  const dedupedSources = getDedupedSources(sources);

  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm sm:text-[15px] ${
          isUser
            ? "rounded-br-lg bg-blue-600 text-white"
            : "rounded-bl-lg border border-slate-200/80 bg-white text-slate-700"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{sanitizedContent}</div>
        ) : !sanitizedContent ? (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300" />
          </div>
        ) : (
          <div className="max-w-none whitespace-pre-wrap [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-slate-100 [&_p]:my-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {sanitizedContent}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && dedupedSources.length > 0 && (
          <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-500">
            <div className="mb-1.5 font-semibold text-slate-600">引用来源</div>
            <ul className="list-disc space-y-1 pl-5">
              {dedupedSources.map((source) => (
                <li key={buildSourceKey(source)}>
                  {source.documentName || "未知文档"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function sanitizeAssistantContent(content: string) {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*/gi, "")
    .trim();
}

function getDedupedSources(sources?: Source[]) {
  if (!sources?.length) {
    return [];
  }

  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = buildSourceKey(source);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildSourceKey(source: Source) {
  const documentName = source.documentName?.trim();
  if (documentName) {
    return documentName.toLowerCase();
  }

  const datasetName = source.datasetName?.trim();
  if (datasetName) {
    return `dataset::${datasetName.toLowerCase()}`;
  }

  const content = source.content?.trim();
  if (content) {
    return `content::${content}`;
  }

  return "unknown-source";
}
