
import React from 'react';

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChange,
  rows = 4,
  className = '',
  required = false,
  disabled = false
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    />
  );
};

export default TextArea;
