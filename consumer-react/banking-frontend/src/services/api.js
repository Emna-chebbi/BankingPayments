import axios from 'axios';

export const bankingAPI = {
  processPayment: async (paymentData) => {
    console.log('🚀 Sending payment to Mule via proxy...', paymentData);
    
    try {
      const response = await fetch('/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        // Try to get detailed error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.log('❌ Error response body:', errorText);
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorText;
          }
        } catch (parseError) {
          console.log('❌ Could not parse error response');
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ Payment successful:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Payment failed:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to server. Please check if Mule is running on port 8090.');
      } else if (error.message.includes('HTTP error! status: 500')) {
        throw new Error('Server error. Please check if all Spring Boot services are running.');
      } else {
        throw error;
      }
    }
  },

  // Get transactions - use direct Spring Boot URL
  getTransactions: () => {
    return axios.get('http://localhost:8082/transactions');
  }
};

export default bankingAPI;