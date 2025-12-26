import React, { useState } from 'react';
import { bankingAPI } from '../services/api';
import './PaymentForm.css';

const PaymentForm = () => {
  const [payment, setPayment] = useState({
    amount: '',
    currency: 'USD',
    fromAccount: '',
    toAccount: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🚀 Sending payment to Mule:', payment);
      
      if (!payment.amount || !payment.fromAccount || !payment.toAccount) {
        throw new Error('Please fill in all required fields');
      }

      if (parseFloat(payment.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // FIX: Remove .data - response IS the data
      const response = await bankingAPI.processPayment(payment);
      
      console.log('✅ Payment successful - Full response:', response);
      
      setResult(response); // ← FIX: Use response directly
      
      setPayment({
        amount: '',
        currency: 'USD',
        fromAccount: '',
        toAccount: ''
      });
      
      setTimeout(() => {
        window.dispatchEvent(new Event('transactionUpdated'));
      }, 1000);
      
    } catch (err) {
      console.error('❌ Payment failed:', err);
      
      // FIX: Handle fetch errors properly
      if (err.message && err.message.includes('HTTP error')) {
        setError('Server error. Please check if Mule and all services are running.');
      } else {
        setError(err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="payment-container">
      <h2>💳 Make a Payment</h2>
      <p className="payment-instructions">
       
      </p>
      
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="amount">
            Amount: <span className="required">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={payment.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            required
            min="1"
            step="0.01"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="currency">
            Currency: <span className="required">*</span>
          </label>
          <select 
            id="currency"
            name="currency" 
            value={payment.currency} 
            onChange={handleChange}
            disabled={loading}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="TND">TND (د.ت)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="fromAccount">
            From Account: <span className="required">*</span>
          </label>
          <input
            type="text"
            id="fromAccount"
            name="fromAccount"
            value={payment.fromAccount}
            onChange={handleChange}
            placeholder="e.g., ACC12345"
            required
            disabled={loading}
          />
          
        </div>
        
        <div className="form-group">
          <label htmlFor="toAccount">
            To Account: <span className="required">*</span>
          </label>
          <input
            type="text"
            id="toAccount"
            name="toAccount"
            value={payment.toAccount}
            onChange={handleChange}
            placeholder="e.g., ACC67890"
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              ⏳ Processing Payment...
            </>
          ) : (
            '🚀 Send Payment'
          )}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <div className="error-header">
            <span className="error-icon">❌</span>
            <strong>Payment Failed</strong>
          </div>
          <div className="error-details">{error}</div>
          <div className="error-tip">
            💡 Check that all services are running: Mule (8090), Spring Boot (8082-8084), ActiveMQ, MySQL
          </div>
        </div>
      )}

      {result && (
        <div className="success-result">
          <div className="success-header">
            <span className="success-icon">✅</span>
            <strong>Payment Processed!</strong>
          </div>
          <div className="result-details">
            <div className="result-item">
              <span className="result-label">Transaction ID:</span>
              <span className="result-value">{result.transactionId}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Status:</span>
              <span className={`result-value status-${result.status?.toLowerCase()}`}>
                {result.status}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">Amount:</span>
              <span className="result-value">
                {result.amount} {result.currency}
              </span>
            </div>
            {result.message && (
              <div className="result-item">
                <span className="result-label">Message:</span>
                <span className="result-value">{result.message}</span>
              </div>
            )}
          </div>
          <div className="success-note">
            ✅ Payment processed
            <br />
            ✅ Transaction saved
            <br />
            ✅ Check Socials for notifications
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;