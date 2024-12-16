/**
 * 1. after successful login: generate a jwt token
 * npm i jsonwebtoken, cookie-parser
 * jwt.sign(payload, secret, {expiresIn: '1h})
 * 
 * 
 * 2. send token (generated in the server side) to the client side 
 * localstorage---> easier
 * httpOnly cookies---> better
 * 
 * 
 * 3.for sensitive or secure or private: send token to the server side
 * 
 * on the server side:
 * app.use(cors({
   origin: ['http://localhost:5173'],
   credentials: true
 }));



 in the client side:
 
 * 
 * 4.validate the token in the server side:
 * if valid: provide data
 * if not valid: logout
 */