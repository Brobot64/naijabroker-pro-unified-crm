import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Claim } from "@/services/database/types";
import { UserCheck, Users, CheckCircle, Send, RefreshCw, Clock } from "lucide-react";

interface UnderwriterAssignmentProps {
  claim: Claim;
  onAssignmentComplete: () => void;
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export const UnderwriterAssignment = ({ claim, onAssignmentComplete }: UnderwriterAssignmentProps) => {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedAdjuster, setSelectedAdjuster] = useState<string>(claim.assigned_adjuster || '');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isForwardingToInsurer, setIsForwardingToInsurer] = useState(false);
  const [assignmentTimestamp, setAssignmentTimestamp] = useState<string | null>(null);

  useEffect(() => {
    loadTeamMembers();
    // Check if there's an existing assignment timestamp from audit trail
    loadAssignmentHistory();
  }, []);

  const loadAssignmentHistory = async () => {
    try {
      const { data: auditData } = await supabase
        .from('claim_audit_trail')
        .select('created_at, details')
        .eq('claim_id', claim.id)
        .eq('action', 'adjuster_assignment')
        .order('created_at', { ascending: false })
        .limit(1);

      if (auditData && auditData.length > 0) {
        setAssignmentTimestamp(auditData[0].created_at);
      }
    } catch (error) {
      console.error('Error loading assignment history:', error);
    }
  };

  const sendAssignmentNotification = async (assignedMember: TeamMember | undefined, claim: Claim, notes: string) => {
    if (!assignedMember) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single();

      // Get assigned member's email from profiles
      const { data: assignedProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', assignedMember.id)
        .single();

      // For now, we'll just log this as we'd need the email functionality set up
      console.log('Assignment notification would be sent to:', {
        assignedMember: assignedMember,
        claimNumber: claim.claim_number,
        assignedBy: `${profile?.first_name} ${profile?.last_name}`,
        notes: notes,
        claimLink: `${window.location.origin}/claims/${claim.id}`
      });

      // In a real implementation, you'd call an edge function here:
      // await supabase.functions.invoke('send-assignment-notification', { ... })

    } catch (error) {
      console.error('Error sending assignment notification:', error);
    }
  };

  const handleForwardToInsurer = async () => {
    setIsForwardingToInsurer(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log the forward action in audit trail
      const { error: auditError } = await supabase
        .from('claim_audit_trail')
        .insert({
          claim_id: claim.id,
          organization_id: claim.organization_id,
          user_id: user?.id,
          action: 'forward_to_insurer',
          stage: 'investigating',
          details: {
            action_timestamp: new Date().toISOString(),
            forwarded_by: user?.id,
            claim_number: claim.claim_number,
            notes: 'Claim forwarded to insurer for review'
          }
        });

      if (auditError) {
        console.error('Audit log error:', auditError);
      }

      // In a real implementation, you'd send email to insurer here
      console.log('Claim forwarded to insurer:', {
        claimNumber: claim.claim_number,
        forwardedBy: user?.id,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Forwarded to Insurer",
        description: "Claim has been forwarded to the insurer for review"
      });

    } catch (error) {
      console.error('Error forwarding to insurer:', error);
      toast({
        title: "Forward Failed",
        description: "Failed to forward claim to insurer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsForwardingToInsurer(false);
    }
  };

  const loadTeamMembers = async () => {
    setLoading(true);
    try {
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      // Get team members who can handle claims (Agents, Underwriters, BrokerAdmin, SuperAdmin)
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('organization_id', profile.organization_id)
        .in('role', ['Agent', 'Underwriter', 'BrokerAdmin', 'SuperAdmin']);

      if (error) {
        console.error('Error loading team roles:', error);
        return;
      }

      if (!userRoles?.length) {
        setTeamMembers([]);
        return;
      }

      // Get profile details for these users
      const userIds = userRoles.map(ur => ur.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profileError) {
        console.error('Error loading profiles:', profileError);
        return;
      }

      const members = userRoles?.map(ur => {
        const profile = profiles?.find(p => p.id === ur.user_id);
        return {
          id: ur.user_id,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          role: ur.role
        };
      }) || [];

      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async () => {
    if (!selectedAdjuster) {
      toast({
        title: "Selection Required",
        description: "Please select a team member to assign this claim to",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    try {
      // Update claim with assigned adjuster
      const { error: updateError } = await supabase
        .from('claims')
        .update({
          assigned_adjuster: selectedAdjuster,
          status: 'investigating', // Update status to investigating
          updated_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      if (updateError) throw updateError;

      // Log the assignment in audit trail
      const { data: { user } } = await supabase.auth.getUser();
      const assignedMember = teamMembers.find(m => m.id === selectedAdjuster);
      
      const { error: auditError } = await supabase
        .from('claim_audit_trail')
        .insert({
          claim_id: claim.id,
          organization_id: claim.organization_id,
          user_id: user?.id,
          action: 'adjuster_assignment',
          stage: 'investigating',
          details: {
            assigned_to: selectedAdjuster,
            assigned_to_name: `${assignedMember?.first_name} ${assignedMember?.last_name}`,
            assigned_to_role: assignedMember?.role,
            assignment_notes: assignmentNotes,
            assignment_timestamp: new Date().toISOString()
          }
        });

      if (auditError) {
        console.error('Audit log error:', auditError);
      }

      // Send notification email to assigned member
      try {
        await sendAssignmentNotification(assignedMember, claim, assignmentNotes);
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      // Set assignment timestamp
      setAssignmentTimestamp(new Date().toISOString());

      toast({
        title: "Assignment Successful",
        description: `Claim assigned to ${assignedMember?.first_name} ${assignedMember?.last_name}. Status updated to Investigating.`
      });

      onAssignmentComplete();
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign claim. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const isCurrentlyAssigned = claim.assigned_adjuster && claim.assigned_adjuster !== '';
  const currentAssignee = teamMembers.find(m => m.id === claim.assigned_adjuster);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading team members...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Assignment Status */}
      {isCurrentlyAssigned && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-green-800">Currently Assigned</h4>
          </div>
          <p className="text-sm text-green-700">
            This claim is assigned to <strong>{currentAssignee?.first_name} {currentAssignee?.last_name}</strong>
            {currentAssignee?.role && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 border-green-300">
                {currentAssignee.role}
              </Badge>
            )}
          </p>
          {assignmentTimestamp && (
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <Clock className="h-3 w-3" />
              <span>Assigned on: {new Date(assignmentTimestamp).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Assignment Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="adjuster-select">
            {isCurrentlyAssigned ? 'Reassign to Team Member' : 'Assign to Team Member'}
          </Label>
          <Select value={selectedAdjuster} onValueChange={setSelectedAdjuster}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center gap-2">
                    <span>{member.first_name} {member.last_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assignment-notes">Assignment Notes (Optional)</Label>
          <Textarea
            id="assignment-notes"
            placeholder="Add any specific instructions or notes for the assigned team member..."
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Team Members Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">Available Team Members ({teamMembers.length})</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {teamMembers.map((member) => (
            <div key={member.id} className="text-xs text-muted-foreground flex justify-between items-center">
              <span>{member.first_name} {member.last_name}</span>
              <Badge variant="outline" className="text-xs">
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={handleAssignment}
            disabled={isAssigning || !selectedAdjuster}
            className="flex-1"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {isAssigning ? 'Assigning...' : isCurrentlyAssigned ? 'Reassign Claim' : 'Assign Claim'}
          </Button>
          
          {isCurrentlyAssigned && (
            <Button
              variant="outline"
              onClick={onAssignmentComplete}
              className="flex-1"
            >
              Skip Assignment
            </Button>
          )}
        </div>

        {/* Forward to Insurer Section */}
        {isCurrentlyAssigned && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleForwardToInsurer}
                disabled={isForwardingToInsurer}
                variant="secondary"
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isForwardingToInsurer ? 'Forwarding...' : 'Forward to Insurer'}
              </Button>
              <Button
                onClick={loadAssignmentHistory}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Forward this claim to the insurer for review and assessment
            </p>
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Assignment Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Agents:</strong> Handle routine claims and initial investigations</li>
          <li>• <strong>Underwriters:</strong> Handle complex claims requiring expertise</li>
          <li>• <strong>Admins:</strong> Can handle any type of claim</li>
          <li>• Assignment will update claim status to "investigating"</li>
          <li>• Assigned member will receive notification (if email configured)</li>
        </ul>
      </div>
    </div>
  );
};