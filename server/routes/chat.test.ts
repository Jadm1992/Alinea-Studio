import { describe, it, expect } from 'vitest';
import chatRouter from './chat';

describe('Chat Route', () => {
    it('should expose the root and stream endpoints', () => {
        const paths = chatRouter.stack.map((layer: any) => layer.route?.path);
        expect(paths).toContain('/');
        expect(paths).toContain('/stream');
    });
});
