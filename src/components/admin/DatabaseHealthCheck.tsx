
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDatabaseValidation } from "@/hooks/useDatabaseValidation";
import { AlertTriangle, CheckCircle, RefreshCw, Wrench } from "lucide-react";

export const DatabaseHealthCheck = () => {
  const {
    validationResults,
    isValidating,
    lastValidated,
    runValidation,
    fixIssues,
    getTotalIssues,
    hasIssues,
    getAllIssues
  } = useDatabaseValidation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Database Health Check
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            onClick={runValidation} 
            disabled={isValidating}
            size="sm"
          >
            {isValidating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Validation
              </>
            )}
          </Button>
          
          {hasIssues() && (
            <Button 
              onClick={fixIssues} 
              disabled={isValidating}
              variant="outline"
              size="sm"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Fix Issues
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {lastValidated && (
          <div className="text-sm text-gray-600">
            Last validated: {lastValidated.toLocaleString()}
          </div>
        )}

        {validationResults.quotes || validationResults.clients ? (
          <div className="space-y-4">
            {hasIssues() ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Found {getTotalIssues()} database integrity issues that need attention.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Database validation passed. No issues found.
                </AlertDescription>
              </Alert>
            )}

            {/* Quotes Table Issues */}
            {validationResults.quotes && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  Quotes Table
                  <Badge variant={validationResults.quotes.isValid ? "secondary" : "destructive"}>
                    {validationResults.quotes.isValid ? "Valid" : "Issues Found"}
                  </Badge>
                </h4>
                
                {validationResults.quotes.orphanedRecords.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-orange-600">Orphaned Records:</p>
                    {validationResults.quotes.orphanedRecords.map((issue, index) => (
                      <p key={index} className="text-sm text-gray-600 ml-4">• {issue}</p>
                    ))}
                  </div>
                )}

                {validationResults.quotes.typeIssues.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-600">Type Issues:</p>
                    {validationResults.quotes.typeIssues.map((issue, index) => (
                      <p key={index} className="text-sm text-gray-600 ml-4">• {issue}</p>
                    ))}
                  </div>
                )}

                {validationResults.quotes.missingColumns.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-600">Missing Data:</p>
                    {validationResults.quotes.missingColumns.map((issue, index) => (
                      <p key={index} className="text-sm text-gray-600 ml-4">• {issue}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Clients Table Issues */}
            {validationResults.clients && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  Clients Table
                  <Badge variant={validationResults.clients.isValid ? "secondary" : "destructive"}>
                    {validationResults.clients.isValid ? "Valid" : "Issues Found"}
                  </Badge>
                </h4>
                
                {validationResults.clients.missingColumns.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-600">Missing Data:</p>
                    {validationResults.clients.missingColumns.map((issue, index) => (
                      <p key={index} className="text-sm text-gray-600 ml-4">• {issue}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Click "Run Validation" to check database health
          </div>
        )}
      </CardContent>
    </Card>
  );
};
