import type { ParsedBase64Image, OpenAIContentBlock, AnthropicContentBlock } from './types';

const BASE64_IMAGE_REGEX = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/;

export function parseBase64Image(dataUrl: string): ParsedBase64Image | null {
  const match = dataUrl.match(BASE64_IMAGE_REGEX);
  if (!match) return null;
  return { mediaType: match[1], data: match[2] };
}

export function parseBase64ImageOrThrow(dataUrl: string): ParsedBase64Image {
  const result = parseBase64Image(dataUrl);
  if (!result) {
    throw new Error(`Invalid base64 image data URL. Expected format "data:image/<type>;base64,<data>"`);
  }
  return result;
}

export function imagesToOpenAIContent(images: string[]): OpenAIContentBlock[] {
  return images.map((img) => {
    return {
      type: 'image_url',
      image_url: { url: img },
    };
  });
}

export function imagesToAnthropicContent(images: string[]): AnthropicContentBlock[] {
  const blocks: AnthropicContentBlock[] = [];
  for (const img of images) {
    const parsed = parseBase64Image(img);
    if (!parsed) {
      console.warn(`[Alinea] Warning: Dropping invalid base64 image for Anthropic payload.`);
      continue;
    }
    blocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: parsed.mediaType,
        data: parsed.data,
      },
    });
  }
  return blocks;
}
