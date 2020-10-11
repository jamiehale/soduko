import { useState, useCallback } from 'react';

const useConfirmation = (onConfirm) => {
  const [confirming, setConfirming] = useState(false);

  const confirm = useCallback(() => {
    setConfirming(true);
  }, [setConfirming]);

  const handleConfirm = useCallback((...args) => {
    setConfirming(false);
    onConfirm(...args);
  }, [setConfirming, onConfirm]);

  const handleCancel = useCallback(() => {
    setConfirming(false);
  }, [setConfirming]);

  return {
    confirming,
    confirm,
    handleConfirm,
    handleCancel,
  };
};

export default useConfirmation;
