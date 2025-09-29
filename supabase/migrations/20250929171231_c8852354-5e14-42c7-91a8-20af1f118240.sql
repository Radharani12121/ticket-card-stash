-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  passenger_name TEXT NOT NULL,
  pnr TEXT NOT NULL,
  seat_coach TEXT,
  travel_date DATE,
  travel_time TIME,
  departure_location TEXT,
  arrival_location TEXT,
  ticket_type TEXT CHECK (ticket_type IN ('flight', 'train')),
  qr_data TEXT,
  ticket_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create encrypted_cards table for secure card storage
CREATE TABLE public.encrypted_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_name TEXT NOT NULL,
  card_type TEXT CHECK (card_type IN ('debit', 'credit')),
  encrypted_card_number TEXT NOT NULL,
  encrypted_expiry TEXT NOT NULL,
  encrypted_cvv TEXT NOT NULL,
  bank_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bill_name TEXT NOT NULL,
  bill_type TEXT,
  amount DECIMAL(10,2),
  bill_date DATE,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('image', 'pdf')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name) VALUES ('ticket-images', 'ticket-images');
INSERT INTO storage.buckets (id, name) VALUES ('bills', 'bills');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Tickets policies
CREATE POLICY "Users can view their own tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tickets" ON public.tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tickets" ON public.tickets FOR DELETE USING (auth.uid() = user_id);

-- Cards policies
CREATE POLICY "Users can view their own cards" ON public.encrypted_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cards" ON public.encrypted_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cards" ON public.encrypted_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cards" ON public.encrypted_cards FOR DELETE USING (auth.uid() = user_id);

-- Bills policies
CREATE POLICY "Users can view their own bills" ON public.bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bills" ON public.bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bills" ON public.bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bills" ON public.bills FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for ticket images
CREATE POLICY "Users can view their own ticket images" ON storage.objects FOR SELECT USING (bucket_id = 'ticket-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own ticket images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ticket-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own ticket images" ON storage.objects FOR UPDATE USING (bucket_id = 'ticket-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own ticket images" ON storage.objects FOR DELETE USING (bucket_id = 'ticket-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for bills
CREATE POLICY "Users can view their own bills storage" ON storage.objects FOR SELECT USING (bucket_id = 'bills' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own bills storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bills' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own bills storage" ON storage.objects FOR UPDATE USING (bucket_id = 'bills' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own bills storage" ON storage.objects FOR DELETE USING (bucket_id = 'bills' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.encrypted_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();