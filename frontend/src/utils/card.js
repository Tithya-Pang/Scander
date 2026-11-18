// Demo card checks run in the browser only. Full card numbers, expiry dates and CVCs are never sent or stored.
export const digitsOnly = value => value.replace(/\D/g, '');

export function cardBrand(number) {
  const digits = digitsOnly(number);
  if (/^4/.test(digits)) return 'VISA';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'MASTERCARD';
  return null;
}

export function passesLuhn(number) {
  const digits = digitsOnly(number);
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  return digits.length > 0 && sum % 10 === 0;
}

export const formatCardNumber = value => digitsOnly(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function validateCard({ name, number, expiry, cvc }, now = new Date()) {
  const errors = {};
  const digits = digitsOnly(number);
  if (!name.trim()) errors.name = 'Enter the name on the card.';
  if (digits.length !== 16 || !passesLuhn(digits)) errors.number = 'Enter a valid 16-digit card number.';
  else if (!cardBrand(digits)) errors.number = 'We accept Visa and Mastercard.';
  const [, month, year] = expiry.match(/^(\d{2})\/(\d{2})$/) || [];
  if (!month || Number(month) < 1 || Number(month) > 12) errors.expiry = 'Use MM/YY.';
  else if (new Date(2000 + Number(year), Number(month)) <= now) errors.expiry = 'This card has expired.';
  if (!/^\d{3}$/.test(cvc)) errors.cvc = 'Enter the 3-digit CVC.';
  return errors;
}
