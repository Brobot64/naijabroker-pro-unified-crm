
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, BarChart3, CheckCircle } from "lucide-react";

interface QuoteEvaluationProps {
  insurerMatches: any[];
  onEvaluationComplete: (evaluatedQuotes: any[]) => void;
  onBack: () => void;
}

export const QuoteEvaluation = ({ insurerMatches, onEvaluationComplete, onBack }: QuoteEvaluationProps) => {
  const [receivedQuotes, setReceivedQuotes] = useState([
    {
      id: "1",
      insurerId: "axa_mansard",
      insurerName: "AXA Mansard Insurance",
      premium: 2500000,
      sumInsured: 100000000,
      rate: 2.5,
      responseTime: "18 hours",
      score: 92,
      status: "received",
      exclusions: ["War risks", "Nuclear risks"],
      receivedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "2", 
      insurerId: "aiico",
      insurerName: "AIICO Insurance Plc",
      premium: 2750000,
      sumInsured: 100000000,
      rate: 2.75,
      responseTime: "24 hours",
      score: 88,
      status: "received",
      exclusions: ["Terrorism", "Cyber risks"],
      receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);

  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const handleForwardToClient = () => {
    const selected = receivedQuotes.filter(quote => selectedQuotes.includes(quote.id));
    onEvaluationComplete(selected);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Quote Collection & Evaluation</h2>
        </div>
        <Button 
          onClick={handleForwardToClient}
          disabled={selectedQuotes.length === 0}
        >
          Forward {selectedQuotes.length} Quote{selectedQuotes.length !== 1 ? 's' : ''} to Client
        </Button>
      </div>

      {/* Response Status */}
      <Card>
        <CardHeader>
          <CardTitle>Response Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insurerMatches?.map((match) => {
              const hasResponse = receivedQuotes.some(q => q.insurerId === match.id);
              return (
                <div key={match.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{match.name}</span>
                    <p className="text-sm text-gray-600">Sent: {new Date(match.rfqSentAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={hasResponse ? "secondary" : "outline"}>
                    {hasResponse ? "Received" : "Pending"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quote Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quote Comparison & Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {receivedQuotes.map((quote) => (
              <div 
                key={quote.id}
                className={`p-4 border rounded-lg ${
                  selectedQuotes.includes(quote.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedQuotes.includes(quote.id)}
                      onChange={() => toggleQuoteSelection(quote.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{quote.insurerName}</h4>
                        <Badge variant="secondary">
                          Score: <span className={getScoreColor(quote.score)}>{quote.score}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Premium:</span>
                          <p className="font-semibold">₦{quote.premium.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Rate:</span>
                          <p className="font-semibold">{quote.rate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Response Time:</span>
                          <p>{quote.responseTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <Badge variant="secondary">{quote.status}</Badge>
                        </div>
                      </div>
                      
                      {quote.exclusions.length > 0 && (
                        <div className="mt-2">
                          <span className="text-gray-600 text-sm">Key Exclusions:</span>
                          <p className="text-sm">{quote.exclusions.join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Quote */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Additional Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Drag and drop quote documents here, or click to browse</p>
            <Button variant="outline" className="mt-2">
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {selectedQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Quotes for Client Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedQuotes.map(quoteId => {
                const quote = receivedQuotes.find(q => q.id === quoteId);
                return quote ? (
                  <div key={quoteId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{quote.insurerName}</span>
                    <span className="text-sm">₦{quote.premium.toLocaleString()}</span>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
