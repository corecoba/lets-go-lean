import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Portal, Modal, Button, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SupabaseTester from './supabase-tester';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

/**
 * Debug panel component for development debugging
 * Only shows in __DEV__ mode
 */
const DebugPanel: React.FC = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState<'logs' | 'network' | 'user'>('logs');
  const [showSupabaseTester, setShowSupabaseTester] = useState(false);
  
  // Using a ref for pending logs to avoid state updates during render
  const pendingLogsRef = useRef<LogEntry[]>([]);
  
  // Function to safely update logs state
  const updateLogs = useCallback(() => {
    if (pendingLogsRef.current.length > 0) {
      setLogs(prevLogs => [
        ...pendingLogsRef.current,
        ...prevLogs.slice(0, 100 - pendingLogsRef.current.length)
      ]);
      pendingLogsRef.current = [];
    }
  }, []);

  // Only available in development mode
  if (!__DEV__) return null;

  // Override console methods to capture logs
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    // Set up an interval to process pending logs
    const intervalId = setInterval(() => {
      updateLogs();
    }, 500);

    const createLogInterceptor = (level: string) => (...args: any[]) => {
      // Call original method
      originalConsole[level as keyof typeof originalConsole](...args);
      
      // Create log entry but don't update state directly
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      // Add to pending logs
      pendingLogsRef.current.unshift({
        timestamp: new Date().toISOString(),
        level,
        message: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
        data: args.length > 0 ? args[0] : undefined
      });
    };

    // Override console methods
    console.log = createLogInterceptor('log');
    console.info = createLogInterceptor('info');
    console.warn = createLogInterceptor('warn');
    console.error = createLogInterceptor('error');
    console.debug = createLogInterceptor('debug');

    // Restore on cleanup
    return () => {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.debug = originalConsole.debug;
      clearInterval(intervalId);
    };
  }, [updateLogs]);

  const clearLogs = () => {
    setLogs([]);
  };

  // Float button to toggle debug panel
  const toggleButton = (
    <Pressable 
      style={styles.floatButton}
      onPress={() => setVisible(true)}
    >
      <MaterialCommunityIcons name="bug" size={24} color="white" />
    </Pressable>
  );

  return (
    <>
      {toggleButton}
      
      <Portal>
        <Modal 
          visible={visible} 
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Debug Panel</Text>
            <Button 
              mode="contained" 
              onPress={() => setVisible(false)}
              style={styles.closeButton}
            >
              Close
            </Button>
          </View>
          
          <View style={styles.tabs}>
            <Pressable 
              style={[styles.tab, selectedTab === 'logs' && styles.selectedTab]}
              onPress={() => setSelectedTab('logs')}
            >
              <Text style={styles.tabText}>Logs</Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, selectedTab === 'network' && styles.selectedTab]}
              onPress={() => setSelectedTab('network')}
            >
              <Text style={styles.tabText}>Network</Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, selectedTab === 'user' && styles.selectedTab]}
              onPress={() => setSelectedTab('user')}
            >
              <Text style={styles.tabText}>User Data</Text>
            </Pressable>
          </View>
          
          <Divider />
          
          <View style={styles.actions}>
            <Button mode="outlined" onPress={clearLogs}>
              Clear Logs
            </Button>
          </View>
          
          <ScrollView style={styles.content}>
            {selectedTab === 'logs' && (
              <>
                {logs.map((log, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.logEntry,
                      log.level === 'error' && styles.errorLog,
                      log.level === 'warn' && styles.warnLog,
                    ]}
                  >
                    <Text style={styles.logTime}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.logLevel}>{log.level.toUpperCase()}</Text>
                    <Text style={styles.logMessage}>{log.message}</Text>
                  </View>
                ))}
              </>
            )}
            
            {selectedTab === 'network' && (
              <List.Section>
                <List.Subheader>Network Requests</List.Subheader>
                {logs
                  .filter(log => log.message.includes('API Request') || log.message.includes('API Response'))
                  .map((log, index) => (
                    <List.Item
                      key={index}
                      title={log.message}
                      description={new Date(log.timestamp).toLocaleTimeString()}
                      left={props => (
                        <List.Icon 
                          {...props} 
                          icon={log.message.includes('Request') ? 'arrow-up' : 'arrow-down'} 
                        />
                      )}
                    />
                  ))}
              </List.Section>
            )}
            
            {selectedTab === 'user' && (
              <List.Section>
                <List.Subheader>User Events</List.Subheader>
                {logs
                  .filter(log => log.message.includes('USER EVENT'))
                  .map((log, index) => (
                    <List.Item
                      key={index}
                      title={log.message.replace('USER EVENT: ', '')}
                      description={new Date(log.timestamp).toLocaleTimeString()}
                      left={props => <List.Icon {...props} icon="account" />}
                    />
                  ))}
              </List.Section>
            )}
          </ScrollView>
          
          {!showSupabaseTester ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowSupabaseTester(true)}
            >
              <Text style={styles.buttonText}>Supabase Tester</Text>
            </TouchableOpacity>
          ) : (
            <SupabaseTester />
          )}
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  floatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    height: '80%',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f44336',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    color: '#333',
    fontWeight: '500',
  },
  actions: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  logEntry: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexWrap: 'wrap',
  },
  errorLog: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  warnLog: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  logTime: {
    width: 80,
    fontSize: 12,
    color: '#666',
  },
  logLevel: {
    width: 60,
    fontWeight: 'bold',
    fontSize: 12,
  },
  logMessage: {
    flex: 1,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default DebugPanel; 