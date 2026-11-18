import Icon from '../common/Icon';
import { cardBrand, formatCardNumber, formatExpiry, digitsOnly } from '../../utils/card';

const brandLabel = { VISA: 'Visa', MASTERCARD: 'Mastercard' };

export default function PaymentOptions({ method, onMethodChange, card, onCardChange, errors, total, disabled }) {
  const brand = cardBrand(card.number);
  const update = (field, value) => onCardChange({ ...card, [field]: value });

  return <fieldset className="payment-options" disabled={disabled}>
    <legend>How would you like to pay?</legend>
    <div className="payment-choices">
      <label className={`payment-choice${method === 'COUNTER' ? ' selected' : ''}`}>
        <input type="radio" name="payment-method" value="COUNTER" checked={method === 'COUNTER'} onChange={() => onMethodChange('COUNTER')}/>
        <span className="payment-choice-icon"><Icon name="bag" size={22}/></span>
        <span><strong>Pay at the counter</strong><small>Pay with cash or card after your meal.</small></span>
      </label>
      <label className={`payment-choice${method === 'CARD' ? ' selected' : ''}`}>
        <input type="radio" name="payment-method" value="CARD" checked={method === 'CARD'} onChange={() => onMethodChange('CARD')}/>
        <span className="payment-choice-icon payment-card-icon" aria-hidden="true">VISA</span>
        <span><strong>Pay now by card</strong><small>Visa or Mastercard, ${total.toFixed(2)} charged now.</small></span>
      </label>
    </div>

    {method === 'CARD' && <div className="card-form">
      <p className="card-demo-note" role="note"><strong>Demo mode:</strong> no money is charged. Try card 4242 4242 4242 4242, any future expiry and any 3-digit CVC.</p>
      <label className="card-field card-field-full">
        <span>Name on card</span>
        <input autoComplete="cc-name" value={card.name} onChange={event => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'card-name-error' : undefined}/>
        {errors.name && <small id="card-name-error" className="card-error">{errors.name}</small>}
      </label>
      <label className="card-field card-field-full">
        <span>Card number</span>
        <span className="card-number-input">
          <input inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={card.number}
            onChange={event => update('number', formatCardNumber(event.target.value))} aria-invalid={Boolean(errors.number)} aria-describedby={errors.number ? 'card-number-error' : undefined}/>
          {brand && <span className="card-brand-tag">{brandLabel[brand]}</span>}
        </span>
        {errors.number && <small id="card-number-error" className="card-error">{errors.number}</small>}
      </label>
      <label className="card-field">
        <span>Expiry</span>
        <input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry}
          onChange={event => update('expiry', formatExpiry(event.target.value))} aria-invalid={Boolean(errors.expiry)} aria-describedby={errors.expiry ? 'card-expiry-error' : undefined}/>
        {errors.expiry && <small id="card-expiry-error" className="card-error">{errors.expiry}</small>}
      </label>
      <label className="card-field">
        <span>CVC</span>
        <input inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc}
          onChange={event => update('cvc', digitsOnly(event.target.value).slice(0, 3))} aria-invalid={Boolean(errors.cvc)} aria-describedby={errors.cvc ? 'card-cvc-error' : undefined}/>
        {errors.cvc && <small id="card-cvc-error" className="card-error">{errors.cvc}</small>}
      </label>
      <p className="card-secure-note"><Icon name="lock" size={15}/> Only the card type and last 4 digits are saved with your order.</p>
    </div>}
  </fieldset>;
}
