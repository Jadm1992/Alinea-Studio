import { describe, it, expect } from 'vitest';
import ttsRouter from './tts';

describe('TTS Route', () => {
    it('should expose the root endpoint for generation', () => {
        const paths = ttsRouter.stack.map((layer: any) => layer.route?.path);
        expect(paths).toContain('/');
    });
});
