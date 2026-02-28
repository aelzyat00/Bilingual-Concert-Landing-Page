/**
 * Advanced ticket PDF generator for individual seats
 * Creates one PDF per seat with unique barcode and seat information
 */

export interface TicketInfo {
  bookingId: string;
  guestName: string;
  ticketType: 'vip' | 'classic';
  row: string;
  seatNumber: number;
  eventName: string;
  eventDate: string;
  ticketPrice: string;
}

const COLORS = {
  vip: { accent: '#C6A04C', secondary: '#D4AF37', dark: '#1A1A1A' },
  classic: { accent: '#A8382A', secondary: '#C6A04C', dark: '#0D0D0D' },
};

function generateTicketBarcode(bookingId: string, row: string, seatNumber: number): string {
  const barcodeData = `${bookingId}-${row}${seatNumber}`;
  let barcode = '';
  for (let i = 0; i < barcodeData.length; i++) {
    const charCode = barcodeData.charCodeAt(i);
    const binary = charCode.toString(2).padStart(8, '0');
    for (let j = 0; j < binary.length; j++) {
      barcode += binary[j] === '0' ? '█' : '░';
    }
  }
  return barcode;
}

export async function generateIndividualTicket(ticketInfo: TicketInfo): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpi = 2;
    canvas.width = 960 * dpi;
    canvas.height = 540 * dpi;
    ctx.scale(dpi, dpi);

    const colors = COLORS[ticketInfo.ticketType];

    // Background
    ctx.fillStyle = colors.dark;
    ctx.fillRect(0, 0, 960, 540);

    // Top accent bar
    ctx.fillStyle = colors.accent;
    ctx.fillRect(0, 0, 960, 12);

    // Secondary bar
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(0, 12, 960, 3);

    // Main border
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(25, 25, 910, 490);

    // Left accent stripe
    ctx.fillStyle = colors.accent;
    ctx.fillRect(25, 25, 10, 490);

    // Title section
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎬 CINEMA EVENT 2026', 480, 70);

    // Ticket type badge
    ctx.fillStyle = colors.secondary;
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText(`${ticketInfo.ticketType.toUpperCase()} TICKET`, 480, 105);

    // Horizontal divider
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(60, 125);
    ctx.lineTo(900, 125);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left column - Guest & Booking info
    ctx.fillStyle = '#AAAAAA';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('GUEST NAME', 60, 160);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText(ticketInfo.guestName.toUpperCase(), 60, 185);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.fillText('BOOKING ID', 60, 225);

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 14px Courier, monospace';
    ctx.fillText(ticketInfo.bookingId, 60, 248);

    // Center column - Seat & Event info
    ctx.fillStyle = '#AAAAAA';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SEAT LOCATION', 480, 160);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.fillText(`${ticketInfo.row}${ticketInfo.seatNumber}`, 480, 210);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.fillText('EVENT DATE', 480, 260);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText(ticketInfo.eventDate, 480, 280);

    // Right column - Price & Info
    ctx.fillStyle = '#AAAAAA';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('TICKET PRICE', 900, 160);

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(ticketInfo.ticketPrice, 900, 185);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.fillText('VALID FOR ONE ENTRY', 900, 225);

    // Barcode section
    ctx.fillStyle = '#AAAAAA';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BARCODE', 480, 320);

    const barcode = generateTicketBarcode(ticketInfo.bookingId, ticketInfo.row, ticketInfo.seatNumber);
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 10px Courier, monospace';
    ctx.fillText(barcode.substring(0, 50), 480, 345);

    // Footer section
    ctx.fillStyle = '#555555';
    ctx.font = '9px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Present this ticket at cinema entrance with valid ID', 480, 500);

    // Ticket verification code
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '8px Arial, sans-serif';
    ctx.fillText(`Ticket ID: ${ticketInfo.bookingId}-${ticketInfo.row}${ticketInfo.seatNumber}`, 480, 520);

    canvas.toBlob(
      blob => resolve(blob || new Blob()),
      'image/png',
      0.95
    );
  });
}

export async function downloadMultipleTickets(tickets: TicketInfo[]): Promise<void> {
  for (const ticket of tickets) {
    const blob = await generateIndividualTicket(ticket);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ticket-${ticket.bookingId}-${ticket.row}${ticket.seatNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

export async function downloadSingleTicket(ticket: TicketInfo): Promise<void> {
  const blob = await generateIndividualTicket(ticket);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Ticket-${ticket.bookingId}-${ticket.row}${ticket.seatNumber}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
