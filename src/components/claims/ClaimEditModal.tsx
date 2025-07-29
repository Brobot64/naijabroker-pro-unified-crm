import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClaimWorkflow } from '@/hooks/useClaimWorkflow';
import { Claim } from '@/services/database/types';
import { ArrowRight, FileText, User, Calendar, MapPin, AlertTriangle, Trash2 } from 'lucide-react';

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
  const [notes, setNotes] = useState('');
  const [selectedTransition, setSelectedTransition] = useState('');
  const { getAvailableTransitions, transitionClaim, deleteClaim, loading } = useClaimWorkflow();

  useEffect(() => {
    if (!open) {
      setNotes('');
      setSelectedTransition('');
    }
  }, [open]);

  if (!claim) return null;

  const availableTransitions = getAvailableTransitions(claim.status);
  const selectedTransitionData = availableTransitions.find(t => t.to === selectedTransition);

  const handleTransition = async () => {
    if (!selectedTransition) return;

    const transition = availableTransitions.find(t => t.to === selectedTransition);
    if (transition?.requiresNotes && !notes.trim()) {
      return;
    }

    const success = await transitionClaim(claim.id, selectedTransition, notes.trim() || undefined);
    if (success) {
      onSuccess?.();
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    const success = await deleteClaim(claim.id);
    if (success) {
      onSuccess?.();
      onOpenChange(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      registered: "bg-blue-100 text-blue-800",
      investigating: "bg-yellow-100 text-yellow-800",
      assessed: "bg-purple-100 text-purple-800",
      approved: "bg-green-100 text-green-800",
      settled: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800",
      closed: "bg-slate-100 text-slate-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Claim {claim.claim_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Claim Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Claim Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                  <Badge className={getStatusColor(claim.status)}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Estimated Loss</Label>
                  <p className="font-medium">₦{claim.estimated_loss?.toLocaleString() || '0'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Client
                  </Label>
                  <p>{claim.client_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Policy
                  </Label>
                  <p>{claim.policy_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Incident Date
                  </Label>
                  <p>{new Date(claim.incident_date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Claim Type</Label>
                  <p>{claim.claim_type}</p>
                </div>
              </div>

              {claim.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{claim.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Transition */}
          {availableTransitions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transition">Next Action</Label>
                  <Select value={selectedTransition} onValueChange={setSelectedTransition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an action..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTransitions.map((transition) => (
                        <SelectItem key={transition.to} value={transition.to}>
                          <div className="flex items-center gap-2">
                            <span>{transition.label}</span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline" className="text-xs">
                              {transition.to.replace('_', ' ')}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTransitionData && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">{selectedTransitionData.description}</p>
                  </div>
                )}

                {(selectedTransitionData?.requiresNotes || selectedTransition) && (
                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      Notes {selectedTransitionData?.requiresNotes && <span className="text-red-500">*</span>}
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes for this transition..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Claim
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete Claim
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete claim {claim.claim_number}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {selectedTransition && (
                <Button 
                  onClick={handleTransition}
                  disabled={loading || (selectedTransitionData?.requiresNotes && !notes.trim())}
                >
                  {loading ? 'Processing...' : selectedTransitionData?.label || 'Update'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};