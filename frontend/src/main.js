import { ethers } from 'ethers';
import Chart from 'chart.js/auto';
import { provenanceAddress, auctionAddress } from './contract-config.js';
import ProvenanceABI from './contracts/Provenance.json';
import AuctionABI from './contracts/Auction.json';

// --- Global State ---
let provider;
let signer;
let provenanceContract;
let auctionContract;
const hardhatNetworkId = '31337';

// Application Data with enhanced blockchain simulation
const appData = {
    landingPage: {
      heroTitle: "Farm to Fork: Transparent Agriculture Powered by Blockchain",
      subtitle: "Revolutionary traceability system connecting farmers, distributors, retailers, and consumers through immutable blockchain technology",
      features: [
        "🔗 Immutable blockchain records",
        "📱 QR code traceability", 
        "💰 Fair pricing with smart provenanceContracts",
        "🛡️ Product authenticity verification",
        "📊 Real-time analytics dashboard",
        "🌍 Global supply chain transparency"
      ]
    },
    systemStats: {
      totalFarmers: 2847,
      totalCrops: 18562,
      totalDistributors: 456,
      totalRetailers: 1203,
      totalTransactions: 45780,
      totalValueTraded: "₹12,45,67,890",
      verifiedProducts: 98.7,
      farmerIncomeUplift: 23.4
    },
    farmers: [
      {
        id: "farmer_001",
        name: "Green Valley Organic Farms",
        location: "Maharashtra, India",
        contact: "contact@greenvalley.org",
        established: "2015",
        certification: "Organic Certified",
        totalCrops: 45,
        totalEarnings: "₹8,45,670",
        pendingBids: 12,
        qualityRating: 4.8,
        avatar: "👨‍🌾"
      },
      {
        id: "farmer_002",
        name: "Sunset Heritage Orchards", 
        location: "Punjab, India",
        contact: "info@sunsetorchards.com",
        established: "2018",
        certification: "Fair Trade Certified",
        totalCrops: 32,
        totalEarnings: "₹6,78,900",
        pendingBids: 8,
        qualityRating: 4.9,
        avatar: "👩‍🌾"
      }
    ],
    distributors: [
      {
        id: "dist_001",
        name: "AgriConnect Distribution Hub",
        location: "Mumbai, Maharashtra", 
        contact: "operations@agriconnect.com",
        license: "DIST-2023-001",
        activeBids: 15,
        wonAuctions: 89,
        deliveriesPending: 23,
        penalties: 2,
        successRate: 94.2,
        avatar: "🚚"
      }
    ],
    retailers: [
      {
        id: "retail_001",
        name: "FreshMart Supermarket Chain",
        location: "Pune, Maharashtra",
        contact: "quality@freshmart.com", 
        license: "RTL-2023-089",
        batchesVerified: 156,
        shelfLifeAlerts: 3,
        qualityScore: 96.8,
        customerRating: 4.7,
        avatar: "🏬"
      }
    ],
    consumers: [
      {
        id: "consumer_001",
        name: "Rajesh Sharma",
        location: "Delhi, India",
        qrScans: 47,
        favoriteProducts: 12,
        trustScore: 98.5,
        recentPurchases: 8,
        avatar: "🛒"
      }
    ],
    crops: [
      {
        id: "crop_001",
        farmerId: "farmer_001",
        type: "Organic Basmati Rice",
        variety: "Premium Long Grain",
        harvestDate: "2024-09-15",
        quantity: "2000 kg",
        qualityGrade: "Premium A+",
        location: "Field-A, Green Valley",
        price: "₹85/kg", 
        status: "Available",
        bids: [
          {"distributorId": "dist_001", "amount": "₹83/kg", "status": "Active"},
          {"distributorId": "dist_002", "amount": "₹84/kg", "status": "Leading"}
        ],
        blockchainHash: "0x1a2b3c4d5e6f7890abcdef123456",
        ipfsHash: "QmYjK8pRo3nV2wXzM9kL7eF2",
        qrCode: "QR_CROP_001",
        certifications: ["Organic", "Non-GMO", "Pesticide-Free"],
        images: ["rice-field.jpg", "harvesting.jpg", "quality-check.jpg"]
      },
      {
        id: "crop_002",
        farmerId: "farmer_002", 
        type: "Premium Red Apples",
        variety: "Himalayan Royal Gala",
        harvestDate: "2024-09-12",
        quantity: "500 kg",
        qualityGrade: "Export Quality",
        location: "Orchard-C, Sunset Hills",
        price: "₹150/kg",
        status: "Sold",
        blockchainHash: "0x9f8e7d6c5b4a39281fed567890",
        ipfsHash: "QmZtQ5rL8kWxY4vB6nP9mK3",
        qrCode: "QR_CROP_002",
        certifications: ["Fair Trade", "Sustainable", "Premium Grade"],
        images: ["apple-orchard.jpg", "red-apples.jpg", "packing.jpg"]
      },
      {
        id: "crop_003",
        farmerId: "farmer_001",
        type: "Organic Tomatoes",
        variety: "Roma Heritage",
        harvestDate: "2024-09-20",
        quantity: "800 kg",
        qualityGrade: "A Grade",
        location: "Greenhouse-B, Green Valley",
        price: "₹45/kg",
        status: "Bidding",
        blockchainHash: "0x7c8b9a0d1e2f3456789abcdef0",
        ipfsHash: "QmZtQ5rL8kWxY4vB6nP9mK4",
        qrCode: "QR_CROP_003",
        certifications: ["Organic", "Sustainable"],
        images: ["tomato-field.jpg", "harvest.jpg"]
      }
    ],
    blockchainEvents: [
      {
        id: "event_001",
        type: "BatchCreated",
        cropId: "crop_001", 
        txHash: "0x1a2b3c4d5e6f7890abcdef123456",
        blockNumber: 18567891,
        timestamp: "2024-09-15T08:30:00Z",
        gasUsed: "0.0045 ETH",
        status: "Confirmed",
        icon: "📦"
      },
      {
        id: "event_002",
        type: "BidPlaced",
        cropId: "crop_001",
        distributorId: "dist_001", 
        txHash: "0x9f8e7d6c5b4a39281fed567890",
        blockNumber: 18567892,
        timestamp: "2024-09-16T10:30:00Z",
        gasUsed: "0.0032 ETH", 
        status: "Confirmed",
        icon: "🚚"
      },
      {
        id: "event_003",
        type: "DeliveryConfirmed",
        cropId: "crop_002",
        retailerId: "retail_001",
        txHash: "0x7c8b9a0d1e2f3456789abcdef0", 
        blockNumber: 18567893,
        timestamp: "2024-09-17T14:45:00Z",
        gasUsed: "0.0038 ETH",
        status: "Confirmed", 
        icon: "✅"
      }
    ],
    charts: {
      farmerEarnings: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [45000, 52000, 48000, 61000, 58000, 67000]
      },
      cropPerformance: {
        labels: ["Rice", "Wheat", "Apples", "Tomatoes", "Cotton"],
        data: [85, 78, 92, 88, 75]
      },
      distributorSuccess: {
        labels: ["Won", "Lost", "Pending"],
        data: [89, 23, 15]
      },
      retailerVerification: {
        labels: ["Sep 1", "Sep 8", "Sep 15", "Sep 22"], 
        data: [34, 42, 38, 45]
      },
      consumerScans: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        data: [12, 15, 18, 22]
      },
      platformGrowth: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        data: [1200, 1850, 2400, 2847]
      }
    },
    smartContracts: {
      BatchRegistry: {
        address: "0x742d35cc6732c0532925a3b8d4b5c87d9ed2bcaa",
        network: "Polygon Mumbai Testnet",
        deployCost: "0.0234 ETH",
        interactions: 1247
      },
      Auction: {
        address: "0x8ba1f109551bd432803012645hac136c34b5739c", 
        network: "Polygon Mumbai Testnet",
        deployCost: "0.0156 ETH",
        interactions: 2156
      },
      Escrow: {
        address: "0x2f09a57f6e6b7c38d1c7f8a9b5c4d3e2f1908576",
        network: "Polygon Mumbai Testnet",
        deployCost: "0.0198 ETH", 
        interactions: 891
      },
      Insurance: {
        address: "0x4e7d8c9b0a1f2e3d4c5b6a7e8f9d0c1b2a3f4e5d",
        network: "Polygon Mumbai Testnet",
        deployCost: "0.0167 ETH",
        interactions: 234
      }
    }
  };
  
  // Current application state
  let currentState = {
    role: 'farmer',
    user: null,
    activeSection: 'home',
    charts: {}
  };
  
  // Initialize application
  document.addEventListener('DOMContentLoaded', function() {
    console.log('AgriTrace: Initializing blockchain agricultural traceability system...');
    initializeApp();
  });
  
  function initializeApp() {
    setupEventListeners();
    setupAuthEventListeners();
    showLandingPage();
    startBlockchainSimulation();
    console.log('AgriTrace: System ready');
  }
  
  function setupAuthEventListeners() {
    const loginNavBtn = document.getElementById('loginNavBtn');
    const registerNavBtn = document.getElementById('registerNavBtn');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authModal = document.getElementById('authModal');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const connectWalletBtn = document.getElementById('connectWalletBtn');

    if(loginNavBtn) loginNavBtn.addEventListener('click', () => showAuthModal('login'));
    if(registerNavBtn) registerNavBtn.addEventListener('click', () => showAuthModal('register'));
    if(closeAuthModal) closeAuthModal.addEventListener('click', () => hideModal('authModal'));
    if(authModal) authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            hideModal('authModal');
        }
    });

    if(switchToRegister) switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('register');
    });

    if(switchToLogin) switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('login');
    });

    if(loginForm) loginForm.addEventListener('submit', handleLogin);
    if(registerForm) registerForm.addEventListener('submit', handleRegistration);
    if(connectWalletBtn) connectWalletBtn.addEventListener('click', async () => {
        await connectWallet();
        if(signer) {
            const address = await signer.getAddress();
            const registerWalletAddress = document.getElementById('registerWalletAddress');
            if(registerWalletAddress) registerWalletAddress.value = address;
        }
    });
  }

  function showAuthModal(form = 'login') {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        switchAuthForm(form);
        showModal('authModal');
    }
  }

  function switchAuthForm(form) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    if (form === 'login') {
        if(loginForm) loginForm.classList.remove('hidden');
        if(registerForm) registerForm.classList.add('hidden');
        if(authTitle) authTitle.textContent = 'Login';
        if(switchToRegister) switchToRegister.parentElement.classList.remove('hidden');
        if(switchToLogin) switchToLogin.parentElement.classList.add('hidden');
    } else {
        if(loginForm) loginForm.classList.add('hidden');
        if(registerForm) registerForm.classList.remove('hidden');
        if(authTitle) authTitle.textContent = 'Register';
        if(switchToRegister) switchToRegister.parentElement.classList.add('hidden');
        if(switchToLogin) switchToLogin.parentElement.classList.remove('hidden');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    console.log(`Attempting to log in user: ${username}`);

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Login response from server:', data);

        if (response.ok) {
            showToast('success', 'Login Successful', `Welcome back, ${data.user.username}!`);
            hideModal('authModal');
            loginUser(data.user);
        } else {
            showToast('error', 'Login Failed', data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('error', 'Login Error', 'An unexpected error occurred.');
    }
  }

  async function handleRegistration(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const wallet_address = document.getElementById('registerWalletAddress').value;

    if(!wallet_address) {
        showToast('error', 'Wallet Error', 'Please connect your wallet first');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role, wallet_address })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('success', 'Registration Successful', `Welcome, ${data.user.username}!`);
            hideModal('authModal');
            loginUser(data.user);
        } else {
            showToast('error', 'Registration Failed', data.error);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('error', 'Registration Error', 'An unexpected error occurred.');
    }
  }

  function loginUser(user) {
    currentState.user = user;
    currentState.role = user.role;
    showMainApp();
    document.getElementById('roleSwitcher').disabled = true;
    document.getElementById('loginNavBtn').classList.add('hidden');
    document.getElementById('registerNavBtn').classList.add('hidden');
    const logoutBtn = document.getElementById('logoutBtn');
    if(!logoutBtn) {
        const nav = document.querySelector('nav .nav-user');
        const newLogoutBtn = document.createElement('button');
        newLogoutBtn.className = 'btn btn--outline';
        newLogoutBtn.id = 'logoutBtn';
        newLogoutBtn.textContent = 'Logout';
        newLogoutBtn.addEventListener('click', logoutUser);
        if(nav) nav.appendChild(newLogoutBtn);
    }
  }

  function logoutUser() {
    currentState.user = null;
    currentState.role = 'farmer';
    showLandingPage();
    document.getElementById('roleSwitcher').disabled = false;
    document.getElementById('loginNavBtn').classList.remove('hidden');
    document.getElementById('registerNavBtn').classList.remove('hidden');
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.remove();
  }

  function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Landing page events
    const getStartedBtn = document.getElementById('getStartedBtn');
    const skipToDemo = document.getElementById('skipToDemo');
    const roleCards = document.querySelectorAll('.role-card');
    const backToLanding = document.getElementById('backToLanding');
    const roleSwitcher = document.getElementById('roleSwitcher');
  
    if (getStartedBtn) {
      getStartedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.role-selection-section').scrollIntoView({
          behavior: 'smooth' 
        });
      });
    }
  
    if (skipToDemo) {
      skipToDemo.addEventListener('click', (e) => {
        e.preventDefault();
        showMainApp();
      });
    }
  
    if (backToLanding) {
      backToLanding.addEventListener('click', (e) => {
        e.preventDefault();
        showLandingPage();
      });
    }
  
    if (roleSwitcher) {
      roleSwitcher.addEventListener('change', (e) => {
        e.preventDefault();
        const newRole = e.target.value;
        console.log('Role switcher changed to:', newRole);
        switchRole(newRole);
      });
    }
  
    // Role cards click handlers
    roleCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const role = card.dataset.role;
        console.log('Role card clicked:', role);
        currentState.role = role;
        showMainApp();
      });
      
      // Role card buttons
      const button = card.querySelector('.btn');
      if (button) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const role = card.dataset.role;
          console.log('Role button clicked:', role);
          currentState.role = role;
          showMainApp();
        });
      }
    });
  
    // Sidebar navigation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        switchSection(section);
      });
    });
  
    // Dashboard specific events
    setupDashboardEvents();
    setupModalEvents();
    setupProvenanceEventListeners();
    
    console.log('Event listeners setup complete');
  }
  
  function setupDashboardEvents() {
    // Farmer events
    const addCropBtn = document.getElementById('addCropBtn');
    if (addCropBtn) {
      addCropBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Add crop button clicked');
        showModal('addCropModal');
      });
    }
  
    // Retailer events
    const scanQRBtn = document.getElementById('scanQRBtn');
    if (scanQRBtn) {
      scanQRBtn.addEventListener('click', (e) => {
        e.preventDefault();
        simulateQRScan();
      });
    }
  
    // Consumer events
    const simulateScanBtn = document.getElementById('simulateScanBtn');
    const searchProductBtn = document.getElementById('searchProductBtn');
    const productIdInput = document.getElementById('productIdInput');
  
    if (simulateScanBtn) {
      simulateScanBtn.addEventListener('click', (e) => {
        e.preventDefault();
        simulateQRScan();
      });
    }
  
    if (searchProductBtn) {
      searchProductBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = productIdInput.value.trim();
        if (productId) {
          showProductJourney(productId);
        } else {
          showToast('warning', 'Input Required', 'Please enter a product ID to search');
        }
      });
    }
  
    if (productIdInput) {
      productIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (searchProductBtn) {
            searchProductBtn.click();
          }
        }
      });
    }
  }
  
  window.viewCropDetails = async (cropId) => {
    if (!provenanceContract) {
        await connectWallet();
        if (!provenanceContract) {
            showToast('error', 'Wallet Error', 'Please connect wallet to view details.');
            return;
        }
    }

    try {
        const batch = await provenanceContract.getBatch(cropId);
        const ipfsData = JSON.parse(batch[2]);

        const cropDetailsBody = document.getElementById('cropDetailsBody');
        if (cropDetailsBody) {
            cropDetailsBody.innerHTML = `
                <h3>${ipfsData.type} - ${ipfsData.variety}</h3>
                <div class="crop-details-grid">
                    <div><strong>Harvest Date:</strong> ${formatDate(ipfsData.harvestDate)}</div>
                    <div><strong>Quantity:</strong> ${ipfsData.quantity} kg</div>
                    <div><strong>Grade:</strong> ${ipfsData.qualityGrade}</div>
                    <div><strong>Price:</strong> ₹${ipfsData.price}/kg</div>
                    <div><strong>Location:</strong> ${ipfsData.location}</div>
                    <div><strong>Farmer:</strong> ${batch[1]}</div>
                </div>
                ${ipfsData.image ? `<img src="${ipfsData.image}" alt="Crop Image" class="crop-details-image">` : ''}
            `;
        }

        showModal('cropDetailsModal');
    } catch (error) {
        console.error('Error fetching crop details:', error);
        showToast('error', 'Blockchain Error', 'Could not fetch crop details.');
    }
  }

  function setupModalEvents() {
    const closeQrCodeModal = document.getElementById('closeQrCodeModal');
    if(closeQrCodeModal) closeQrCodeModal.addEventListener('click', () => hideModal('qrCodeModal'));

    const closeCropDetailsModal = document.getElementById('closeCropDetailsModal');
    if(closeCropDetailsModal) closeCropDetailsModal.addEventListener('click', () => hideModal('cropDetailsModal'));

    // Modal close events
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');
  
    modalCloses.forEach(close => {
      close.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = e.target.closest('.modal');
        if (modal) {
          hideModal(modal.id);
        }
      });
    });
  
    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          hideModal(modal.id);
        }
      });
    });
  
    // Form submissions
    const addCropForm = document.getElementById('addCropForm');
    const bidForm = document.getElementById('bidForm');
    const createAuctionForm = document.getElementById('createAuctionForm');
  
    if (addCropForm) {
      addCropForm.addEventListener('submit', handleAddCrop);
    }
  
    if (bidForm) {
      bidForm.addEventListener('submit', handlePlaceBid);
    }

    if (createAuctionForm) {
        createAuctionForm.addEventListener('submit', handleCreateAuction);
    }
  
    // Cancel buttons
    const cancelCrop = document.getElementById('cancelCrop');
    const cancelBid = document.getElementById('cancelBid');
    const cancelAuction = document.getElementById('cancelAuction');
  
    if (cancelCrop) {
      cancelCrop.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('addCropModal');
      });
    }
  
    if (cancelBid) {
      cancelBid.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('bidModal');
      });
    }

    if (cancelAuction) {
        cancelAuction.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('createAuctionModal');
        });
    }
  
    // Bid calculation
    const bidAmount = document.getElementById('bidAmount');
    const bidQuantity = document.getElementById('bidQuantity');
  
    if (bidAmount) bidAmount.addEventListener('input', updateBidTotal);
  }
  
  function showLandingPage() {
    console.log('Showing landing page');
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    
    if (landingPage) landingPage.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
    
    // Animate blockchain blocks
    const blocks = document.querySelectorAll('.blockchain-blocks .block');
    blocks.forEach((block, index) => {
      block.style.setProperty('--i', index);
    });
  }
  
  function showMainApp() {
    console.log('Showing main app for role:', currentState.role);
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    
    if (landingPage) landingPage.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
    
    // Initialize role
    const roleSwitcher = document.getElementById('roleSwitcher');
    if (roleSwitcher) {
      roleSwitcher.value = currentState.role;
      console.log('Set role switcher to:', currentState.role);
    }
    
    switchRole(currentState.role);
    switchSection('home');
  }
  
  function switchRole(role) {
    console.log(`AgriTrace: Switching to ${role} role`);
    currentState.role = role;
    
    // Update UI
    const userRole = document.getElementById('userRole');
    const userName = document.getElementById('userName');
    
    if (userRole && userName) {
      const roleData = getRoleData(role);
      userRole.textContent = roleData.displayName;
      userName.textContent = roleData.userName;
      console.log('Updated user info:', roleData);
    }
  
    // Show appropriate dashboard
    showDashboard(role);
    
    showToast('info', 'Role Switched', `Welcome to ${getRoleData(role).displayName} dashboard`);
  }
  
  function getRoleData(role) {
    const roles = {
      farmer: { displayName: '👨‍🌾 Farmer', userName: 'Green Valley Organic Farms' },
      distributor: { displayName: '🚚 Distributor', userName: 'AgriConnect Distribution Hub' },
      retailer: { displayName: '🏬 Retailer', userName: 'FreshMart Supermarket Chain' },
      consumer: { displayName: '🛒 Consumer', userName: 'Rajesh Sharma' },
      admin: { displayName: '⚙️ Admin', userName: 'System Administrator' },
      provenance: { displayName: '🔧 Provenance', userName: 'dApp User' }
    };
    return roles[role] || roles.farmer;
  }
  
  function switchSection(section) {
    console.log('Switching to section:', section);
    
    // Update active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      if (item.dataset.section === section) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  
    currentState.activeSection = section;

    if (section === 'provenance') {
        showDashboard('provenance');
    } else {
        showDashboard(currentState.role);
    }
    
    showToast('info', 'Navigation', `Switched to ${section.charAt(0).toUpperCase() + section.slice(1)} section`);
  }
  
  function showDashboard(role) {
    console.log('Showing dashboard for role:', role);
    
    // Hide all dashboards
    const dashboards = document.querySelectorAll('.dashboard');
    dashboards.forEach(dashboard => dashboard.classList.add('hidden'));
    
    // Show selected dashboard
    const dashboard = document.getElementById(`${role}Dashboard`);
    if (dashboard) {
      dashboard.classList.remove('hidden');
      console.log('Dashboard shown:', `${role}Dashboard`);
      
      // Destroy existing charts before loading new ones
      destroyExistingCharts();
      
      // Load dashboard data
      loadDashboardData(role);
    } else {
      console.error('Dashboard not found:', `${role}Dashboard`);
    }
  }
  
  function loadDashboardData(role) {
    console.log('Loading data for role:', role);
    
    switch(role) {
      case 'farmer':
        loadFarmerDashboard();
        break;
      case 'distributor':
        loadDistributorDashboard();
        break;
      case 'retailer':
        loadRetailerDashboard();
        break;
      case 'consumer':
        loadConsumerDashboard();
        break;
      case 'admin':
        loadAdminDashboard();
        break;
      case 'provenance':
        loadProvenanceDashboard();
        break;
    }
  }
  
  function loadFarmerDashboard() {
    console.log('Loading farmer dashboard with enhanced features...');
    
    // Load farmer activity
    const farmerActivity = document.getElementById('farmerActivity');
    if (farmerActivity) {
      const activities = [
        { icon: '🌾', title: 'New crop registered', desc: 'Organic Tomatoes - 800kg', time: '2 hours ago' },
        { icon: '💰', title: 'Payment received', desc: '₹1,20,000 from AgriConnect', time: '1 day ago' },
        { icon: '📋', title: 'New bid received', desc: '₹84/kg for Basmati Rice', time: '3 hours ago' },
        { icon: '🚚', title: 'Delivery confirmed', desc: 'Premium Apples delivered', time: '2 days ago' }
      ];
  
      farmerActivity.innerHTML = activities.map(activity => `
        <div class="activity-item">
          <div class="activity-icon">${activity.icon}</div>
          <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-desc">${activity.desc}</div>
            <div class="activity-time">${activity.time}</div>
          </div>
        </div>
      `).join('');
    }
  
    // Load farmer crops
    loadFarmerCrops();
    
    // Load earnings chart with delay to ensure canvas is ready
    setTimeout(() => {
      loadFarmerChart();
    }, 100);
  }
  
  async function loadOnChainCrops(filterByFarmer = false) {
    console.log('Attempting to load on-chain crops...');
    if (!provenanceContract) {
        console.log('Contract object not found, attempting to connect wallet...');
        await connectWallet(); 
        if (!provenanceContract) {
            console.error("Cannot load crops, wallet not connected after attempting to connect.");
            showToast('error', 'Wallet Error', 'Please connect your wallet to view crops.');
            return [];
        }
        console.log('Wallet connected, provenanceContract object is now available.');
    }

    try {
        console.log('Fetching batch count...');
        const batchCount = await provenanceContract.batchCount();
        console.log(`Batch count: ${batchCount}`);

        const crops = [];
        // Use the logged-in user's wallet address for filtering
        const userWalletAddress = currentState.user ? currentState.user.wallet_address : null;
        console.log(`User wallet address for filtering: ${userWalletAddress}`);

        for (let i = 1; i <= batchCount; i++) {
            try {
                console.log(`Fetching batch ${i}...`);
                const batch = await provenanceContract.getBatch(i);
                console.log('Batch data:', batch);
                
                if (filterByFarmer && userWalletAddress && batch[1].toLowerCase() !== userWalletAddress.toLowerCase()) {
                    console.log(`Skipping batch ${i} as it does not belong to the current farmer.`);
                    continue;
                }

                console.log(`Parsing IPFS data for batch ${i}...`);
                const ipfsData = JSON.parse(batch[2]);
                console.log('Parsed IPFS data:', ipfsData);

                crops.push({
                    id: batch[0].toString(),
                    farmerId: batch[1],
                    type: ipfsData.type,
                    variety: ipfsData.variety,
                    harvestDate: ipfsData.harvestDate,
                    quantity: `${ipfsData.quantity} kg`,
                    qualityGrade: ipfsData.qualityGrade,
                    location: ipfsData.location,
                    price: `₹${ipfsData.price}/kg`,
                    status: 'Available',
                });
            } catch (parseError) {
                console.error(`Skipping batch ${i} due to invalid JSON in ipfsHash:`, parseError);
                continue; // Skip this batch and continue with the next one
            }
        }
        console.log('Successfully loaded and parsed all valid crops.');
        return crops.reverse();
    } catch (error) {
        console.error('Error in loadOnChainCrops:', error);
        showToast('error', 'Blockchain Error', `Could not fetch crop data: ${error.message}`);
        return [];
    }
  }

  async function loadFarmerCrops() {
    const farmerCrops = document.getElementById('farmerCrops');
    if (!farmerCrops) return;

    const crops = await loadOnChainCrops(true); // Filter by farmer
    
    if (crops.length === 0) {
        farmerCrops.innerHTML = "<p>You have not registered any crops on the blockchain yet.</p>";
        return;
    }

    farmerCrops.innerHTML = crops.map(crop => `
      <div class="crop-card">
        <div class="crop-card-header">
          <h4>${crop.type}</h4>
          <div class="crop-variety">${crop.variety}</div>
        </div>
        <div class="crop-card-body">
          <div class="crop-details">
            <div class="crop-detail">
              <strong>Harvest Date:</strong>
              <span>${formatDate(crop.harvestDate)}</span>
            </div>
            <div class="crop-detail">
              <strong>Quantity:</strong>
              <span>${crop.quantity}</span>
            </div>
            <div class="crop-detail">
              <strong>Grade:</strong>
              <span>${crop.qualityGrade}</span>
            </div>
            <div class="crop-detail">
              <strong>Price:</strong>
              <span>${crop.price}</span>
            </div>
            <div class="crop-detail">
              <strong>Location:</strong>
              <span>${crop.location}</span>
            </div>
          </div>
        </div>
        <div class="crop-card-footer">
          <span class="status status--${crop.status.toLowerCase()}">${crop.status}</span>
          <button class="btn btn--sm btn--outline" onclick="viewQRCode('${crop.id}')">
            <i class="fas fa-qrcode"></i> QR Code
          </button>
          <button class="btn btn--sm btn--primary" onclick="viewCropDetails('${crop.id}')">
            <i class="fas fa-info-circle"></i> View Details
          </button>
          <button class="btn btn--sm btn--secondary" onclick="showCreateAuctionModal('${crop.id}')">
            <i class="fas fa-gavel"></i> Create Auction
          </button>
        </div>
      </div>
    `).join('');
  }
  
  function loadFarmerChart() {
    const ctx = document.getElementById('farmerEarningsChart');
    if (!ctx || currentState.charts.farmerEarnings) return;
  
    try {
      currentState.charts.farmerEarnings = new Chart(ctx, {
        type: 'line',
        data: {
          labels: appData.charts.farmerEarnings.labels,
          datasets: [{
            label: 'Monthly Earnings (₹)',
            data: appData.charts.farmerEarnings.data,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₹' + (value/1000) + 'k';
                }
              }
            }
          }
        }
      });
      console.log('Farmer earnings chart loaded successfully');
    } catch (error) {
      console.error('Error loading farmer chart:', error);
    }
  }
  
  async function loadDistributorDashboard() {
    console.log('Loading distributor dashboard with bidding features...');
    
    // Load available crops preview
    const distributorCropsPreview = document.getElementById('distributorCropsPreview');
    if (distributorCropsPreview) {
      const availableCrops = await loadOnChainCrops(false); // Show all crops
      
      distributorCropsPreview.innerHTML = availableCrops.slice(0, 3).map(crop => `
        <div class="crop-preview-item">
          <div>
            <strong>${crop.type}</strong>
            <div style="font-size: 12px; color: var(--color-text-secondary);">${crop.quantity} at ${crop.price}</div>
          </div>
          <button class="btn btn--sm btn--primary" onclick="showBidModal('${crop.id}')">
            <i class="fas fa-gavel"></i> Bid
          </button>
        </div>
      `).join('');
    }

    // Load active auctions
    loadActiveAuctions();
    
    // Load success rate chart
    setTimeout(() => {
      loadDistributorChart();
    }, 100);
  }
  
  function loadDistributorChart() {
    const ctx = document.getElementById('distributorSuccessChart');
    if (!ctx || currentState.charts.distributorSuccess) return;
  
    try {
      currentState.charts.distributorSuccess = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: appData.charts.distributorSuccess.labels,
          datasets: [{
            data: appData.charts.distributorSuccess.data,
            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      console.log('Distributor success chart loaded successfully');
    } catch (error) {
      console.error('Error loading distributor chart:', error);
    }
  }
  
  function onScanSuccess(decodedText, decodedResult) {
    // handle the scanned code as you like, for example:
    console.log(`Code matched = ${decodedText}`, decodedResult);
    showProductJourney(decodedText);
    html5QrcodeScanner.clear();
  }

  function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`);
  }

  let html5QrcodeScanner;

  function setupQrScanner() {
    html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        /* verbose= */ false);
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  }

  async function loadRetailerDashboard() {
    console.log('Loading retailer dashboard with verification system...');
    setupQrScanner();
    
    // Load inventory alerts
    const retailerAlerts = document.getElementById('retailerAlerts');
    if (retailerAlerts) {
        const crops = await loadOnChainCrops(false); // Show all crops
        const alerts = crops.slice(0, 3).map(crop => ({
            type: 'info',
            title: 'New Batch Available',
            desc: `${crop.type} - ${crop.quantity}`,
            time: `${formatDate(crop.harvestDate)}`
        }));

      retailerAlerts.innerHTML = alerts.map(alert => `
        <div class="alert-item">
          <div class="alert-icon ${alert.type}">
            ${alert.type === 'warning' ? '⚠️' : alert.type === 'info' ? 'ℹ️' : '✅'}
          </div>
          <div class="alert-content">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-desc">${alert.desc}</div>
            <div class="alert-time">${alert.time}</div>
          </div>
        </div>
      `).join('');
    }
    
    // Load verification chart
    setTimeout(() => {
      loadRetailerChart();
    }, 100);
  }
  
  function loadRetailerChart() {
    const ctx = document.getElementById('retailerVerificationChart');
    if (!ctx || currentState.charts.retailerVerification) return;
  
    try {
      currentState.charts.retailerVerification = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: appData.charts.retailerVerification.labels,
          datasets: [{
            label: 'Products Verified',
            data: appData.charts.retailerVerification.data,
            backgroundColor: '#F59E0B'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      console.log('Retailer verification chart loaded successfully');
    } catch (error) {
      console.error('Error loading retailer chart:', error);
    }
  }
  
  function loadConsumerDashboard() {
    console.log('Loading consumer dashboard with product verification...');
    // Consumer dashboard is primarily interactive, no heavy data loading needed
  }
  
  function loadAdminDashboard() {
    console.log('Loading admin dashboard with system analytics...');
    
    // Load blockchain events
    loadBlockchainEvents();
    
    // Load smart provenanceContracts
    loadSmartContracts();
    
    // Load platform growth chart
    setTimeout(() => {
      loadAdminChart();
    }, 100);
  }
  
  function loadBlockchainEvents() {
    const blockchainEvents = document.getElementById('blockchainEvents');
    if (!blockchainEvents) return;
  
    blockchainEvents.innerHTML = appData.blockchainEvents.map(event => `
      <div class="event-item">
        <div class="event-icon">${event.icon}</div>
        <div class="event-content">
          <div class="event-type">${event.type}</div>
          <div class="event-details">
            Block: ${event.blockNumber} | Gas: ${event.gasUsed}
          </div>
          <div class="event-time">${formatDate(event.timestamp)}</div>
        </div>
        <span class="status status--success">${event.status}</span>
      </div>
    `).join('');
  }
  
  function loadSmartContracts() {
    const smartContracts = document.getElementById('smartContracts');
    if (!smartContracts) return;
  
    smartContracts.innerHTML = Object.entries(appData.smartContracts).map(([name, provenanceContract]) => `
      <div class="provenanceContract-card">
        <div class="provenanceContract-header">
          <div class="provenanceContract-name">${name}</div>
          <span class="status status--success">Active</span>
        </div>
        <div class="provenanceContract-address">${provenanceContract.address}</div>
        <div class="provenanceContract-stats">
          <div>Network: ${provenanceContract.network}</div>
          <div>Deploy Cost: ${provenanceContract.deployCost}</div>
          <div>Interactions: ${provenanceContract.interactions.toLocaleString()}</div>
        </div>
      </div>
    `).join('');
  }
  
  function loadAdminChart() {
    const ctx = document.getElementById('platformGrowthChart');
    if (!ctx || currentState.charts.platformGrowth) return;
  
    try {
      currentState.charts.platformGrowth = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: appData.charts.platformGrowth.labels,
          datasets: [{
            label: 'Active Users',
            data: appData.charts.platformGrowth.data,
            backgroundColor: '#0D9488'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      console.log('Platform growth chart loaded successfully');
    } catch (error) {
      console.error('Error loading admin chart:', error);
    }
  }
  
  // Destroy existing charts to prevent canvas reuse errors
  function destroyExistingCharts() {
    Object.values(currentState.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        try {
          chart.destroy();
        } catch (error) {
          console.warn('Error destroying chart:', error);
        }
      }
    });
    currentState.charts = {};
  }
  
  // Modal Functions
  function showModal(modalId) {
    console.log('Showing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      console.error('Modal not found:', modalId);
    }
  }
  
  function hideModal(modalId) {
    console.log('Hiding modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }
  
  async function showBidModal(auctionId) {
    console.log('Showing bid modal for auction:', auctionId);

    if (!auctionContract) {
        await connectWallet();
        if (!auctionContract) {
            showToast('error', 'Wallet Error', 'Please connect wallet to bid.');
            return;
        }
    }

    try {
        const auction = await auctionContract.auctions(auctionId);

        const bidAuctionInfo = document.getElementById('bidAuctionInfo');
        
        if (bidAuctionInfo) {
          bidAuctionInfo.innerHTML = `
            <h3>Auction for Batch ID: ${auction.batchId}</h3>
            <div class="auction-info-grid">
              <div class="auction-info-item">
                <strong>Highest Bid:</strong>
                <span>${ethers.formatEther(auction.highestBid)} ETH</span>
              </div>
              <div class="auction-info-item">
                <strong>Highest Bidder:</strong>
                <span>${auction.highestBidder}</span>
              </div>
              <div class="auction-info-item">
                <strong>End Time:</strong>
                <span>${new Date(Number(auction.endTime) * 1000).toLocaleString()}</span>
              </div>
            </div>
          `;
        }
        
        const bidModal = document.getElementById('bidModal');
        if (bidModal) {
          bidModal.dataset.auctionId = auctionId;
          showModal('bidModal');
        }
    } catch (error) {
        console.error('Error fetching auction for bid:', error);
        showToast('error', 'Blockchain Error', 'Could not fetch auction details.');
    }
  }
  
  window.showCreateAuctionModal = showCreateAuctionModal;

  function showCreateAuctionModal(batchId) {
    const createAuctionModal = document.getElementById('createAuctionModal');
    if (createAuctionModal) {
        document.getElementById('auctionBatchId').value = batchId;
        showModal('createAuctionModal');
    }
  }

  async function handleCreateAuction(e) {
    e.preventDefault();
    const batchId = document.getElementById('auctionBatchId').value;
    const startingPrice = document.getElementById('startingPrice').value;
    const durationInMinutes = document.getElementById('auctionDuration').value;

    if (!batchId || !startingPrice || !durationInMinutes) {
        showToast('error', 'Validation Error', 'Please fill in all fields');
        return;
    }

    if (!provenanceContract || !auctionContract) {
        showToast('error', 'Wallet Error', 'Please connect your wallet first');
        await connectWallet();
        if(!provenanceContract || !auctionContract) return;
    }

    try {
        // Check ownership before proceeding
        const batch = await provenanceContract.getBatch(batchId);
        const owner = batch[3][batch[3].length - 1];
        const currentUser = await signer.getAddress();

        if (owner.toLowerCase() !== currentUser.toLowerCase()) {
            showToast('error', 'Ownership Error', 'Only the current owner of the batch can create an auction. Please connect the owner account in MetaMask.');
            return;
        }

        // 1. Transfer ownership of the batch to the Auction contract
        showToast('info', 'Step 1/2: Transferring Ownership', `Transferring batch ${batchId} to the auction contract...`);
        const transferTx = await provenanceContract.transferOwnership(batchId, auctionAddress);
        await transferTx.wait();
        showToast('success', 'Step 1/2: Ownership Transferred', `Batch ${batchId} is now owned by the auction contract.`);

        // 2. Create the auction
        showToast('info', 'Step 2/2: Creating Auction', 'Sending transaction to create the auction...');
        const durationInSeconds = parseInt(durationInMinutes) * 60;
        const auctionTx = await auctionContract.createAuction(batchId, ethers.parseEther(startingPrice), durationInSeconds);
        await auctionTx.wait();
        
        hideModal('createAuctionModal');
        document.getElementById('createAuctionForm').reset();
        loadActiveAuctions(); // Refresh the auction list
        
        showToast('success', 'Auction Created', `Auction for batch ${batchId} created successfully!`);

    } catch (error) {
        console.error('Error creating auction:', error);
        showToast('error', 'Blockchain Error', `Error: ${error.message}`);
    }
  }

  // Form Handlers
  async function handleAddCrop(e) {
    e.preventDefault();
    console.log('Handling add crop form submission');

    if (!provenanceContract) {
        showToast('error', 'Wallet Error', 'Please connect your wallet first');
        await connectWallet();
        if(!provenanceContract) return;
    }
    
    const formData = {
      type: document.getElementById('cropType').value,
      variety: document.getElementById('cropVariety').value,
      harvestDate: document.getElementById('harvestDate').value,
      quantity: document.getElementById('cropQuantity').value,
      qualityGrade: document.getElementById('qualityGrade').value,
      price: document.getElementById('cropPrice').value,
      location: document.getElementById('cropLocation').value
    };

    const imageFile = document.getElementById('cropImage').files[0];
    let imageAsDataUrl = '';

    if (imageFile) {
        imageAsDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    }
    
    // Validate required fields
    if (!formData.type || !formData.variety || !formData.harvestDate || !formData.quantity || !formData.price || !formData.location) {
      showToast('error', 'Validation Error', 'Please fill in all required fields');
      return;
    }
    
    // In a real application, this data would be uploaded to IPFS.
    // For this demo, we'll store the JSON directly as the "ipfsHash".
    const ipfsHash = JSON.stringify({ ...formData, image: imageAsDataUrl });

    try {
        const tx = await provenanceContract.registerBatch(ipfsHash);
        showToast('info', 'Transaction Sent', `Transaction sent: ${tx.hash}... waiting for confirmation.`);
        await tx.wait();
        
        hideModal('addCropModal');
        document.getElementById('addCropForm').reset();
        loadFarmerCrops(); // Refresh the crop list
        
        showToast('success', 'Crop Registered', `${formData.type} successfully registered on the blockchain!`);

    } catch (error) {
        console.error('Error registering batch:', error);
        showToast('error', 'Blockchain Error', `Error: ${error.message}`);
    }
  }
  
  async function handlePlaceBid(e) {
    e.preventDefault();
    console.log('Handling place bid form submission');
    
    const bidModal = document.getElementById('bidModal');
    const cropId = bidModal ? bidModal.dataset.auctionId : null;
    
    if (!cropId) {
      showToast('error', 'Error', 'No crop selected for bidding');
      return;
    }
    
    const bidAmount = document.getElementById('bidAmount').value;
    
    // Validate required fields
    if (!bidAmount) {
      showToast('error', 'Validation Error', 'Please fill in bid amount');
      return;
    }

    if (!auctionContract) {
        showToast('error', 'Wallet Error', 'Please connect your wallet first');
        await connectWallet();
        if(!auctionContract) return;
    }

    try {
        const tx = await auctionContract.bid(cropId, { value: ethers.parseEther(bidAmount) });
        showToast('info', 'Transaction Sent', `Transaction sent: ${tx.hash}... waiting for confirmation.`);
        await tx.wait();
        
        hideModal('bidModal');
        document.getElementById('bidForm').reset();
        loadActiveAuctions(); // Refresh the auction list
        
        showToast('success', 'Bid Placed', `Your bid of ${bidAmount} ETH has been placed successfully!`);

    } catch (error) {
        console.error('Error placing bid:', error);
        showToast('error', 'Blockchain Error', `Error: ${error.message}`);
    }
  }
  
  function updateBidTotal() {
    const amount = parseFloat(document.getElementById('bidAmount').value) || 0;
    const quantity = parseFloat(document.getElementById('bidQuantity').value) || 0;
    const total = amount * quantity;
    
    const totalElement = document.getElementById('totalBidValue');
    if (totalElement) {
      totalElement.textContent = `₹${total.toLocaleString()}`;
    }
  }
  
  // QR and Product Journey
  function simulateQRScan() {
    const randomCrop = appData.crops[Math.floor(Math.random() * appData.crops.length)];
    showToast('info', 'QR Scanned', `Scanning product ${randomCrop.id}...`);
    
    setTimeout(() => {
      showProductJourney(randomCrop.id);
      showToast('success', 'Product Verified', `${randomCrop.type} verified as authentic!`);
    }, 1500);
  }
  
  function showProductJourney(cropId) {
    console.log('Showing product journey for:', cropId);
    const crop = appData.crops.find(c => c.id === cropId);
    if (!crop) {
      showToast('error', 'Product Not Found', 'The specified product could not be found in our system');
      return;
    }
  
    const farmer = appData.farmers.find(f => f.id === crop.farmerId);
    const productJourney = document.getElementById('productJourney');
    
    if (productJourney) {
      productJourney.innerHTML = `
        <div class="journey-header">
          <h2><i class="fas fa-route"></i> Product Journey</h2>
          <p>${crop.type} - ${crop.variety}</p>
          <div style="margin-top: 12px;">
            <span class="status status--${crop.status.toLowerCase()}">${crop.status}</span>
          </div>
        </div>
        
        <div class="journey-stages">
          <div class="journey-stage">
            <div class="stage-icon" style="background: #10B981;">
              <i class="fas fa-seedling"></i>
            </div>
            <h4>Farm</h4>
            <p>Origin Verified</p>
          </div>
          <div class="journey-stage">
            <div class="stage-icon" style="background: #3B82F6;">
              <i class="fas fa-truck"></i>
            </div>
            <h4>Distribution</h4>
            <p>In Transit</p>
          </div>
          <div class="journey-stage">
            <div class="stage-icon" style="background: #F59E0B;">
              <i class="fas fa-store"></i>
            </div>
            <h4>Retail</h4>
            <p>Quality Verified</p>
          </div>
          <div class="journey-stage">
            <div class="stage-icon" style="background: #8B5CF6;">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h4>Consumer</h4>
            <p>Ready for Purchase</p>
          </div>
        </div>
        
        <div class="journey-details">
          <div class="detail-card">
            <h4><i class="fas fa-tractor"></i> Farm Details</h4>
            <p><strong>Farmer:</strong> ${farmer ? farmer.name : 'Unknown'}</p>
            <p><strong>Location:</strong> ${farmer ? farmer.location : 'Unknown'}</p>
            <p><strong>Certification:</strong> ${farmer ? farmer.certification : 'Unknown'}</p>
            <p><strong>Established:</strong> ${farmer ? farmer.established : 'Unknown'}</p>
          </div>
          
          <div class="detail-card">
            <h4><i class="fas fa-leaf"></i> Product Details</h4>
            <p><strong>Type:</strong> ${crop.type}</p>
            <p><strong>Variety:</strong> ${crop.variety}</p>
            <p><strong>Harvest Date:</strong> ${formatDate(crop.harvestDate)}</p>
            <p><strong>Quality Grade:</strong> ${crop.qualityGrade}</p>
            <p><strong>Quantity:</strong> ${crop.quantity}</p>
          </div>
          
          <div class="detail-card">
            <h4><i class="fas fa-link"></i> Blockchain Verification</h4>
            <p><strong>Product ID:</strong> ${crop.id}</p>
            <p><strong>Blockchain Hash:</strong></p>
            <code style="font-size: 10px; word-break: break-all;">${crop.blockchainHash}</code>
            <p><strong>IPFS Hash:</strong> ${crop.ipfsHash}</p>
            <p><strong>Certifications:</strong> ${crop.certifications ? crop.certifications.join(', ') : 'N/A'}</p>
          </div>
          
          <div class="detail-card">
            <h4><i class="fas fa-history"></i> Transaction History</h4>
            ${appData.blockchainEvents
              .filter(event => event.cropId === cropId)
              .map(event => `
                <div style="margin-bottom: 12px; padding: 8px; background: var(--color-bg-3); border-radius: 6px;">
                  <p style="margin: 0;"><strong>${event.type}</strong> ${event.icon}</p>
                  <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">
                    ${formatDate(event.timestamp)} | Block: ${event.blockNumber}
                  </p>
                  <code style="font-size: 10px;">${event.txHash}</code>
                </div>
              `).join('')}
          </div>
        </div>
      `;
      
      productJourney.classList.remove('hidden');
      console.log('Product journey displayed for crop:', cropId);
    }
  }
  
  async function viewQRCode(cropId) {
    const qrCodeBody = document.getElementById('qrCodeBody');
    if (qrCodeBody) {
        qrCodeBody.innerHTML = '<p>Loading QR Code...</p>';
        showModal('qrCodeModal');

        try {
            if (!provenanceContract) {
                await connectWallet();
                if (!provenanceContract) {
                    showToast('error', 'Wallet Error', 'Please connect wallet to generate QR code.');
                    qrCodeBody.innerHTML = '<p>Error: Wallet not connected.</p>';
                    return;
                }
            }

            const batch = await provenanceContract.getBatch(cropId);
            const ipfsData = JSON.parse(batch[2]);

            const details = [
                `Product ID: ${cropId}`,
                `Type: ${ipfsData.type}`,
                `Variety: ${ipfsData.variety}`,
                `Harvest Date: ${formatDate(ipfsData.harvestDate)}`,
                `Quantity: ${ipfsData.quantity} kg`,
                `Grade: ${ipfsData.qualityGrade}`,
                `Price: ₹${ipfsData.price}/kg`,
                `Location: ${ipfsData.location}`,
                `Farmer: ${batch[1]}`
            ].join('\n');

            qrCodeBody.innerHTML = '';
            const qr = qrcode(0, 'M');
            qr.addData(details);
            qr.make();
            qrCodeBody.innerHTML = qr.createImgTag(4, 16);

        } catch (error) {
            console.error('Error generating QR code:', error);
            showToast('error', 'Blockchain Error', 'Could not generate QR code.');
            qrCodeBody.innerHTML = '<p>Error generating QR code. See console for details.</p>';
        }
    }
  }

  // Toast Notifications
  function showToast(type, title, message, duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
  
    const toastId = `toast_${Date.now()}`;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = toastId;
    
    const icons = {
      success: '✅',
      error: '❌', 
      warning: '⚠️',
      info: 'ℹ️'
    };
  
    toast.innerHTML = `
      <div class="toast-header">
        <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
        <div class="toast-title">${title}</div>
        <button class="toast-close" onclick="hideToast('${toastId}')">&times;</button>
      </div>
      <div class="toast-message">${message}</div>
    `;
  
    toastContainer.appendChild(toast);
  
    // Auto-hide after duration
    setTimeout(() => hideToast(toastId), duration);
  }
  
  function hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.style.animation = 'slideOut 0.3s ease-in-out forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }
  
  // Blockchain Simulation
  function startBlockchainSimulation() {
    // Simulate real-time blockchain events
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        simulateBlockchainEvent();
      }
    }, 8000);
  }
  
  function simulateBlockchainEvent() {
    const eventTypes = ['BatchCreated', 'BidPlaced', 'DeliveryConfirmed', 'PaymentReleased', 'QualityVerified'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const randomCrop = appData.crops[Math.floor(Math.random() * appData.crops.length)];
    
    const event = createBlockchainEvent(eventType, randomCrop.id);
    appData.blockchainEvents.unshift(event);
    
    // Keep only last 20 events
    if (appData.blockchainEvents.length > 20) {
      appData.blockchainEvents = appData.blockchainEvents.slice(0, 20);
    }
    
    // Update blockchain explorer if visible
    if (currentState.role === 'admin') {
      loadBlockchainEvents();
    }
    
    // Show notification for important events
    if (['BidPlaced', 'DeliveryConfirmed', 'PaymentReleased'].includes(eventType)) {
      const messages = {
        'BidPlaced': 'New bid placed on marketplace',
        'DeliveryConfirmed': 'Product delivery confirmed',
        'PaymentReleased': 'Smart provenanceContract payment released'
      };
      
      showToast('info', 'Blockchain Event', messages[eventType] || 'New blockchain transaction confirmed');
    }
  }
  
  function createBlockchainEvent(type, cropId) {
    const icons = {
      'BatchCreated': '📦',
      'BidPlaced': '🚚',
      'DeliveryConfirmed': '✅',
      'PaymentReleased': '💰',
      'QualityVerified': '🛡️'
    };
  
    return {
      id: `event_${Date.now()}`,
      type: type,
      cropId: cropId,
      txHash: generateTransactionHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 18567000,
      timestamp: new Date().toISOString(),
      gasUsed: (Math.random() * 0.01 + 0.001).toFixed(4) + ' ETH',
      status: 'Confirmed',
      icon: icons[type] || '🔗'
    };
  }
  
  // Utility Functions
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function generateHash() {
    return '0x' + Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
  
  function generateIPFSHash() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'Qm';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  function generateTransactionHash() {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
  
  // --- Provenance dApp Functions ---
  
  function setupProvenanceEventListeners() {
      const connectButton = document.getElementById('connectButton');
      const registerBatchButton = document.getElementById('registerBatchButton');
      const getBatchButton = document.getElementById('getBatchButton');
      const transferButton = document.getElementById('transferButton');
      const getBatchCountButton = document.getElementById('getBatchCountButton');
      const testDbButton = document.getElementById('testDbButton');
      const createUserForm = document.getElementById('createUserForm');
      const refreshUsersButton = document.getElementById('refreshUsersButton');
  
      if(connectButton) connectButton.addEventListener('click', connectWallet);
      if(registerBatchButton) registerBatchButton.addEventListener('click', registerBatch);
      if(getBatchButton) getBatchButton.addEventListener('click', getBatch);
      if(transferButton) transferButton.addEventListener('click', transferOwnership);
      if(getBatchCountButton) getBatchCountButton.addEventListener('click', getBatchCount);
      if(testDbButton) testDbButton.addEventListener('click', testDbConnection);
      if(createUserForm) createUserForm.addEventListener('submit', createUser);
      if(refreshUsersButton) refreshUsersButton.addEventListener('click', fetchUsers);
  }
  
  function loadProvenanceDashboard() {
      console.log("Loading provenance dashboard");
      fetchUsers();
  }
  
  function setupBlockchainEventListeners() {
    if (!provenanceContract) return;

    console.log('Setting up blockchain event listeners...');

    provenanceContract.on('BatchRegistered', (id, farmer) => {
        console.log('Event: BatchRegistered', { id, farmer });
        showToast('info', 'New Batch Registered', `A new crop (ID: ${id}) has been registered by ${farmer.substring(0, 6)}...`);
        
        // Refresh the crop lists if the user is on a relevant dashboard
        if (currentState.role === 'farmer' || currentState.role === 'distributor' || currentState.role === 'retailer') {
            loadDashboardData(currentState.role);
        }
    });

    provenanceContract.on('OwnershipTransferred', (id, from, to) => {
        console.log('Event: OwnershipTransferred', { id, from, to });
        showToast('info', 'Ownership Transferred', `Ownership of crop ${id} transferred to ${to.substring(0, 6)}...`);

        // Potentially refresh data if viewing the specific batch
        // For now, a toast is sufficient for real-time feedback.
    });
  }

  async function connectWallet() {
      if (typeof window.ethereum === 'undefined') {
          alert('MetaMask is not installed!');
          return;
      }
  
      try {
          console.log("Using Provenance address:", provenanceAddress);
          console.log("Using Auction address:", auctionAddress);

          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
  
          // Check the network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (parseInt(chainId, 16).toString() !== hardhatNetworkId) {
              try {
                  // Try to switch to the Hardhat network
                  await window.ethereum.request({
                      method: 'wallet_switchEthereumChain',
                      params: [{ chainId: `0x${parseInt(hardhatNetworkId, 10).toString(16)}` }],
                  });
              } catch (switchError) {
                  // This error code indicates that the chain has not been added to MetaMask.
                  if (switchError.code === 4902) {
                      try {
                          await window.ethereum.request({
                              method: 'wallet_addEthereumChain',
                              params: [
                                  {
                                      chainId: `0x${parseInt(hardhatNetworkId, 10).toString(16)}`,
                                      chainName: 'Hardhat Localhost',
                                      rpcUrls: ['http://127.0.0.1:8545'],
                                      nativeCurrency: {
                                          name: 'Ethereum',
                                          symbol: 'ETH',
                                          decimals: 18,
                                      },
                                  },
                              ],
                          });
                      } catch (addError) {
                          console.error('Failed to add the Hardhat network:', addError);
                          alert('Failed to add the Hardhat network. Please add it manually.');
                          return;
                      }
                  } else {
                      console.error('Failed to switch to the Hardhat network:', switchError);
                      alert('Failed to switch to the Hardhat network.');
                      return;
                  }
              }
          }
  
  
          // Set up provider and signer
          provider = new ethers.BrowserProvider(window.ethereum);
          signer = await provider.getSigner();
          provenanceContract = new ethers.Contract(provenanceAddress, ProvenanceABI.abi, signer);
          auctionContract = new ethers.Contract(auctionAddress, AuctionABI.abi, signer);
          window.provenanceContract = provenanceContract; // Expose provenanceContract globally for debugging
          window.auctionContract = auctionContract; // Expose provenanceContract globally for debugging
  
          const address = await signer.getAddress();
          
          // Update UI
          const statusEl = document.getElementById('status');
          const accountEl = document.getElementById('account');
          const connectButton = document.getElementById('connectButton');
          if(statusEl) statusEl.textContent = 'Connected';
          if(accountEl) accountEl.textContent = address;
          if(connectButton) {
              connectButton.textContent = 'Wallet Connected';
              connectButton.disabled = true;
          }

          // Setup event listeners
          setupBlockchainEventListeners();
  
          console.log('Wallet connected:', address);
          console.log('Contract instance:', provenanceContract); // New line for debugging
      } catch (error) {
          console.error('Failed to connect wallet:', error);
          alert('Failed to connect wallet.');
      }
  }
  
  async function registerBatch() {
      if (!provenanceContract) {
          alert('Please connect your wallet first.');
          return;
      }
  
      // This function is for the Provenance dashboard, which has a simple IPFS hash input.
      // We will create a dummy JSON object for it.
      const ipfsHashFromInput = document.getElementById('ipfsHash').value;
      if (!ipfsHashFromInput) {
          alert('Please enter an IPFS hash.');
          return;
      }

      const dummyCropData = {
        type: "Dummy Crop",
        variety: "From Provenance dApp",
        harvestDate: new Date().toISOString(),
        quantity: "100",
        qualityGrade: "A",
        price: "50",
        location: "Provenance Test"
      };

      const ipfsHash = JSON.stringify(dummyCropData);
  
      try {
          const tx = await provenanceContract.registerBatch(ipfsHash);
          const batchDetailsEl = document.getElementById('batchDetails');
          if(batchDetailsEl) batchDetailsEl.textContent = `Transaction sent: ${tx.hash}...\nWaiting for confirmation...`;
          await tx.wait();
          if(batchDetailsEl) batchDetailsEl.textContent = `Batch registered successfully!\nTransaction hash: ${tx.hash}`;
          document.getElementById('ipfsHash').value = ''; // Clear input
      } catch (error) {
          console.error('Error registering batch:', error);
          const batchDetailsEl = document.getElementById('batchDetails');
          if(batchDetailsEl) batchDetailsEl.textContent = `Error: ${error.message}`;
      }
  }
  
  async function getBatch() {
      if (!provenanceContract) {
          alert('Please connect your wallet first.');
          return;
      }
  
      const batchId = document.getElementById('batchId').value;
      if (!batchId) {
          alert('Please enter a Batch ID.');
          return;
      }
  
      try {
          const result = await provenanceContract.getBatch(batchId);
          const [id, farmer, ipfsHash, owners, timestamps] = result;
  
          const formattedOwners = owners.join('\n  ');
          const formattedTimestamps = timestamps.map(ts => new Date(Number(ts) * 1000).toLocaleString()).join('\n  ');
          
          const batchDetailsEl = document.getElementById('batchDetails');
          if(batchDetailsEl) batchDetailsEl.textContent = 
  `Batch Details (ID: ${id}):\n` +
  `---------------------------\n` +
  `Farmer: ${farmer}\n` +
  `IPFS Hash: ${ipfsHash}\n\n` +
  `Ownership History:\n  ${formattedOwners}\n\n` +
  `Timestamps:\n  ${formattedTimestamps}`;
  
      } catch (error) {
          console.error('Error fetching batch:', error);
          const batchDetailsEl = document.getElementById('batchDetails');
          if(batchDetailsEl) batchDetailsEl.textContent = `Error: ${error.message}`;
      }
  }
  
  async function transferOwnership() {
      if (!provenanceContract) {
          alert('Please connect your wallet first.');
          return;
      }
  
      const batchId = document.getElementById('transferBatchId').value;
      const toAddress = document.getElementById('toAddress').value;
  
      if (!batchId || !toAddress) {
          alert('Please enter both Batch ID and a valid address.');
          return;
      }
  
      if (!ethers.isAddress(toAddress)) {
          alert('Invalid Ethereum address.');
          return;
      }
  
      try {
          const tx = await provenanceContract.transferOwnership(batchId, toAddress);
          const batchDetailsEl = document.getElementById('batchDetails');
          if(batchDetailsEl) batchDetailsEl.textContent = `Transfer transaction sent: ${tx.hash}...\nWaiting for confirmation...`;
          await tx.wait();
          if(batchDetailsEl) batchDetailsEl.textContent = `Ownership transferred successfully for batch ${batchId} to ${toAddress}`;
          document.getElementById('transferBatchId').value = '';
          document.getElementById('toAddress').value = '';
      } catch (error) {
          console.error('Error transferring ownership:', error);
          const batchDetailsEl = document.getElementById('batchDetails');
          if(batchDetailsEl) batchDetailsEl.textContent = `Error: ${error.message}`;
      }
  }
  
  
  // --- Functions -- -
  
  // New function to get batch count
  async function getBatchCount() {
      if (!provenanceContract) {
          alert('Please connect your wallet first.');
          return;
      }
      try {
          const count = await provenanceContract.batchCount();
          const batchDetailsEl = document.getElementById('batchDetails');
          if(batchDetailsEl) batchDetailsEl.textContent = `Total Batches: ${count.toString()}`;
      } catch (error) {
          console.error('Error fetching batch count:', error);
          const batchDetailsEl = document.getElementById('batchDetails');
          if(batchDetailsEl) batchDetailsEl.textContent = `Error: ${error.message}`;
      }
  }
  
  // --- Database Interaction Functions ---
  
  function showMessage(message, type = 'success') {
      const messagesEl = document.getElementById('messages');
      if(messagesEl) {
          messagesEl.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
          setTimeout(() => {
              messagesEl.innerHTML = '';
          }, 5000);
      }
  }
  
  async function testDbConnection() {
      try {
          const response = await fetch('http://localhost:3000/test-db');
          const data = await response.json();
          const testDbStatusEl = document.getElementById('testDbStatus');
          if (response.ok) {
              if(testDbStatusEl) testDbStatusEl.textContent = `DB Status: ${data.message} (Time: ${new Date(data.currentTime).toLocaleString()})`;
              if(testDbStatusEl) testDbStatusEl.style.color = 'green';
          } else {
              if(testDbStatusEl) testDbStatusEl.textContent = `DB Status: Error - ${data.error}`;
              if(testDbStatusEl) testDbStatusEl.style.color = 'red';
          }
      } catch (error) {
          console.error('Error testing DB connection:', error);
          const testDbStatusEl = document.getElementById('testDbStatus');
          if(testDbStatusEl) testDbStatusEl.textContent = `DB Status: Network Error - ${error.message}`;
          if(testDbStatusEl) testDbStatusEl.style.color = 'red';
      }
  }
  
  async function createUser(event) {
      event.preventDefault();
      const createUserForm = document.getElementById('createUserForm');
      const username = createUserForm.username.value;
      const password = createUserForm.password.value;
      const role = createUserForm.role.value;
  
      try {
          const response = await fetch('http://localhost:3000/users', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password, role }),
          });
          const data = await response.json();
          if (response.ok) {
              showMessage(data.message, 'success');
              createUserForm.reset();
              fetchUsers(); // Refresh user list
          } else {
              showMessage(`Error: ${data.error}`, 'error');
          }
      } catch (error) {
          console.error('Error creating user:', error);
          showMessage(`Network Error: ${error.message}`, 'error');
      }
  }
  
  async function fetchUsers() {
      try {
          const response = await fetch('http://localhost:3000/users');
          const data = await response.json();
          const userListEl = document.getElementById('userList');
          if (response.ok) {
              if(userListEl) userListEl.innerHTML = ''; // Clear existing list
              if (data.users && data.users.length > 0) {
                  const ul = document.createElement('ul');
                  data.users.forEach(user => {
                      const li = document.createElement('li');
                      li.textContent = `ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Created: ${new Date(user.created_at).toLocaleString()}`;
                      ul.appendChild(li);
                  });
                  if(userListEl) userListEl.appendChild(ul);
              } else {
                  if(userListEl) userListEl.innerHTML = '<p>No users yet.</p>';
              }
          }
      } catch (error) {
          console.error('Error fetching users:', error);
          showMessage(`Network Error fetching users: ${error.message}`, 'error');
      }
  }
  
  
  // Global functions for onclick handlers
  window.showBidModal = showBidModal;
  window.viewQRCode = viewQRCode;
  window.hideToast = hideToast;
  
  console.log('AgriTrace: Advanced blockchain agricultural traceability system loaded successfully! 🌾🔗');