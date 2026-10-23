import { useState } from 'react';

export default function MenuCard({ item, onAdd }) {
  const [imageFailed, setImageFailed] = useState(false);

  return <article className="card menu-card">
    <div className="menu-image">
      {imageFailed ? <span className="muted">Photo unavailable</span> :
        <img src={item.image} alt={item.name} loading="lazy" decoding="async"
          style={{ objectPosition: item.imagePosition || 'center' }}
          onError={() => setImageFailed(true)} />}
    </div>
    <div className="menu-card-content">
      <h2>{item.name}</h2>
      <p className="muted">{item.description}</p>
      <div className="menu-bottom">
        <strong>${item.price.toFixed(2)}</strong>
        <button className="btn btn-primary btn-small" aria-label={`Add ${item.name}`} onClick={() => onAdd(item)}>Add +</button>
      </div>
    </div>
  </article>;
}
