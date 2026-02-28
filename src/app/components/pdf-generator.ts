/**
 * Professional ticket generator using canvas
 * Creates high-quality ticket images that users can download
 */

export interface TicketData {
  name: string;
  seats: { row: string; number: number }[];
  ticketType: 'vip' | 'classic';
  bookingId: string;
  eventName: string;
  price: string;
  ticketCount: number;
}

const COLORS = {
  vip: { accent: '#C6A04C', secondary: '#D4AF37' },
  classic: { accent: '#A8382A', secondary: '#C6A04C' },
};

function generateBarcode(text: string): string {
  // Generate a simple visual barcode pattern
  let barcode = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const binary = charCode.toString(2).padStart(8, '0');
    for (let j = 0; j < binary.length; j++) {
      barcode += binary[j] === '0' ? '|' : '::';
    }
    barcode += ' ';
  }
  return barcode.substring(0, 40);
}

export async function generatePDF(data: TicketData): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // High DPI for better quality
  const dpi = 2;
  canvas.width = 900 * dpi;
  canvas.height = 500 * dpi;
  ctx.scale(dpi, dpi);

  const colors = COLORS[data.ticketType];

  // Background with gradient effect (simulated)
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, 900, 500);

  // Decorative top bar
  ctx.fillStyle = colors.accent;
  ctx.fillRect(0, 0, 900, 8);

  // Secondary accent line
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(0, 8, 900, 2);

  // Ticket border
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 860, 460);

  // Left side accent stripe
  ctx.fillStyle = colors.accent;
  ctx.fillRect(20, 20, 8, 460);

  // Title section
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CINEMA EVENT 2026', 450, 60);

  // Ticket type badge
  ctx.fillStyle = colors.secondary;
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText(`${data.ticketType.toUpperCase()} TICKET`, 450, 90);

  // Divider line
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 110);
  ctx.lineTo(840, 110);
  ctx.stroke();

  // Content section
  ctx.fillStyle = '#E0E0E0';
  ctx.font = '11px Arial, sans-serif';
  ctx.textAlign = 'left';

  let yPos = 140;
  const labelWidth = 150;
  const lineHeight = 28;

  // Guest name
  ctx.fillStyle = '#AAAAAA';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('GUEST NAME', 60, yPos);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText(data.name.toUpperCase(), 60, yPos + 18);

  // Booking ID
  yPos += lineHeight + 10;
  ctx.fillStyle = '#AAAAAA';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('BOOKING ID', 60, yPos);
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 12px Courier, monospace';
  ctx.fillText(data.bookingId, 60, yPos + 18);

  // Seats
  yPos += lineHeight + 10;
  ctx.fillStyle = '#AAAAAA';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('SEATS', 60, yPos);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '14px Arial, sans-serif';
  const seatsText = data.seats.map(s => `${s.row}${s.number}`).join(' · ');
  ctx.fillText(seatsText, 60, yPos + 18);

  // Price
  yPos += lineHeight + 10;
  ctx.fillStyle = '#AAAAAA';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('PRICE', 60, yPos);
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(data.price, 60, yPos + 18);

  // Barcode section
  ctx.fillStyle = '#AAAAAA';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BARCODE', 700, 140);

  ctx.fillStyle = '#666666';
  ctx.font = 'bold 12px Courier, monospace';
  const barcodeText = generateBarcode(data.bookingId);
  ctx.fillText(barcodeText, 700, 170);

  // Footer
  ctx.fillStyle = '#555555';
  ctx.font = '9px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Present this ticket at the cinema entrance', 450, 460);

  // Download as PNG
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinema-ticket-${data.bookingId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png', 0.95);
}

export async function generateMultiplePDFs(tickets: TicketData[]): Promise<void> {
  for (const ticket of tickets) {
    await generatePDF(ticket);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
