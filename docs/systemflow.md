# Scander System Flow

## Complete Restaurant Workflow


Customer enters restaurant

↓

Customer sits at assigned table

↓

Customer scans QR code on the table

↓

System identifies:

- Restaurant
- Table number

↓

Create Table Session

↓

Customer views digital menu

↓

Customer selects food and drinks

↓

Customer adds items to cart

↓

Customer confirms order

↓

System creates order

↓

Kitchen receives order

↓

Kitchen staff prepares food

↓

Kitchen updates order status


Order Status Flow:

Pending

↓

Accepted

↓

Preparing

↓

Ready

↓

Served


↓

Customer receives food

↓

Customer requests payment

↓

Payment process starts

↓

Payment completed

↓

Receipt generated

↓

Table session closed


---

# QR Code Flow

Each restaurant table has a unique QR code.

Example:

Table:

T01


QR URL:

scander.com/table/T01


When the customer scans the QR code:

1. The system identifies the restaurant
2. The system identifies the table number
3. A table session is created
4. The customer can access the menu


---

# Order Flow

Example:

Customer at Table T01:

Order:

- Seafood Pizza x1
- Iced Latte x2


System creates:

Order #1001

Connected with:

- Table Session
- Order Items
- Menu Items


---

# Kitchen Flow


New Order

↓

Kitchen Staff Accepts Order

↓

Food Preparation

↓

Update Status

↓

Customer receives real-time update


---

# Payment Flow


Customer requests payment

↓

Payment record created

↓

Customer selects payment method

Examples:

- Cash
- KHQR


↓

Payment confirmed

↓

Receipt generated

↓

Order completed