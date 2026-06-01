export const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const generateMessageId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
