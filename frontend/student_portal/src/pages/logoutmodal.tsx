import React from 'react';
import { Button } from '@/components/ui/button';

interface LogoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isVisible, onClose, onConfirm }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
        <h3 className="text-xl font-semibold mb-4 text-center">Are you sure you want to logout?</h3>
        <div className="flex justify-between mt-4">
          <Button className="bg-red-500 text-white px-6 py-2 rounded-lg" onClick={onConfirm}>
            Yes, Logout
          </Button>
          <Button className="bg-green-500 text-white px-6 py-2 rounded-lg" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
