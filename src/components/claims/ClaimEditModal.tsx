import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClaimDetailPage } from './ClaimDetailPage';
import { Claim } from '@/services/database/types';

interface ClaimEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: Claim | null;
  onSuccess?: () => void;
}

export const ClaimEditModal: React.FC<ClaimEditModalProps> = ({
  open,
  onOpenChange,
  claim,
  onSuccess
}) => {
  const handleBack = () => {
    onOpenChange(false);
  };

  const handleSuccess = () => {
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Claim</DialogTitle>
        </DialogHeader>
        <ClaimDetailPage 
          claim={claim}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};