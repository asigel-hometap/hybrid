// Initialize chart
let loanChart;
let currentPrincipal;
let currentAppreciationShare;

// Register the datalabels plugin
Chart.register(ChartDataLabels);

// DOM Elements
const principalInput = document.getElementById('principal');
const homeValueInput = document.getElementById('homeValue');
const appreciationSelect = document.getElementById('appreciation');
const durationSelect = document.getElementById('duration');
const monthlyPaymentDisplay = document.getElementById('monthlyPayment');
const chartCanvas = document.getElementById('loanChart');
const calculateBtn = document.getElementById('calculateBtn');
const prepaymentInput = document.getElementById('prepayment');
const calculatePrepaymentBtn = document.getElementById('calculatePrepaymentBtn');
const newMonthlyPaymentDisplay = document.getElementById('newMonthlyPayment');
const monthlySavingsDisplay = document.getElementById('monthlySavings');

// Constants
const INTEREST_RATE = 0.045; // 4.5% annual interest rate
const APPRECIATION_SHARE = 0.06; // 6% share of appreciation

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate monthly payment
function calculateMonthlyPayment(principal) {
    return (principal * INTEREST_RATE) / 12;
}

// Calculate final home value with appreciation
function calculateFinalHomeValue(initialValue, appreciationRate, years) {
    return initialValue * Math.pow(1 + appreciationRate, years);
}

// Calculate appreciation share
function calculateAppreciationShare(initialValue, finalValue) {
    return finalValue * APPRECIATION_SHARE;
}

// Update chart
function updateChart(principal, appreciationShare, isPrepayment = false) {
    const ctx = chartCanvas.getContext('2d');
    
    if (loanChart) {
        loanChart.destroy();
    }

    // Store current values if not a prepayment calculation
    if (!isPrepayment) {
        currentPrincipal = principal;
        currentAppreciationShare = appreciationShare;
    }

    loanChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Final Payment Breakdown'],
            datasets: [
                {
                    label: `Principal (${formatCurrency(principal)})`,
                    data: [principal],
                    backgroundColor: '#3498db',
                    stack: 'Stack 0'
                },
                {
                    label: `Appreciation Share (${formatCurrency(appreciationShare)})`,
                    data: [appreciationShare],
                    backgroundColor: '#2ecc71',
                    stack: 'Stack 0'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    display: false
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}`;
                        }
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                datalabels: {
                    color: 'white',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: function(value) {
                        return formatCurrency(value);
                    },
                    anchor: 'center',
                    align: 'center',
                    offset: 0,
                    display: function(context) {
                        return context.dataset.data[context.dataIndex] > 0;
                    }
                }
            }
        }
    });
}

// Update calculations
function updateCalculations() {
    const principal = parseFloat(principalInput.value);
    const homeValue = parseFloat(homeValueInput.value);
    const appreciationRate = parseFloat(appreciationSelect.value);
    const duration = parseInt(durationSelect.value);

    // Calculate values
    const monthlyPayment = calculateMonthlyPayment(principal);
    const finalHomeValue = calculateFinalHomeValue(homeValue, appreciationRate, duration);
    const appreciationShare = calculateAppreciationShare(homeValue, finalHomeValue);

    // Update display
    monthlyPaymentDisplay.textContent = formatCurrency(monthlyPayment);
    updateChart(principal, appreciationShare);

    // Log calculations for debugging
    console.log('Calculation Details:', {
        principal,
        homeValue,
        appreciationRate,
        duration,
        monthlyPayment,
        finalHomeValue,
        appreciationShare,
        totalPayment: principal + appreciationShare
    });
}

// Calculate prepayment impact
function calculatePrepayment() {
    const prepaymentAmount = parseFloat(prepaymentInput.value) || 0;
    const duration = parseInt(durationSelect.value);
    
    if (prepaymentAmount <= 0 || prepaymentAmount >= currentPrincipal) {
        alert('Please enter a valid prepayment amount less than the current principal.');
        return;
    }

    // Calculate new values
    const newPrincipal = currentPrincipal - prepaymentAmount;
    const newMonthlyPayment = calculateMonthlyPayment(newPrincipal);
    const originalMonthlyPayment = calculateMonthlyPayment(currentPrincipal);
    const monthlySavings = originalMonthlyPayment - newMonthlyPayment;
    const totalSavings = monthlySavings * duration * 12;

    // Update displays
    newMonthlyPaymentDisplay.textContent = formatCurrency(newMonthlyPayment);
    monthlySavingsDisplay.textContent = formatCurrency(totalSavings);
    
    // Update chart with new principal
    updateChart(newPrincipal, currentAppreciationShare, true);

    // Log calculations for debugging
    console.log('Prepayment Details:', {
        originalPrincipal: currentPrincipal,
        prepaymentAmount,
        newPrincipal,
        originalMonthlyPayment,
        newMonthlyPayment,
        monthlySavings,
        monthsRemaining: duration * 12,
        totalSavings
    });
}

// Add event listeners
calculateBtn.addEventListener('click', updateCalculations);
calculatePrepaymentBtn.addEventListener('click', calculatePrepayment);

// Initial calculation
updateCalculations(); 