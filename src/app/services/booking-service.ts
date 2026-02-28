import { supabase } from './supabase-client';

export interface Seat {
  id: string;
  theater_type: 'vip' | 'classic';
  row: string;
  seat_number: number;
  is_available: boolean;
  created_at: string;
}

export interface BookingData {
  name: string;
  phone: string;
  email?: string;
  theater_type: 'vip' | 'classic';
  seats: Array<{ row: string; seat_number: number }>;
  payment_method: string;
  receipt_url?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// Fetch available seats by type
export async function getAvailableSeats(theaterType: 'vip' | 'classic') {
  try {
    const { data, error } = await supabase
      .from('theater_seats')
      .select('*')
      .eq('theater_type', theaterType)
      .eq('is_available', true)
      .order('row', { ascending: true })
      .order('seat_number', { ascending: true });

    if (error) throw error;
    return data as Seat[];
  } catch (error) {
    console.error('[v0] Error fetching available seats:', error);
    return [];
  }
}

// Get seat layout (count per row)
export async function getSeatLayout(theaterType: 'vip' | 'classic') {
  try {
    const { data, error } = await supabase
      .from('theater_seats')
      .select('row, seat_number')
      .eq('theater_type', theaterType)
      .order('row', { ascending: true })
      .order('seat_number', { ascending: true });

    if (error) throw error;

    const layout: Record<string, number> = {};
    for (const seat of data) {
      layout[seat.row] = Math.max(layout[seat.row] || 0, seat.seat_number);
    }
    return layout;
  } catch (error) {
    console.error('[v0] Error fetching seat layout:', error);
    return {};
  }
}

// Get booked seats (unavailable)
export async function getBookedSeats(theaterType: 'vip' | 'classic') {
  try {
    const { data, error } = await supabase
      .from('theater_seats')
      .select('row, seat_number')
      .eq('theater_type', theaterType)
      .eq('is_available', false)
      .order('row', { ascending: true })
      .order('seat_number', { ascending: true });

    if (error) throw error;
    return data as Array<{ row: string; seat_number: number }>;
  } catch (error) {
    console.error('[v0] Error fetching booked seats:', error);
    return [];
  }
}

// Create a new booking
export async function createBooking(bookingData: Omit<BookingData, 'status'>) {
  try {
    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email || null,
        theater_type: bookingData.theater_type,
        payment_method: bookingData.payment_method,
        receipt_url: bookingData.receipt_url || null,
        status: 'completed',
        total_seats: bookingData.seats.length,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Create booking seats records
    const bookingSeatsData = bookingData.seats.map(seat => ({
      booking_id: booking.id,
      row: seat.row,
      seat_number: seat.seat_number,
      theater_type: bookingData.theater_type,
    }));

    const { error: seatsError } = await supabase
      .from('booking_seats')
      .insert(bookingSeatsData);

    if (seatsError) throw seatsError;

    // Mark seats as unavailable
    const seatIds = bookingData.seats.map(
      seat => `${bookingData.theater_type}-${seat.row}-${seat.seat_number}`
    );

    const { error: updateError } = await supabase
      .from('theater_seats')
      .update({ is_available: false })
      .in('id', seatIds);

    if (updateError) throw updateError;

    return booking;
  } catch (error) {
    console.error('[v0] Error creating booking:', error);
    throw error;
  }
}

// Get booking details
export async function getBooking(bookingId: string) {
  try {
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError) throw bookingError;

    const { data: seats, error: seatsError } = await supabase
      .from('booking_seats')
      .select('*')
      .eq('booking_id', bookingId)
      .order('row', { ascending: true })
      .order('seat_number', { ascending: true });

    if (seatsError) throw seatsError;

    return { ...booking, seats };
  } catch (error) {
    console.error('[v0] Error fetching booking:', error);
    return null;
  }
}
