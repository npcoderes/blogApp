import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import { initializeAuth, setInitialized } from '../store/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoading, isInitialized, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only initialize if there's a token and we haven't initialized yet
    if (token && !isInitialized) {
      dispatch(initializeAuth());
    } else if (!token && !isInitialized) {
      // If no token, mark as initialized immediately
      dispatch(setInitialized());
    }
  }, [dispatch, token, isInitialized]);

  // Show loading screen while initializing auth
  if (!isInitialized && isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#f5f5f5'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthProvider;
