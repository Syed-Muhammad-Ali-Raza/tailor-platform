type Level = 'info' | 'warn' | 'error';

function write(level: Level, message: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  });
  if (level === 'error') process.stderr.write(line + '\n');
  else process.stdout.write(line + '\n');
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
};
