-- Seed VIP seats (7A + 8B + 8C = 23 seats)
INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available) VALUES
-- VIP Row A (7 seats)
('vip', 'A', 1, true),
('vip', 'A', 2, true),
('vip', 'A', 3, true),
('vip', 'A', 4, true),
('vip', 'A', 5, true),
('vip', 'A', 6, true),
('vip', 'A', 7, true),
-- VIP Row B (8 seats)
('vip', 'B', 1, true),
('vip', 'B', 2, true),
('vip', 'B', 3, true),
('vip', 'B', 4, true),
('vip', 'B', 5, true),
('vip', 'B', 6, true),
('vip', 'B', 7, true),
('vip', 'B', 8, true),
-- VIP Row C (8 seats)
('vip', 'C', 1, true),
('vip', 'C', 2, true),
('vip', 'C', 3, true),
('vip', 'C', 4, true),
('vip', 'C', 5, true),
('vip', 'C', 6, true),
('vip', 'C', 7, true),
('vip', 'C', 8, true);

-- Seed Classic seats (15A + 17B + 22C + 23D + 23E + 22F + 24G + 30H + 28I + 30J + 10K + 10L = 254 seats)
INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'A', i, true FROM generate_series(1, 15) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'B', i, true FROM generate_series(1, 17) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'C', i, true FROM generate_series(1, 22) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'D', i, true FROM generate_series(1, 23) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'E', i, true FROM generate_series(1, 23) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'F', i, true FROM generate_series(1, 22) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'G', i, true FROM generate_series(1, 24) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'H', i, true FROM generate_series(1, 30) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'I', i, true FROM generate_series(1, 28) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'J', i, true FROM generate_series(1, 30) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'K', i, true FROM generate_series(1, 10) i;

INSERT INTO theater_seats (ticket_type, row_letter, seat_number, is_available)
SELECT 'classic', 'L', i, true FROM generate_series(1, 10) i;
