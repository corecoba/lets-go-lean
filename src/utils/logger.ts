/**
 * Logger utility for Let's Go Lean app
 * Provides structured, environment-aware logging with different debug levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  // Whether to include timestamp
  timestamp?: boolean;
  // Additional tags to categorize logs
  tags?: string[];
  // Whether to log to remote service (future implementation)
  remote?: boolean;
}

const defaultOptions: LogOptions = {
  timestamp: true,
  tags: [],
  remote: false,
};

class Logger {
  private static instance: Logger;
  private isProduction: boolean;

  private constructor() {
    // Check if we're in production environment
    // For React Native, we can check if __DEV__ is defined
    this.isProduction = typeof __DEV__ !== 'undefined' ? !__DEV__ : false;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Formats log data into a structured format
   */
  private formatLog(level: LogLevel, message: string, data?: any, options: LogOptions = {}): string {
    const opts = { ...defaultOptions, ...options };
    const timestamp = opts.timestamp ? new Date().toISOString() : '';
    const tags = opts.tags && opts.tags.length > 0 ? `[${opts.tags.join(',')}]` : '';
    
    return `${timestamp} ${level.toUpperCase()} ${tags} ${message}`;
  }

  /**
   * Log at debug level
   */
  public debug(message: string, data?: any, options?: LogOptions): void {
    if (this.isProduction) return; // Skip debug logs in production
    
    console.debug(this.formatLog('debug', message, data, options));
    if (data) console.debug(data);
  }

  /**
   * Log at info level
   */
  public info(message: string, data?: any, options?: LogOptions): void {
    console.info(this.formatLog('info', message, data, options));
    if (data) console.info(data);
  }

  /**
   * Log at warn level
   */
  public warn(message: string, data?: any, options?: LogOptions): void {
    console.warn(this.formatLog('warn', message, data, options));
    if (data) console.warn(data);
  }

  /**
   * Log at error level
   */
  public error(message: string, error?: any, options?: LogOptions): void {
    console.error(this.formatLog('error', message, error, options));
    if (error) {
      if (error instanceof Error) {
        console.error(error.message);
        console.error(error.stack);
      } else {
        console.error(error);
      }
    }
  }

  /**
   * Special method for user-related events that sanitizes sensitive data
   */
  public userEvent(eventName: string, userData: any, options?: LogOptions): void {
    // Clone the data to avoid modifying the original
    const sanitizedData = { ...userData };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'pin'];
    sensitiveFields.forEach(field => {
      if (sanitizedData[field]) sanitizedData[field] = '[REDACTED]';
    });
    
    // Add user event tag
    const tags = options?.tags || [];
    tags.push('user-event');
    
    this.info(`USER EVENT: ${eventName}`, sanitizedData, { ...options, tags });
  }
}

// Export singleton instance
export const logger = Logger.getInstance(); 