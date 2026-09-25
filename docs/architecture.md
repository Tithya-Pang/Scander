# Scander System Architecture


## High-Level Architecture


                     Customer Web

                           |

                           |

                    Backend API

                           |

        -----------------------------------

        |              |                 |

      Auth          Menu              Order

        |              |                 |

        |              |                 |

                  PostgreSQL Database


        -----------------------------------

                 |                    |

                 |                    |

        Kitchen Dashboard     Admin Dashboard



---

# Frontend Architecture


Scander contains three web applications:


## 1. Customer Web

Purpose:

Customer ordering interface.


Features:

- QR access
- Digital menu
- Cart
- Order placement
- Order tracking


Technology:

- React
- Responsive design


---

## 2. Kitchen Dashboard

Purpose:

Restaurant operation management.


Features:

- Staff login
- View incoming orders
- Update order status
- Monitor preparation process


Technology:

- React
- Desktop/tablet responsive


---

## 3. Admin Dashboard

Purpose:

Restaurant management.


Features:

- Menu management
- Category management
- Table management
- Payment monitoring
- Reports


Technology:

- React


---

# Backend Architecture


The backend follows a modular architecture.


Backend Modules:


## Authentication Module

Responsible for:

- Staff login
- User roles
- Authorization


## Menu Module

Responsible for:

- Categories
- Menu items
- Menu variants


## Order Module

Responsible for:

- Table sessions
- Orders
- Order items
- Order status


## Payment Module

Responsible for:

- Payment processing
- Receipt generation



---

# Database Architecture


Main entities:


Restaurant

|

Restaurant Table

|

Table Session

|

Orders

|

Order Items

|

Menu Items

|

Category


Additional modules:


Orders

|

Payment

|

Receipt


Users

|

Admin / Kitchen Staff / Cashier