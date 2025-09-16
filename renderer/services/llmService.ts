
import { LlmProvider } from '../types';

interface LlmConfig {
  provider: LlmProvider;
  baseUrl?: string;
  modelName?: string;
  apiKey?: string;
  prompt?: string;
}

export async function correctTranscription(transcription: string, config: LlmConfig): Promise<string> {
  if (!config.apiKey || !config.prompt) {
    return transcription;
  }

  if (config.provider === LlmProvider.OPENAI) {
    try {
      let baseUrl = config.baseUrl || 'https://api.openai.com/v1';
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const fullUrl = `${baseUrl}/chat/completions`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.modelName || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: config.prompt,
            },
            {
              role: 'user',
              content: transcription,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || transcription;
    } catch (error) {
      console.error('LLM correction error:', error);
      throw new Error(`Failed to correct transcription with ${config.provider}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return transcription;
}
