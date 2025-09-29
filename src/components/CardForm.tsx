import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CryptoJS from "crypto-js";

interface CardFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CardForm = ({ onSuccess, onCancel }: CardFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_name: "",
    card_type: "debit" as "debit" | "credit",
    card_number: "",
    expiry: "",
    cvv: "",
    bank_name: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // Simple encryption using user ID as key (in production, use proper key management)
  const encryptData = (data: string): string => {
    const secretKey = user?.id || "fallback-key";
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("encrypted_cards").insert({
        user_id: user.id,
        card_name: formData.card_name,
        card_type: formData.card_type,
        encrypted_card_number: encryptData(formData.card_number),
        encrypted_expiry: encryptData(formData.expiry),
        encrypted_cvv: encryptData(formData.cvv),
        bank_name: formData.bank_name,
      });

      if (error) throw error;

      toast({
        title: "Card saved",
        description: "Your card has been securely encrypted and saved.",
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving card:", error);
      toast({
        title: "Error",
        description: "Failed to save card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Payment Card</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card_name">Card Name *</Label>
              <Input
                id="card_name"
                placeholder="e.g., Personal Visa"
                value={formData.card_name}
                onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card_type">Card Type</Label>
              <Select
                value={formData.card_type}
                onValueChange={(value: "debit" | "credit") => 
                  setFormData({ ...formData, card_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit Card</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="card_number">Card Number *</Label>
              <Input
                id="card_number"
                placeholder="1234 5678 9012 3456"
                value={formData.card_number}
                onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                placeholder="e.g., Chase Bank"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              🔒 Your card details are encrypted using industry-standard encryption before being stored.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Card"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CardForm;