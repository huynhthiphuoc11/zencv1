// Minimal type declarations for the `@google/genai` package used in this project.
// These are intentionally lightweight to satisfy TypeScript; replace with
// official types if/when they become available from the package.
declare module "@google/genai" {
  export interface GoogleGenAIOptions {
    apiKey?: string;
  }

  export interface GenerateContentParams {
    model?: string;
    contents: string;
    config?: any;
  }

  export interface GenerateContentResponse {
    text?: string;
    // other properties may exist but are not required by this project
    [key: string]: any;
  }

  export class GoogleGenAI {
    constructor(opts?: GoogleGenAIOptions);
    models: {
      generateContent(params: GenerateContentParams): Promise<GenerateContentResponse>;
    };
  }

  export const Type: {
    OBJECT: string;
    ARRAY: string;
    STRING: string;
    NUMBER: string;
    [key: string]: any;
  };

  export default GoogleGenAI;
}
