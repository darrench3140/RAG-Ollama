type ChatMessage = {
  id: number;
  text: string;
  isBot: boolean;
  isHtml?: boolean;
  sources?: Sources;
};

type Sources = { filename: string; reference: string; confidence: string }[];

type SourcesOriginal = { [key: string]: number }[];
