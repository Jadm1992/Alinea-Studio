import { describe, it, expect } from 'vitest';
import quotesRouter from './quotes';

describe('Quotes Route', () => {
    it('should expose the root and random endpoints', () => {
        const paths = quotesRouter.stack.map((layer: any) => layer.route?.path);
        expect(paths).toContain('/');
        expect(paths).toContain('/random');
    });
});
