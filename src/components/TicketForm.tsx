import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TicketFormProps {
  qrData?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TicketForm = ({ qrData, onSuccess, onCancel }: TicketFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    passenger_name: "",
    pnr: "",
    seat_coach: "",
    travel_date: "",
    travel_time: "",
    departure_location: "",
    arrival_location: "",
    ticket_type: "flight" as "flight" | "train",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("tickets").insert({
        user_id: user.id,
        qr_data: qrData,
        ...formData,
      });

      if (error) throw error;

      toast({
        title: "Ticket saved",
        description: "Your ticket has been successfully saved.",
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving ticket:", error);
      toast({
        title: "Error",
        description: "Failed to save ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passenger_name">Passenger Name *</Label>
              <Input
                id="passenger_name"
                value={formData.passenger_name}
                onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pnr">PNR/Booking Reference *</Label>
              <Input
                id="pnr"
                value={formData.pnr}
                onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket_type">Ticket Type</Label>
              <Select
                value={formData.ticket_type}
                onValueChange={(value: "flight" | "train") => 
                  setFormData({ ...formData, ticket_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seat_coach">Seat/Coach</Label>
              <Input
                id="seat_coach"
                value={formData.seat_coach}
                onChange={(e) => setFormData({ ...formData, seat_coach: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel_date">Travel Date</Label>
              <Input
                id="travel_date"
                type="date"
                value={formData.travel_date}
                onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel_time">Travel Time</Label>
              <Input
                id="travel_time"
                type="time"
                value={formData.travel_time}
                onChange={(e) => setFormData({ ...formData, travel_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departure_location">Departure</Label>
              <Input
                id="departure_location"
                value={formData.departure_location}
                onChange={(e) => setFormData({ ...formData, departure_location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival_location">Arrival</Label>
              <Input
                id="arrival_location"
                value={formData.arrival_location}
                onChange={(e) => setFormData({ ...formData, arrival_location: e.target.value })}
              />
            </div>
          </div>

          {qrData && (
            <div className="space-y-2">
              <Label htmlFor="qr_data">QR Code Data (Auto-detected)</Label>
              <Textarea
                id="qr_data"
                value={qrData}
                readOnly
                className="bg-muted"
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Ticket"}
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

export default TicketForm;