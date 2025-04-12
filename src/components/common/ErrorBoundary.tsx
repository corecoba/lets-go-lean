import React from 'react';
import { View, Text, Button } from 'react-native';
import { logger } from '../../utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
            Something went wrong. Please try again.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' }}>
              {this.state.error.message}
            </Text>
          )}
          <Button title="Retry" onPress={this.handleRetry} />
        </View>
      );
    }

    return this.props.children;
  }
} 