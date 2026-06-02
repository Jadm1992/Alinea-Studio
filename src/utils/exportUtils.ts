import { ChatSession } from '../types';

export function exportSessionToMarkdown(session: ChatSession): string {
  if (!session) return '';
  
  let markdown = `# ${session.title}\n`;
  markdown += `*Date: ${new Date(session.createdAt).toLocaleString()}*\n`;
  markdown += `*Model: ${session.model}*\n\n`;
  markdown += `---\n\n`;
  
  for (const msg of session.messages) {
    const roleName = msg.role === 'user' ? '👤 **You**' : '✨ **Alinea**';
    markdown += `${roleName} - ${msg.timestamp}\n\n`;
    markdown += `${msg.text}\n\n`;
  }
  
  return markdown.trim() + '\n';
}

export function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
