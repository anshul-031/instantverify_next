import featureFlags from '@/config/feature-flags';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = 'frontend' | 'backend';

class Logger {
  private context: LogContext;

  constructor(context: LogContext) {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    return featureFlags.logging[this.context][level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataString = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataString}`;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, error));
    }
  }
}

export const frontendLogger = new Logger('frontend');
export const backendLogger = new Logger('backend');