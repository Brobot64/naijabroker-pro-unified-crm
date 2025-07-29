import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuoteReminderService } from "@/services/quoteReminderService";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Send,
  Users
} from "lucide-react";

interface QuoteReminderManagerProps {
  onRemindersSent?: () => void;
}

export const QuoteReminderManager: React.FC<QuoteReminderManagerProps> = ({ onRemindersSent }) => {
  const [idleQuotes, setIdleQuotes] = useState<any[]>([]);
  const [noMatchQuotes, setNoMatchQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const { toast } = useToast();

  const loadQuotesNeedingReminders = async () => {
    setLoading(true);
    try {
      const { idleQuotes: idle, noMatchQuotes: noMatch } = await QuoteReminderService.getQuotesNeedingReminders();
      setIdleQuotes(idle);
      setNoMatchQuotes(noMatch);
    } catch (error) {
      console.error('Error loading quotes needing reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes needing reminders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async (type: 'idle' | 'no_insurer_match') => {
    setSendingReminders(true);
    try {
      const quotes = type === 'idle' ? idleQuotes : noMatchQuotes;
      const quoteIds = quotes.map(q => q.id);

      if (quoteIds.length === 0) {
        toast({
          title: "No Action Needed",
          description: `No ${type === 'idle' ? 'idle' : 'unmatched'} quotes found`,
        });
        return;
      }

      await QuoteReminderService.sendQuoteReminders(quoteIds, type);

      toast({
        title: "Reminders Sent",
        description: `Successfully sent reminders for ${quoteIds.length} quotes`,
      });

      // Refresh the data
      await loadQuotesNeedingReminders();
      onRemindersSent?.();

    } catch (error) {
      console.error('Error sending reminders:', error);
      toast({
        title: "Error",
        description: "Failed to send reminders",
        variant: "destructive",
      });
    } finally {
      setSendingReminders(false);
    }
  };

  useEffect(() => {
    loadQuotesNeedingReminders();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading quotes needing reminders...
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalQuotesNeedingAction = idleQuotes.length + noMatchQuotes.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Auto-Reminder Management
          {totalQuotesNeedingAction > 0 && (
            <Badge variant="destructive" className="ml-2">
              {totalQuotesNeedingAction} Action Required
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Idle Quotes Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-orange-500 mr-2" />
              <h3 className="font-medium">Idle Quotes (Client Selection Pending)</h3>
              <Badge variant="outline" className="ml-2">
                {idleQuotes.length} quotes
              </Badge>
            </div>
            <Button 
              onClick={() => sendReminders('idle')}
              disabled={sendingReminders || idleQuotes.length === 0}
              size="sm"
              variant="outline"
            >
              <Send className="h-4 w-4 mr-1" />
              Send Reminders
            </Button>
          </div>
          
          {idleQuotes.length > 0 ? (
            <div className="space-y-2">
              {idleQuotes.slice(0, 3).map(quote => (
                <div key={quote.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <div>
                    <span className="font-medium">{quote.quote_number}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {quote.client_name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor((new Date().getTime() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24))} days idle
                  </div>
                </div>
              ))}
              {idleQuotes.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{idleQuotes.length - 3} more quotes
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No idle quotes requiring reminders</div>
          )}
        </div>

        {/* No Insurer Match Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              <h3 className="font-medium">Quotes Without Insurer Match</h3>
              <Badge variant="outline" className="ml-2">
                {noMatchQuotes.length} quotes
              </Badge>
            </div>
            <Button 
              onClick={() => sendReminders('no_insurer_match')}
              disabled={sendingReminders || noMatchQuotes.length === 0}
              size="sm"
              variant="outline"
            >
              <Users className="h-4 w-4 mr-1" />
              Alert Team
            </Button>
          </div>
          
          {noMatchQuotes.length > 0 ? (
            <div className="space-y-2">
              {noMatchQuotes.slice(0, 3).map(quote => (
                <div key={quote.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <div>
                    <span className="font-medium">{quote.quote_number}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {quote.client_name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    RFQ sent {Math.floor((new Date().getTime() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </div>
                </div>
              ))}
              {noMatchQuotes.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{noMatchQuotes.length - 3} more quotes
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No quotes pending insurer matches</div>
          )}
        </div>

        {/* Action Summary */}
        {totalQuotesNeedingAction > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
              <span className="text-orange-800">
                <strong>{totalQuotesNeedingAction} quotes</strong> require follow-up actions to prevent drop-offs
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button 
            onClick={loadQuotesNeedingReminders}
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {totalQuotesNeedingAction > 0 && (
            <div className="text-xs text-muted-foreground">
              Auto-reminders help prevent quote drop-offs and improve conversion rates
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};