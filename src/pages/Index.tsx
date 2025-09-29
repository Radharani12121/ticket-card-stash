import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, CreditCard, Receipt, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Ticket & Card Stash</h1>
          <p className="text-sm text-muted-foreground">Your travel documents and cards, organized</p>
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
              Tickets
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Bills
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Travel Tickets</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Ticket
              </Button>
            </div>
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tickets yet</p>
                <p className="text-sm text-muted-foreground">Scan a QR code or upload a ticket to get started</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Saved Cards</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Card
              </Button>
            </div>
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No cards saved</p>
                <p className="text-sm text-muted-foreground">Add your debit or credit cards for secure storage</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bills & Receipts</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Bill
              </Button>
            </div>
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bills uploaded</p>
                <p className="text-sm text-muted-foreground">Upload your bills and receipts to keep them organized</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
