import { ShoppingCart, Shield, X, CreditCard, Lock } from 'lucide-react'

export default function CheckoutModal({ material, onConfirm, onCancel, loading }) {
  const isFree = parseFloat(material.price) === 0

  return (
    <div className="checkout-modal-overlay" onClick={onCancel}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="checkout-modal__header">
          <h2>{isFree ? 'Enroll for Free' : 'Complete Purchase'}</h2>
          <button className="checkout-modal__close" onClick={onCancel} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Material Preview */}
        <div className="checkout-modal__material">
          <div className="checkout-modal__thumb">
            {material.thumbnail_url ? (
              <img src={material.thumbnail_url} alt={material.title} />
            ) : (
              <div className="checkout-modal__thumb-placeholder">
                <ShoppingCart size={32} />
              </div>
            )}
          </div>
          <div className="checkout-modal__material-info">
            <h3>{material.title}</h3>
            <span className="checkout-modal__type-badge">{material.type}</span>
            {material.author_name && (
              <p>by {material.author_name}</p>
            )}
          </div>
        </div>

        {/* Price Summary */}
        <div className="checkout-modal__summary">
          <div className="checkout-modal__summary-row">
            <span>Material Price</span>
            <span>{isFree ? 'Free' : `₹${Number(material.price).toFixed(2)}`}</span>
          </div>
          {!isFree && (
            <div className="checkout-modal__summary-row">
              <span>GST / Tax</span>
              <span>Included</span>
            </div>
          )}
          <div className="checkout-modal__summary-divider" />
          <div className="checkout-modal__summary-row checkout-modal__summary-total">
            <span>Total</span>
            <span className="checkout-modal__price">
              {isFree ? 'Free' : `₹${Number(material.price).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Trust badges */}
        {!isFree && (
          <div className="checkout-modal__trust">
            <div className="checkout-modal__trust-item">
              <Lock size={14} />
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="checkout-modal__trust-item">
              <CreditCard size={14} />
              <span>Powered by Razorpay</span>
            </div>
            <div className="checkout-modal__trust-item">
              <Shield size={14} />
              <span>Secure Payment</span>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="checkout-modal__actions">
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary checkout-modal__pay-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="checkout-modal__spinner" />
                Processing…
              </>
            ) : isFree ? (
              'Enroll Now'
            ) : (
              <>
                <CreditCard size={16} />
                Pay ₹{Number(material.price).toFixed(2)}
              </>
            )}
          </button>
        </div>

        {!isFree && (
          <p className="checkout-modal__note">
            You'll be redirected to Razorpay's secure payment page.
          </p>
        )}
      </div>
    </div>
  )
}
