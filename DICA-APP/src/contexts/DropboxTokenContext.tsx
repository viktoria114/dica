import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

interface DropboxTokenContextType {
  token: string | null;
  loading: boolean;
}

const DropboxTokenContext = createContext<DropboxTokenContextType | undefined>(undefined);

export const DropboxTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await api.get<{ token: string }>('/pagos/token');
        setToken(response.data.token);
      } catch (error) {
        console.error('Error fetching Dropbox token:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  return (
    <DropboxTokenContext.Provider value={{ token, loading }}>
      {children}
    </DropboxTokenContext.Provider>
  );
};

export const useDropboxToken = () => {
  const context = useContext(DropboxTokenContext);
  if (context === undefined) {
    throw new Error('useDropboxToken must be used within a DropboxTokenProvider');
  }
  return context;
};
