import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClaimWorkflow } from '@/hooks/useClaimWorkflow';
import { ClaimsWorkflowProgress } from './ClaimsWorkflowProgress';
import { Claim } from '@/services/database/types';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Trash2,
  Eye,
  Download,
  MessageSquare,
  CheckCircle,
  Upload
} from 'lucide-react';

interface ClaimDetailPageProps {
  claim: Claim | null;
  onBack: () => void;
  onSuccess?: () => void;
}

export const ClaimDetailPage: React.FC<ClaimDetailPageProps> = ({
  claim,
  onBack,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [selectedTransition, setSelectedTransition] = useState('');
  const { getAvailableTransitions, transitionClaim, deleteClaim, loading } = useClaimWorkflow();

  useEffect(() => {
    setNotes('');
    setSelectedTransition('');
  }, [claim]);

  if (!claim) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Claim not found</h2>
          <p className="text-gray-600 mt-2">The requested claim could not be found.</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Claims
          </Button>
        </div>
      </div>
    );
  }

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
      setNotes('');
      setSelectedTransition('');
    }
  };

  const handleDelete = async () => {
    const success = await deleteClaim(claim.id);
    if (success) {
      onSuccess?.();
      onBack();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Claim {claim.claim_number}</h1>
            <p className="text-gray-600">Client: {claim.client_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(claim.status)}>
            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ClaimsWorkflowProgress 
            currentStatus={claim.status} 
            claimNumber={claim.claim_number}
            showTitle={false}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Claim Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Claim Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Client
                  </Label>
                  <p className="font-medium">{claim.client_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Policy Number
                  </Label>
                  <p className="font-medium">{claim.policy_number}</p>
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

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Estimated Loss
                </Label>
                <p className="text-lg font-semibold">₦{claim.estimated_loss?.toLocaleString() || '0'}</p>
              </div>

              {claim.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">{claim.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Tab */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                <p className="text-gray-600 mb-4">Upload claim documents to proceed with processing.</p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Communication Thread */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-600 mb-4">Start a conversation about this claim.</p>
                <Button variant="outline">Add Comment</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Workflow Actions */}
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

                {selectedTransition && (
                  <Button 
                    onClick={handleTransition}
                    disabled={loading || (selectedTransitionData?.requiresNotes && !notes.trim())}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : selectedTransitionData?.label || 'Update'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                View Audit Trail
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Details
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Generate Settlement
              </Button>
              
              <Separator />
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
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
                      Are you sure you want to delete claim {claim.claim_number}? This action cannot be undone and will remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete Claim'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Claim Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Claim Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reported Date:</span>
                <span>{new Date(claim.reported_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{new Date(claim.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{new Date(claim.updated_at).toLocaleDateString()}</span>
              </div>
              {claim.assigned_adjuster && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned Adjuster:</span>
                  <span>{claim.assigned_adjuster}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};