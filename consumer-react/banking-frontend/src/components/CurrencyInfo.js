import React, { useState, useEffect } from 'react';
import './CurrencyInfo.css';

const CurrencyInfo = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // First, get all countries from the SOAP service
  const getAllCountries = async () => {
    try {
      const response = await fetch('/countries');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Additional validation
      if (!data.countries || data.countries.length === 0) {
        throw new Error('No countries returned from service');
      }
      
      console.log('Successfully fetched countries:', data.countries.length);
      return data.countries;
    } catch (err) {
      console.error('Failed to fetch countries, using fallback:', err);
      // Enhanced fallback with more countries
      return [
        { sISOCode: 'US', sName: 'United States' },
        { sISOCode: 'GB', sName: 'United Kingdom' },
        { sISOCode: 'TN', sName: 'Tunisia' },
        { sISOCode: 'FR', sName: 'France' },
        { sISOCode: 'CA', sName: 'Canada' },
        { sISOCode: 'DE', sName: 'Germany' },
        { sISOCode: 'JP', sName: 'Japan' },
        { sISOCode: 'AU', sName: 'Australia' },
        { sISOCode: 'CN', sName: 'China' },
        { sISOCode: 'IN', sName: 'India' },
        { sISOCode: 'BR', sName: 'Brazil' },
        { sISOCode: 'MX', sName: 'Mexico' },
        { sISOCode: 'IT', sName: 'Italy' },
        { sISOCode: 'ES', sName: 'Spain' },
        { sISOCode: 'RU', sName: 'Russia' },
        { sISOCode: 'ZA', sName: 'South Africa' },
        { sISOCode: 'EG', sName: 'Egypt' },
        { sISOCode: 'SA', sName: 'Saudi Arabia' },
        { sISOCode: 'AE', sName: 'United Arab Emirates' },
        { sISOCode: 'TR', sName: 'Turkey' },
        { sISOCode: 'KR', sName: 'South Korea' },
        { sISOCode: 'NL', sName: 'Netherlands' },
        { sISOCode: 'SE', sName: 'Sweden' },
        { sISOCode: 'CH', sName: 'Switzerland' },
        { sISOCode: 'SG', sName: 'Singapore' }
      ];
    }
  };

  const fetchCurrency = async (countryCode, countryName) => {
    try {
      const response = await fetch(`/currency/${countryCode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      console.log(`Currency response for ${countryCode}:`, data);
      
      // Parse the SOAP response correctly - handle different possible structures
      let currencyData = data;
      
      // Try different possible response structures
      if (data.CountryCurrencyResponse) {
        currencyData = data.CountryCurrencyResponse.CountryCurrencyResult || data.CountryCurrencyResponse;
      } else if (data.CountryCurrencyResult) {
        currencyData = data.CountryCurrencyResult;
      }
      
      return {
        countryCode: countryCode,
        countryName: countryName,
        currencyCode: currencyData.sISOCode || data.sISOCode || currencyData.currencyCode || 'N/A',
        currencyName: currencyData.sName || data.sName || currencyData.currencyName || 'N/A',
        service: 'SOAP Service',
        timestamp: new Date().toISOString(),
        rawData: currencyData // For debugging
      };
    } catch (err) {
      console.error(`Error fetching currency for ${countryCode}:`, err);
      return {
        countryCode: countryCode,
        countryName: countryName,
        currencyCode: 'Error',
        currencyName: 'Failed to fetch',
        service: 'SOAP Service',
        timestamp: new Date().toISOString(),
        error: err.message
      };
    }
  };

  const fetchAllCurrencies = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First get all countries
      console.log('Fetching countries list...');
      const countries = await getAllCountries();
      console.log(`Fetched ${countries.length} countries:`, countries);
      
      // Limit to first 30 countries for better performance and display
      const limitedCountries = countries.slice(0, 30);
      console.log(`Processing ${limitedCountries.length} countries for currency data`);
      
      // Fetch currency for each country with delay to avoid overwhelming the service
      const results = [];
      for (let i = 0; i < limitedCountries.length; i++) {
        const country = limitedCountries[i];
        console.log(`Fetching currency for ${country.sISOCode} - ${country.sName}`);
        
        const currencyData = await fetchCurrency(country.sISOCode, country.sName);
        results.push(currencyData);
        
        // Small delay to avoid overwhelming the SOAP service
        if (i < limitedCountries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setCurrencies(results);
      console.log('Final currencies data:', results);
      
    } catch (err) {
      const errorMsg = 'Failed to fetch currency information. Please check if Mule is running on port 8090.';
      setError(errorMsg);
      console.error('Currency fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const retryFailedCurrencies = async () => {
    setLoading(true);
    setError('');
    
    try {
      const failedCurrencies = currencies.filter(c => c.error || c.currencyCode === 'Error');
      if (failedCurrencies.length === 0) {
        setError('No failed currencies to retry');
        setLoading(false);
        return;
      }
      
      console.log(`Retrying ${failedCurrencies.length} failed currency fetches`);
      
      const retryPromises = failedCurrencies.map(currency => 
        fetchCurrency(currency.countryCode, currency.countryName)
      );
      
      const retryResults = await Promise.all(retryPromises);
      
      // Update the currencies state with successful retries
      const updatedCurrencies = currencies.map(currency => {
        const retryResult = retryResults.find(r => r.countryCode === currency.countryCode);
        return retryResult && !retryResult.error ? retryResult : currency;
      });
      
      setCurrencies(updatedCurrencies);
      
    } catch (err) {
      setError('Failed to retry currency fetches');
      console.error('Retry error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCurrencies();
  }, []);

  const hasErrors = currencies.some(currency => currency.error);
  const successCount = currencies.filter(currency => !currency.error && currency.currencyCode !== 'Error').length;

  return (
    <div className="currency-info">
      <h2>💱 Currency Information</h2>
      <p className="currency-description">
       
      </p>
      
      <div className="controls">
        <div className="button-group">
          <button 
            onClick={fetchAllCurrencies} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh All Currencies'}
          </button>
          {hasErrors && (
            <button 
              onClick={retryFailedCurrencies} 
              className="retry-btn"
              disabled={loading}
            >
              {loading ? '🔄 Retrying...' : '🔄 Retry Failed'}
            </button>
          )}
        </div>
        <div className="stats">
          <span className="count-badge">
            {successCount} / {currencies.length} successful
          </span>
          {hasErrors && (
            <span className="error-badge">
              {currencies.filter(c => c.error).length} errors
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-header">
            <span className="error-icon">❌</span>
            <strong>Service Error</strong>
          </div>
          <div className="error-details">{error}</div>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Fetching currency data from SOAP service...</p>
          <p className="loading-subtext">This may take a moment as we fetch data for all countries</p>
        </div>
      )}

      {!loading && currencies.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💱</div>
          <h3>No Currency Data</h3>
          <p>Click "Refresh All Currencies" to fetch currency information</p>
        </div>
      )}

      <div className="currencies-grid">
        {currencies.map((currency, index) => (
          <div key={`${currency.countryCode}-${index}`} className={`currency-card ${currency.error ? 'error-card' : ''} ${currency.currencyCode === 'N/A' ? 'na-card' : ''}`}>
            <div className="country-flag">
              {currency.countryCode}
            </div>
            <div className="currency-details">
              <h3 className="country-name">{currency.countryName}</h3>
              <div className="currency-data">
                <div className="currency-code">
                  <span className="label">Currency Code:</span>
                  <span className={`value code ${currency.currencyCode === 'N/A' ? 'na-value' : ''}`}>
                    {currency.currencyCode}
                  </span>
                </div>
                <div className="currency-name">
                  <span className="label">Currency Name:</span>
                  <span className={`value ${currency.currencyName === 'N/A' ? 'na-value' : ''}`}>
                    {currency.currencyName}
                  </span>
                </div>
              </div>
              <div className="service-info">
                <span className="service-type">{currency.service}</span>
                {currency.timestamp && (
                  <span className="timestamp">
                    {new Date(currency.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {currency.error && (
                <div className="card-error">
                  <small>Error: {currency.error}</small>
                </div>
              )}
              {currency.currencyCode === 'N/A' && !currency.error && (
                <div className="card-warning">
                  <small>Currency information not available</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {currencies.length > 0 && (
        <div className="footer-note">
          <p>
            Showing {currencies.length} countries. 
            {currencies.some(c => c.currencyCode === 'N/A') && 
              ' Some currencies may show as "N/A" if not available in the SOAP service.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CurrencyInfo;