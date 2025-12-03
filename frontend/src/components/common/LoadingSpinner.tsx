// src/components/common/LoadingSpinner.tsx
import React from 'react';
import styled from 'styled-components';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

const SpinnerContainer = styled.div<{ size: string }>`
  display: inline-block;
  width: ${props => props.size};
  height: ${props => props.size};
`;

const Spinner = styled.div<{ color: string, size: string }>`
  width: 100%;
  height: 100%;
  border: ${props => {
    const baseSize = props.size === '16px' ? '2px' : props.size === '32px' ? '3px' : '4px';
    return `${baseSize} solid transparent`;
}};
  border-top: ${props => {
    const baseSize = props.size === '16px' ? '2px' : props.size === '32px' ? '3px' : '4px';
    return `${baseSize} solid ${props.color}`;
}};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                           size = 'medium',
                                                           color = '#3b82f6'
                                                       }) => {
    const sizeMap = {
        small: '16px',
        medium: '32px',
        large: '50px'
    };

    const spinnerSize = sizeMap[size];

    return (
        <SpinnerContainer size={spinnerSize}>
            <Spinner color={color} size={spinnerSize} />
        </SpinnerContainer>
    );
};

export default LoadingSpinner;