import { describe, it, expect } from 'vitest';
import { exportSessionToMarkdown } from './exportUtils';
import { ChatSession } from '../types';

describe('exportSessionToMarkdown', () => {
    it('should correctly format a chat session into markdown', () => {
        const mockSession: ChatSession = {
            id: '123',
            title: 'Test Conversation',
            model: 'gpt-4o',
            createdAt: '2026-06-01T12:00:00.000Z',
            messages: [
                {
                    id: 'm1',
                    role: 'user',
                    text: 'Hello world',
                    timestamp: '12:01 PM'
                },
                {
                    id: 'm2',
                    role: 'assistant',
                    text: 'Hi there!',
                    timestamp: '12:02 PM'
                }
            ]
        };

        const result = exportSessionToMarkdown(mockSession);
        
        expect(result).toContain('# Test Conversation');
        expect(result).toContain('*Model: gpt-4o*');
        expect(result).toContain('👤 **You** - 12:01 PM');
        expect(result).toContain('Hello world');
        expect(result).toContain('✨ **Alinea** - 12:02 PM');
        expect(result).toContain('Hi there!');
    });

    it('should return empty string for null session', () => {
        expect(exportSessionToMarkdown(null as any)).toBe('');
    });
});
