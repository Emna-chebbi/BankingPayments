import React, { useState, useEffect } from 'react';
import { bankingAPI } from '../services/api';
import './TransactionHistory.css';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch transactions when component loads
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await bankingAPI.getTransactions();
      console.log('API Response:', response.data); // Debug log
      
      // Handle different response formats
      let transactionsData = [];
      
      if (Array.isArray(response.data)) {
        // If response is directly an array
        transactionsData = response.data;
      } else if (response.data.transactions && Array.isArray(response.data.transactions)) {
        // If response has transactions property
        transactionsData = response.data.transactions;
      } else if (Array.isArray(response.data)) {
        // If response.data is the array
        transactionsData = response.data;
      } else {
        console.warn('Unexpected API response format:', response.data);
        transactionsData = [];
      }
      
      setTransactions(transactionsData);
      setError('');
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions. Make sure your Spring Boot service is running on port 8082.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <h2>📊 Transaction History</h2>
      
      <button onClick={fetchTransactions} className="refresh-btn">
        🔄 Refresh
      </button>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {transactions.length === 0 && !error ? (
        <div className="no-transactions">
          <p>No transactions found.</p>
          <p>Make a payment first to see transactions here!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>From Account</th>
                <th>To Account</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td className="transaction-id">{tx.transactionId}</td>
                  <td className="amount">{tx.amount}</td>
                  <td className="currency">{tx.currency}</td>
                  <td className="from-account">{tx.fromAccount}</td>
                  <td className="to-account">{tx.toAccount}</td>
                  <td className={`status ${tx.status?.toLowerCase()}`}>
                    {tx.status}
                  </td>
                  <td className="timestamp">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="transaction-count">
            Total: {transactions.length} transactions
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;