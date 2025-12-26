import React, { useState } from 'react';
import PaymentForm from './components/PaymentForm';
import TransactionHistory from './components/TransactionHistory';
import CurrencyInfo from './components/CurrencyInfo';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('payment');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏦 Banking Transaction System</h1>
        
        <nav className="navigation">
          <button 
            className={activeTab === 'payment' ? 'active' : ''}
            onClick={() => setActiveTab('payment')}
          >
            💳 Make Payment
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            📊 Transaction History
          </button>
          <button 
            className={activeTab === 'currency' ? 'active' : ''}
            onClick={() => setActiveTab('currency')}
          >
            💱 Currencies
          </button>
        </nav>
      </header>
      
      <main className="main-content">
        {activeTab === 'payment' && <PaymentForm />}
        {activeTab === 'currency' && <CurrencyInfo />}
        {activeTab === 'history' && <TransactionHistory />}
      </main>
    </div>
  );
}

export default App;