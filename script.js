// Initialize chart
let loanChart;

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
    if (appreciationRate === 'special') {
        // Special case: -5% in years 1 and 2, then 3% annually
        let value = initialValue;
        
        // First two years: -5% each
        value *= Math.pow(1 - 0.05, 2);
        
        // Remaining years: +3% each
        if (years > 2) {
            value *= Math.pow(1 + 0.03, years - 2);
        }
        
        return value;
    }
    
    // Standard case: constant appreciation rate
    return initialValue * Math.pow(1 + appreciationRate, years);
}

// Calculate appreciation share
function calculateAppreciationShare(finalHomeValue) {
    return finalHomeValue * APPRECIATION_SHARE;
}

// Update chart
function updateChart(principal, appreciationShare) {
    const ctx = chartCanvas.getContext('2d');
    
    if (loanChart) {
        loanChart.destroy();
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
    const appreciationShare = calculateAppreciationShare(finalHomeValue);

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

    // Update display
    monthlyPaymentDisplay.textContent = formatCurrency(monthlyPayment);
    updateChart(principal, appreciationShare);
}

// Add event listener for calculate button
calculateBtn.addEventListener('click', updateCalculations);

// Initial calculation
updateCalculations(); 