import { useRef, useEffect, useState } from 'react';
import './OTPInput.scss';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OTPInput = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(
    value.split('').slice(0, length).concat(Array(length).fill('')).slice(0, length),
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Sync with value prop
    const newOtp = value.split('').slice(0, length);
    const paddedOtp = [
      ...newOtp,
      ...Array(length - newOtp.length).fill(''),
    ];
    setOtp(paddedOtp);
  }, [value, length]);

  const handleChange = (index: number, newValue: string) => {
    // Only allow numbers
    const numericValue = newValue.replace(/\D/g, '').slice(0, 1);

    if (numericValue === '' && newValue === '') {
      // Allow backspace to clear
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
      return;
    }

    if (numericValue) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      onChange(newOtp.join(''));

      // Auto-focus next input
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Delete') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="otp-input-container">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={el => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index] || ''}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="otp-input"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OTPInput;

