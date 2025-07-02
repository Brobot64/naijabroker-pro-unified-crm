
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Eye, Download, Star, TrendingUp, TrendingDown } from "lucide-react";

interface QuoteEvaluationEnhancedProps {
  insurerMatches: any[];
  onEvaluationComplete: (evaluatedQuotes: any[]) => void;
  onBack: () => void;
}

export const QuoteEvaluationEnhanced = ({ insurerMatches, onEvaluationComplete, onBack }: QuoteEvaluationEnhancedProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState(
    insurerMatches?.map(match => ({
      ...match,
      premium_quoted: 0,
      terms_conditions: '',
      exclusions: [],
      coverage_limits: {},
      rating_score: 0,
      remarks: '',
      document_url: '',
      response_received: false,
    })) || []
  );

  const handleQuoteUpdate = (index: number, field: string, value: any) => {
    setQuotes(prev => prev.map((quote, i) => 
      i === index ? { ...quote, [field]: value } : quote
    ));
  };

  const handleFileUpload = (index: number, file: File) => {
    // Simulate file upload
    const fileUrl = URL.createObjectURL(file);
    handleQuoteUpdate(index, 'document_url', fileUrl);
    handleQuoteUpdate(index, 'response_received', true);
    
    toast({
      title: "Success",
      description: `Quote document uploaded for ${quotes[index].insurer_name}`,
    });
  };

  const calculateRatingScore = (quote: any) => {
    let score = 0;
    
    // Premium competitiveness (40% weight)
    const allPremiums = quotes.filter(q => q.premium_quoted > 0).map(q => q.premium_quoted);
    if (allPremiums.length > 1) {
      const minPremium = Math.min(...allPremiums);
      const maxPremium = Math.max(...allPremiums);
      const range = maxPremium - minPremium;
      if (range > 0) {
        score += ((maxPremium - quote.premium_quoted) / range) * 40;
      }
    }
    
    // Terms favorability (30% weight) - simplified
    if (quote.terms_conditions && quote.terms_conditions.length > 50) {
      score += 25;
    }
    
    // Coverage comprehensiveness (20% weight)
    const coverageLimitsCount = Object.keys(quote.coverage_limits || {}).length;
    score += Math.min(coverageLimitsCount * 5, 20);
    
    // Response timeliness (10% weight) - if response received
    if (quote.response_received) {
      score += 10;
    }
    
    return Math.round(score);
  };

  const handleAutoRate = () => {
    setQuotes(prev => prev.map(quote => ({
      ...quote,
      rating_score: calculateRatingScore(quote)
    })));
    
    toast({
      title: "Success",
      description: "Quotes auto-rated based on competitiveness and terms",
    });
  };

  const handleForwardToClient = () => {
    const receivedQuotes = quotes.filter(q => q.response_received && q.premium_quoted > 0);
    
    if (receivedQuotes.length === 0) {
      toast({
        title: "Error",
        description: "No valid quotes to forward to client",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const evaluatedQuotes = receivedQuotes.map(quote => ({
        ...quote,
        evaluated_at: new Date().toISOString(),
        rating_score: quote.rating_score || calculateRatingScore(quote),
      }));

      onEvaluationComplete(evaluatedQuotes);
      
      toast({
        title: "Success",
        description: `${evaluatedQuotes.length} quotes forwarded to client for selection`,
      });
    } catch (error) {
      console.error('Error forwarding quotes:', error);
      toast({
        title: "Error",
        description: "Failed to forward quotes to client",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getBestQuote = () => {
    const validQuotes = quotes.filter(q => q.response_received && q.premium_quoted > 0);
    return validQuotes.reduce((best, current) => 
      (current.rating_score || 0) > (best.rating_score || 0) ? current : best, 
      validQuotes[0]
    );
  };

  const bestQuote = getBestQuote();
  const receivedCount = quotes.filter(q => q.response_received).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quote Evaluation & Comparison
        </CardTitle>
        <p className="text-sm text-gray-600">
          Review and evaluate insurer responses ({receivedCount} of {quotes.length} received)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{quotes.length}</div>
              <div className="text-sm text-gray-600">Total Dispatched</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{receivedCount}</div>
              <div className="text-sm text-gray-600">Responses Received</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{quotes.length - receivedCount}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {bestQuote ? bestQuote.rating_score || 0 : 0}
              </div>
              <div className="text-sm text-gray-600">Best Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleAutoRate}>
            <Star className="h-4 w-4 mr-2" />
            Auto-Rate All Quotes
          </Button>
        </div>

        {/* Quotes List */}
        <div className="space-y-4">
          {quotes.map((quote, index) => (
            <Card key={quote.insurer_id} className={`border ${quote.response_received ? 'border-green-500' : 'border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{quote.insurer_name}</CardTitle>
                    <p className="text-sm text-gray-600">Commission Split: {quote.commission_split}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {quote.response_received ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Response Received
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                    {quote.rating_score > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{quote.rating_score}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`premium-${index}`}>Premium Quoted (₦)</Label>
                    <Input
                      id={`premium-${index}`}
                      type="number"
                      value={quote.premium_quoted}
                      onChange={(e) => handleQuoteUpdate(index, 'premium_quoted', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`rating-${index}`}>Rating Score (0-100)</Label>
                    <Input
                      id={`rating-${index}`}
                      type="number"
                      min="0"
                      max="100"
                      value={quote.rating_score}
                      onChange={(e) => handleQuoteUpdate(index, 'rating_score', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`terms-${index}`}>Terms & Conditions</Label>
                  <Textarea
                    id={`terms-${index}`}
                    value={quote.terms_conditions}
                    onChange={(e) => handleQuoteUpdate(index, 'terms_conditions', e.target.value)}
                    placeholder="Enter terms and conditions offered..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`remarks-${index}`}>Evaluation Remarks</Label>
                  <Textarea
                    id={`remarks-${index}`}
                    value={quote.remarks}
                    onChange={(e) => handleQuoteUpdate(index, 'remarks', e.target.value)}
                    placeholder="Add evaluation notes..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label>Quote Document</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(index, file);
                      }}
                    />
                  </div>
                  
                  {quote.document_url && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleForwardToClient} disabled={loading || receivedCount === 0}>
            {loading ? "Processing..." : `Forward ${receivedCount} Quotes to Client`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
