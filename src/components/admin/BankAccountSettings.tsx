import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BankAccount {
  id?: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  is_default: boolean;
}

export const BankAccountSettings = () => {
  const { organizationId } = useAuth();
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newAccount, setNewAccount] = useState<BankAccount>({
    account_name: '',
    account_number: '',
    bank_name: '',
    bank_code: '',
    is_default: false
  });

  useEffect(() => {
    loadBankAccounts();
  }, [organizationId]);

  const loadBankAccounts = async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('bank_details')
        .eq('id', organizationId)
        .single();

      if (error) throw error;

      const accounts = Array.isArray(data.bank_details) ? data.bank_details : [];
      setBankAccounts(accounts.map((acc: any, index) => ({ 
        account_name: acc.account_name || '',
        account_number: acc.account_number || '',
        bank_name: acc.bank_name || '',
        bank_code: acc.bank_code || '',
        is_default: acc.is_default || false,
        id: index.toString() 
      })));
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load bank account settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBankAccounts = async (accounts: BankAccount[]) => {
    if (!organizationId) return;

    setSaving(true);
    try {
      const accountsToSave = accounts.map(acc => ({
        account_name: acc.account_name,
        account_number: acc.account_number,
        bank_name: acc.bank_name,
        bank_code: acc.bank_code,
        is_default: acc.is_default
      }));

      const { error } = await supabase
        .from('organizations')
        .update({ bank_details: accountsToSave })
        .eq('id', organizationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bank account settings saved successfully"
      });

      loadBankAccounts();
    } catch (error) {
      console.error('Error saving bank accounts:', error);
      toast({
        title: "Error",
        description: "Failed to save bank account settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddAccount = () => {
    if (!newAccount.account_name || !newAccount.account_number || !newAccount.bank_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedAccounts = [...bankAccounts, { ...newAccount, id: Date.now().toString() }];
    
    // If this is the first account or marked as default, make it default
    if (updatedAccounts.length === 1 || newAccount.is_default) {
      updatedAccounts.forEach((acc, index) => {
        acc.is_default = index === updatedAccounts.length - 1;
      });
    }

    setBankAccounts(updatedAccounts);
    saveBankAccounts(updatedAccounts);

    // Reset form
    setNewAccount({
      account_name: '',
      account_number: '',
      bank_name: '',
      bank_code: '',
      is_default: false
    });
  };

  const handleRemoveAccount = (accountId: string) => {
    const updatedAccounts = bankAccounts.filter(acc => acc.id !== accountId);
    
    // If we removed the default account, make the first one default
    if (updatedAccounts.length > 0 && !updatedAccounts.some(acc => acc.is_default)) {
      updatedAccounts[0].is_default = true;
    }

    setBankAccounts(updatedAccounts);
    saveBankAccounts(updatedAccounts);
  };

  const handleSetDefault = (accountId: string) => {
    const updatedAccounts = bankAccounts.map(acc => ({
      ...acc,
      is_default: acc.id === accountId
    }));

    setBankAccounts(updatedAccounts);
    saveBankAccounts(updatedAccounts);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bank Account Settings</CardTitle>
          <p className="text-sm text-gray-600">
            Configure bank accounts for client payments. Clients will see these options during payment.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Accounts */}
          {bankAccounts.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Configured Bank Accounts</h4>
              {bankAccounts.map((account) => (
                <div key={account.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{account.account_name}</h5>
                      {account.is_default && (
                        <Badge className="bg-green-600">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!account.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(account.id!)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAccount(account.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Bank:</strong> {account.bank_name}</div>
                    <div><strong>Account Number:</strong> {account.account_number}</div>
                    {account.bank_code && (
                      <div><strong>Bank Code:</strong> {account.bank_code}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Account */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Add New Bank Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name *</Label>
                <Input
                  id="account_name"
                  value={newAccount.account_name}
                  onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                  placeholder="e.g., NaijaBroker Pro Limited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number *</Label>
                <Input
                  id="account_number"
                  value={newAccount.account_number}
                  onChange={(e) => setNewAccount({...newAccount, account_number: e.target.value})}
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input
                  id="bank_name"
                  value={newAccount.bank_name}
                  onChange={(e) => setNewAccount({...newAccount, bank_name: e.target.value})}
                  placeholder="First Bank of Nigeria"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_code">Bank Code (Optional)</Label>
                <Input
                  id="bank_code"
                  value={newAccount.bank_code}
                  onChange={(e) => setNewAccount({...newAccount, bank_code: e.target.value})}
                  placeholder="011"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="is_default"
                checked={newAccount.is_default}
                onCheckedChange={(checked) => setNewAccount({...newAccount, is_default: checked})}
              />
              <Label htmlFor="is_default">Set as default account</Label>
            </div>

            <Button onClick={handleAddAccount} disabled={saving} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
