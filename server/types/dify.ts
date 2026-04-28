export type DifyChatRequest = {
  message: string;
  conversationId?: string;
};

export type DifyBlockingResponse = {
  answer: string;
  conversation_id: string;
  [key: string]: unknown;
};

export type DifyStreamEvent = {
  event?: string;
  answer?: string;
  conversation_id?: string;
  message?: string;
  metadata?: {
    retriever_resources?: Array<{
      dataset_name?: string;
      document_name?: string;
      content?: string;
    }>;
  };
};
