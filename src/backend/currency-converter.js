const axios = require('axios');

async function getEthToInrRate() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
        return response.data.ethereum.inr;
    } catch (error) {
        console.error('Failed to fetch ETH to INR rate:', error);
        return null;
    }
}

module.exports = { getEthToInrRate };