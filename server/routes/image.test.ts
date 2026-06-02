import { describe, it, expect } from 'vitest';
import imageRouter from './image';

describe('Image Route', () => {
    it('should expose the root endpoint for generation', () => {
        const paths = imageRouter.stack.map((layer: any) => layer.route?.path);
        expect(paths).toContain('/');
    });
});
