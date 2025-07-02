
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { FileText, User, Clock, Activity } from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  stage: string;
  user_id: string;
  details: any;
  created_at: string;
  ip_address: string;
  user_agent: string;
}

interface QuoteAuditTrailProps {
  quoteId: string;
}

export const QuoteAuditTrail = ({ quoteId }: QuoteAuditTrailProps) => {
  const { organizationId } = useAuth();
  const { toast } = useToast();
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditTrail();
  }, [quoteId, organizationId]);

  const loadAuditTrail = async () => {
    if (!organizationId || !quoteId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quote_audit_trail')
        .select('*')
        .eq('quote_id', quoteId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuditEntries(data || []);
    } catch (error) {
      console.error('Error loading audit trail:', error);
      toast({
        title: "Error",
        description: "Failed to load audit trail",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created': return 'bg-green-500';
      case 'updated': return 'bg-blue-500';
      case 'deleted': return 'bg-red-500';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
      case 'submitted': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-3"></div>
          <span>Loading audit trail...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Audit Trail
        </CardTitle>
        <p className="text-sm text-gray-600">
          Complete history of actions performed on this quote
        </p>
      </CardHeader>
      <CardContent>
        {auditEntries.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No audit entries found for this quote</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditEntries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <Badge className={`${getActionColor(entry.action)} text-white`}>
                    {entry.action}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium capitalize">
                      {entry.stage?.replace('-', ' ')} - {entry.action}
                    </span>
                  </div>
                  
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                      <details className="cursor-pointer">
                        <summary className="hover:text-gray-800">View Details</summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(entry.created_at)}
                    </div>
                    
                    {entry.user_id && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        User: {entry.user_id.slice(0, 8)}...
                      </div>
                    )}
                    
                    {entry.ip_address && (
                      <div>
                        IP: {entry.ip_address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
