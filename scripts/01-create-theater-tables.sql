-- Create theater_seats table to store available seats for each ticket type
CREATE TABLE IF NOT EXISTS theater_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type VARCHAR(10) NOT NULL CHECK (ticket_type IN ('vip', 'classic')),
  row_letter VARCHAR(1) NOT NULL,
  seat_number INT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ticket_type, row_letter, seat_number)
);

-- Create bookings table to store booking transactions
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(20) PRIMARY KEY, -- e.g., RT123ABC
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  user_email VARCHAR(255),
  ticket_type VARCHAR(10) NOT NULL CHECK (ticket_type IN ('vip', 'classic')),
  total_seats INT NOT NULL,
  total_price DECIMAL(10, 2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed')),
  receipt_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create booking_seats table to track which seats are booked for each booking
CREATE TABLE IF NOT EXISTS booking_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id VARCHAR(20) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id UUID NOT NULL REFERENCES theater_seats(id),
  row_letter VARCHAR(1) NOT NULL,
  seat_number INT NOT NULL,
  pdf_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(booking_id, seat_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_theater_seats_type ON theater_seats(ticket_type);
CREATE INDEX IF NOT EXISTS idx_theater_seats_available ON theater_seats(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_booking_seats_booking_id ON booking_seats(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_seats_seat_id ON booking_seats(seat_id);

-- Enable RLS (Row Level Security)
ALTER TABLE theater_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_seats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow public read/write
CREATE POLICY "Allow public read theater_seats" ON theater_seats FOR SELECT USING (true);
CREATE POLICY "Allow public read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public read booking_seats" ON booking_seats FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert booking_seats" ON booking_seats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update theater_seats" ON theater_seats FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update bookings" ON bookings FOR UPDATE USING (true) WITH CHECK (true);
