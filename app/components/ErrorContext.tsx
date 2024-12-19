import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';

// Define types for the context value
interface ErrorContextType {
  error: string | null;
  setError: (error: string | null) => void;
}

// Create the context with a default value
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Create a provider component
export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      // Display the alert when the error state changes
      Alert.alert('‼️ An unexpected error occurred.', error, [
        {
          text: 'OK',
          onPress: () => setError(null), // Reset the error state after acknowledging the alert
        },
      ]);
    }
  }, [error]);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

// Create a custom hook to use the ErrorContext
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorProvider;