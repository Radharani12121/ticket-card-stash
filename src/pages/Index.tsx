import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, CreditCard, Receipt, Plus, Search, LogOut, Camera, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QRScannerComponent from "@/components/QRScanner";
import TicketForm from "@/components/TicketForm";
import CardForm from "@/components/CardForm";
import BillForm from "@/components/BillForm";
import CryptoJS from "crypto-js";

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [qrData, setQrData] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [ticketsRes, cardsRes, billsRes] = await Promise.all([
        supabase.from("tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("encrypted_cards").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("bills").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      ]);

      if (ticketsRes.data) setTickets(ticketsRes.data);
      if (cardsRes.data) setCards(cardsRes.data);
      if (billsRes.data) setBills(billsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const decryptData = (encryptedData: string): string => {
    try {
      const secretKey = user?.id || "fallback-key";
      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return "***";
    }
  };

  const handleQRScan = (result: string) => {
    setQrData(result);
    setShowScanner(false);
    setShowTicketForm(true);
    toast({
      title: "QR Code Scanned",
      description: "Please fill in the ticket details below.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const toggleCardDetails = (cardId: string) => {
    setShowCardDetails(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.departure_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.arrival_location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCards = cards.filter(card =>
    card.card_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBills = bills.filter(bill =>
    bill.bill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.bill_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showScanner) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <QRScannerComponent onScanResult={handleQRScan} onClose={() => setShowScanner(false)} />
      </div>
    );
  }

  if (showTicketForm) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <TicketForm
          qrData={qrData}
          onSuccess={() => {
            setShowTicketForm(false);
            setQrData("");
            loadData();
          }}
          onCancel={() => {
            setShowTicketForm(false);
            setQrData("");
          }}
        />
      </div>
    );
  }

  if (showCardForm) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <CardForm
          onSuccess={() => {
            setShowCardForm(false);
            loadData();
          }}
          onCancel={() => setShowCardForm(false)}
        />
      </div>
    );
  }

  if (showBillForm) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <BillForm
          onSuccess={() => {
            setShowBillForm(false);
            loadData();
          }}
          onCancel={() => setShowBillForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ticket & Card Stash</h1>
            <p className="text-sm text-muted-foreground">Your travel documents and cards, organized</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets, cards, or bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Tickets ({tickets.length})
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cards ({cards.length})
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Bills ({bills.length})
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Travel Tickets</h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowScanner(true)} className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Scan QR
                </Button>
                <Button onClick={() => setShowTicketForm(true)} variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Manual
                </Button>
              </div>
            </div>
            
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            ) : filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tickets yet</p>
                  <p className="text-sm text-muted-foreground">Scan a QR code or add manually to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredTickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{ticket.passenger_name}</span>
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                          {ticket.ticket_type}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">PNR:</span> {ticket.pnr}
                        </div>
                        {ticket.seat_coach && (
                          <div>
                            <span className="font-medium">Seat:</span> {ticket.seat_coach}
                          </div>
                        )}
                        {ticket.travel_date && (
                          <div>
                            <span className="font-medium">Date:</span> {ticket.travel_date}
                          </div>
                        )}
                        {ticket.travel_time && (
                          <div>
                            <span className="font-medium">Time:</span> {ticket.travel_time}
                          </div>
                        )}
                        {ticket.departure_location && (
                          <div>
                            <span className="font-medium">From:</span> {ticket.departure_location}
                          </div>
                        )}
                        {ticket.arrival_location && (
                          <div>
                            <span className="font-medium">To:</span> {ticket.arrival_location}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Saved Cards</h2>
              <Button onClick={() => setShowCardForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Card
              </Button>
            </div>
            
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            ) : filteredCards.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No cards saved</p>
                  <p className="text-sm text-muted-foreground">Add your debit or credit cards for secure storage</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredCards.map((card) => (
                  <Card key={card.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{card.card_name}</span>
                        <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {card.card_type}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {card.bank_name && (
                          <div className="text-sm">
                            <span className="font-medium">Bank:</span> {card.bank_name}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium">Card Number:</span>{" "}
                            {showCardDetails[card.id] 
                              ? decryptData(card.encrypted_card_number)
                              : "**** **** **** ****"
                            }
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardDetails(card.id)}
                          >
                            {showCardDetails[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {showCardDetails[card.id] && (
                          <>
                            <div className="text-sm">
                              <span className="font-medium">Expiry:</span> {decryptData(card.encrypted_expiry)}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">CVV:</span> {decryptData(card.encrypted_cvv)}
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bills & Receipts</h2>
              <Button onClick={() => setShowBillForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Bill
              </Button>
            </div>
            
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            ) : filteredBills.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                  <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No bills uploaded</p>
                  <p className="text-sm text-muted-foreground">Upload your bills and receipts to keep them organized</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredBills.map((bill) => (
                  <Card key={bill.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{bill.bill_name}</span>
                        {bill.amount && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            ${bill.amount}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-sm">
                          {bill.bill_type && (
                            <div>
                              <span className="font-medium">Type:</span> {bill.bill_type}
                            </div>
                          )}
                          {bill.bill_date && (
                            <div>
                              <span className="font-medium">Date:</span> {bill.bill_date}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Format:</span> {bill.file_type}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(bill.file_url, '_blank')}
                        >
                          View File
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
