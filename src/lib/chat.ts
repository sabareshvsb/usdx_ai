export interface SourceRef {
  title: string;
  source: string;
  updated?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];
  unknown?: boolean;
}

export interface ChatRequestMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: string;
  sources: SourceRef[];
  unknown: boolean;
}
