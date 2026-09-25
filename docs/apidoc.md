# Scander API Documentation


# Authentication API


## Login Staff

POST

/auth/login


Request:

{
    "email": "staff@gmail.com",
    "password": "password"
}


Response:

{
    "token": "jwt_token",
    "role": "KITCHEN_STAFF"
}



---

# Menu API


## Get Menu

GET

/menu


Purpose:

Retrieve restaurant menu.


---

## Create Menu Item

POST

/menu


Used by:

Admin


---

## Update Menu Item

PUT

/menu/:id


---

## Delete Menu Item

DELETE

/menu/:id



---

# Order API


## Create Order

POST

/orders


Purpose:

Create customer order after QR ordering.



---

## Get Order Status

GET

/orders/:id


Purpose:

Customer tracks order progress.



---

## Update Order Status

PUT

/orders/:id/status


Used by:

Kitchen Staff



Example:

{
    "status":"PREPARING"
}



---

# Payment API


## Create Payment

POST

/payment


Purpose:

Create payment request.



---

## Update Payment Status

PUT

/payment/status


Example:

{
    "status":"PAID"
}



---

## Generate Receipt

GET

/receipt/:id