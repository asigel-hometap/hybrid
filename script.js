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
const endingHomeValueDisplay = document.getElementById('endingHomeValue');
const totalCostDisplay = document.getElementById('totalCost');
const capAmountDisplay = document.getElementById('capAmount');
const costPrincipalDisplay = document.getElementById('costPrincipal');
const costAppreciationDisplay = document.getElementById('costAppreciation');
const appreciationSharePercentageDisplay = document.getElementById('appreciationSharePercentage');
const costInterestDisplay = document.getElementById('costInterest');
const valueBasisDisplay = document.getElementById('valueBasis');
const totalPayoutDisplay = document.getElementById('totalPayout');
const payoutPrincipalDisplay = document.getElementById('payoutPrincipal');
const payoutInterestDisplay = document.getElementById('payoutInterest');
const payoutAppreciationDisplay = document.getElementById('payoutAppreciation');
const capAdjustmentDetails = document.getElementById('capAdjustmentDetails');
const originalAppreciationDisplay = document.getElementById('originalAppreciation');
const appreciationDiscountDisplay = document.getElementById('appreciationDiscount');
const chartCanvas = document.getElementById('loanChart');
const calculateBtn = document.getElementById('calculateBtn');
const prepaymentInput = document.getElementById('prepayment');
const calculatePrepaymentBtn = document.getElementById('calculatePrepaymentBtn');
const newMonthlyPaymentDisplay = document.getElementById('newMonthlyPayment');
const monthlySavingsDisplay = document.getElementById('monthlySavings');

// Constants
const INTEREST_RATE = 0.045; // 4.5% annual interest rate
const MONTHLY_COMPOUND_RATE = 0.0125; // 1.25% monthly compound rate
const APPRECIATION_SHARE_MULTIPLIER = 0.60; // 60% of investment percentage

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
function calculateAppreciationShare(principal, initialHomeValue, finalHomeValue) {
    const investmentPercentage = (principal / initialHomeValue) * APPRECIATION_SHARE_MULTIPLIER;
    return finalHomeValue * investmentPercentage;
}

// Calculate total cost
function calculateTotalCost(principal, monthlyPayment, duration, appreciationShare) {
    const totalMonths = duration * 12;
    const valueBasis = calculateValueBasis(monthlyPayment, totalMonths);
    return principal + appreciationShare + valueBasis;
}

// Calculate value basis of interest payments
function calculateValueBasis(monthlyPayment, totalMonths) {
    let totalValue = 0;
    
    // For each payment, calculate its future value
    for (let month = 1; month <= totalMonths; month++) {
        // Number of compounding periods for this payment
        const remainingMonths = totalMonths - month;
        // Future value of this payment
        const futureValue = monthlyPayment * Math.pow(1 + MONTHLY_COMPOUND_RATE, remainingMonths);
        totalValue += futureValue;
    }
    
    return totalValue;
}

// Calculate cap amount
function calculateCap(principal, duration) {
    const totalMonths = duration * 12;
    return principal * Math.pow(1 + MONTHLY_COMPOUND_RATE, totalMonths);
}

// Calculate total payout
function calculateTotalPayout(principal, duration, appreciationShare, totalCost, capAmount) {
    const monthlyPayment = principal * INTEREST_RATE / 12;
    const cumulativeInterest = monthlyPayment * 12 * duration;
    
    let adjustedAppreciationShare = appreciationShare;
    let appreciationDiscount = 0;
    
    if (totalCost >= capAmount) {
        appreciationDiscount = totalCost - capAmount;
        adjustedAppreciationShare = appreciationShare - appreciationDiscount;
    }

    const totalPayout = principal + cumulativeInterest + adjustedAppreciationShare;

    return {
        totalPayout,
        components: {
            principal,
            cumulativeInterest,
            appreciationShare: adjustedAppreciationShare,
            originalAppreciationShare: appreciationShare,
            appreciationDiscount: appreciationDiscount
        }
    };
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
function updateCalculations(updateChartDisplay = true) {
    const principal = parseFloat(principalInput.value);
    const homeValue = parseFloat(homeValueInput.value);
    const appreciationRate = parseFloat(appreciationSelect.value);
    const duration = parseInt(durationSelect.value);
    const totalMonths = duration * 12;

    // Calculate values
    const monthlyPayment = calculateMonthlyPayment(principal);
    const finalHomeValue = calculateFinalHomeValue(homeValue, appreciationRate, duration);
    const investmentPercentage = (principal / homeValue) * APPRECIATION_SHARE_MULTIPLIER;
    const appreciationShare = calculateAppreciationShare(principal, homeValue, finalHomeValue);
    const valueBasis = calculateValueBasis(monthlyPayment, totalMonths);
    const totalCost = principal + appreciationShare + valueBasis;
    const capAmount = calculateCap(principal, duration);
    const payout = calculateTotalPayout(principal, duration, appreciationShare, totalCost, capAmount);

    // Update display
    monthlyPaymentDisplay.textContent = formatCurrency(monthlyPayment);
    endingHomeValueDisplay.textContent = formatCurrency(finalHomeValue);
    totalCostDisplay.textContent = formatCurrency(totalCost);
    capAmountDisplay.textContent = formatCurrency(capAmount);
    
    // Highlight the lower amount
    totalCostDisplay.classList.remove('lower');
    capAmountDisplay.classList.remove('lower');
    if (totalCost < capAmount) {
        totalCostDisplay.classList.add('lower');
    } else {
        capAmountDisplay.classList.add('lower');
    }

    costPrincipalDisplay.textContent = formatCurrency(principal);
    costAppreciationDisplay.textContent = formatCurrency(appreciationShare);
    appreciationSharePercentageDisplay.textContent = (investmentPercentage * 100).toFixed(2) + '%';
    costInterestDisplay.textContent = formatCurrency(valueBasis);
    valueBasisDisplay.textContent = formatCurrency(valueBasis);

    // Update total payout display
    totalPayoutDisplay.textContent = formatCurrency(payout.totalPayout);
    payoutPrincipalDisplay.textContent = formatCurrency(payout.components.principal);
    payoutInterestDisplay.textContent = formatCurrency(payout.components.cumulativeInterest);
    payoutAppreciationDisplay.textContent = formatCurrency(payout.components.appreciationShare);

    // Show/hide and update cap adjustment details
    if (totalCost >= capAmount) {
        capAdjustmentDetails.style.display = 'block';
        originalAppreciationDisplay.textContent = formatCurrency(payout.components.originalAppreciationShare);
        appreciationDiscountDisplay.textContent = '-' + formatCurrency(payout.components.appreciationDiscount);
    } else {
        capAdjustmentDetails.style.display = 'none';
    }

    if (updateChartDisplay) {
        updateChart(principal, appreciationShare);
    }

    // Log calculations for debugging
    console.log('Calculation Details:', {
        principal,
        homeValue,
        appreciationRate,
        duration,
        monthlyPayment,
        finalHomeValue,
        investmentPercentage: (investmentPercentage * 100).toFixed(2) + '%',
        appreciationShare,
        valueBasis,
        totalCost,
        capAmount,
        totalPayout: payout.totalPayout,
        payoutComponents: payout.components,
        components: {
            principal: principal,
            appreciationShare: appreciationShare,
            interestPayments: valueBasis
        }
    });
}

// Handle input changes without updating chart
function handleInputChange() {
    const principal = parseFloat(principalInput.value);
    const homeValue = parseFloat(homeValueInput.value);
    const appreciationRate = parseFloat(appreciationSelect.value);
    const duration = parseInt(durationSelect.value);
    const totalMonths = duration * 12;

    // Calculate values
    const monthlyPayment = calculateMonthlyPayment(principal);
    const finalHomeValue = calculateFinalHomeValue(homeValue, appreciationRate, duration);
    const investmentPercentage = (principal / homeValue) * APPRECIATION_SHARE_MULTIPLIER;
    const appreciationShare = calculateAppreciationShare(principal, homeValue, finalHomeValue);
    const valueBasis = calculateValueBasis(monthlyPayment, totalMonths);
    const totalCost = principal + appreciationShare + valueBasis;
    const capAmount = calculateCap(principal, duration);
    const payout = calculateTotalPayout(principal, duration, appreciationShare, totalCost, capAmount);

    // Update display
    monthlyPaymentDisplay.textContent = formatCurrency(monthlyPayment);
    endingHomeValueDisplay.textContent = formatCurrency(finalHomeValue);
    totalCostDisplay.textContent = formatCurrency(totalCost);
    capAmountDisplay.textContent = formatCurrency(capAmount);
    
    // Highlight the lower amount
    totalCostDisplay.classList.remove('lower');
    capAmountDisplay.classList.remove('lower');
    if (totalCost < capAmount) {
        totalCostDisplay.classList.add('lower');
    } else {
        capAmountDisplay.classList.add('lower');
    }

    costPrincipalDisplay.textContent = formatCurrency(principal);
    costAppreciationDisplay.textContent = formatCurrency(appreciationShare);
    appreciationSharePercentageDisplay.textContent = (investmentPercentage * 100).toFixed(2) + '%';
    costInterestDisplay.textContent = formatCurrency(valueBasis);
    valueBasisDisplay.textContent = formatCurrency(valueBasis);

    // Update total payout display
    totalPayoutDisplay.textContent = formatCurrency(payout.totalPayout);
    payoutPrincipalDisplay.textContent = formatCurrency(payout.components.principal);
    payoutInterestDisplay.textContent = formatCurrency(payout.components.cumulativeInterest);
    payoutAppreciationDisplay.textContent = formatCurrency(payout.components.appreciationShare);

    // Show/hide and update cap adjustment details
    if (totalCost >= capAmount) {
        capAdjustmentDetails.style.display = 'block';
        originalAppreciationDisplay.textContent = formatCurrency(payout.components.originalAppreciationShare);
        appreciationDiscountDisplay.textContent = '-' + formatCurrency(payout.components.appreciationDiscount);
    } else {
        capAdjustmentDetails.style.display = 'none';
    }

    // Store current values for chart
    currentPrincipal = principal;
    currentAppreciationShare = appreciationShare;

    // Log calculations for debugging
    console.log('Input Change Details:', {
        principal,
        homeValue,
        appreciationRate,
        duration,
        monthlyPayment,
        finalHomeValue,
        investmentPercentage: (investmentPercentage * 100).toFixed(2) + '%',
        appreciationShare,
        valueBasis,
        totalCost,
        capAmount,
        totalPayout: payout.totalPayout,
        payoutComponents: payout.components,
        currentPrincipal,
        currentAppreciationShare
    });
}

// Calculate prepayment impact
function calculatePrepayment() {
    const prepaymentAmount = parseFloat(prepaymentInput.value) || 0;
    const duration = parseInt(durationSelect.value);
    const homeValue = parseFloat(homeValueInput.value);
    const appreciationRate = parseFloat(appreciationSelect.value);
    
    if (prepaymentAmount <= 0 || prepaymentAmount >= currentPrincipal) {
        alert('Please enter a valid prepayment amount less than the current principal.');
        return;
    }

    // Calculate new values
    const newPrincipal = currentPrincipal - prepaymentAmount;
    const finalHomeValue = calculateFinalHomeValue(homeValue, appreciationRate, duration);
    const newAppreciationShare = calculateAppreciationShare(newPrincipal, homeValue, finalHomeValue);
    const newMonthlyPayment = calculateMonthlyPayment(newPrincipal);
    const originalMonthlyPayment = calculateMonthlyPayment(currentPrincipal);
    const monthlySavings = originalMonthlyPayment - newMonthlyPayment;
    const totalSavings = monthlySavings * duration * 12;

    // Update displays
    newMonthlyPaymentDisplay.textContent = formatCurrency(newMonthlyPayment);
    monthlySavingsDisplay.textContent = formatCurrency(totalSavings);
    
    // Update chart with new principal and appreciation share
    updateChart(newPrincipal, newAppreciationShare, true);

    // Log calculations for debugging
    console.log('Prepayment Details:', {
        originalPrincipal: currentPrincipal,
        prepaymentAmount,
        newPrincipal,
        homeValue,
        finalHomeValue,
        newInvestmentPercentage: (newPrincipal / homeValue * 100).toFixed(2) + '%',
        newAppreciationShare,
        originalMonthlyPayment,
        newMonthlyPayment,
        monthlySavings,
        monthsRemaining: duration * 12,
        totalSavings
    });
}

// Add event listeners
calculateBtn.addEventListener('click', () => {
    handleInputChange(); // First update all calculations
    updateChart(currentPrincipal, currentAppreciationShare); // Then update chart
});
calculatePrepaymentBtn.addEventListener('click', calculatePrepayment);
homeValueInput.addEventListener('input', handleInputChange);

// Initial calculation
handleInputChange(); // First update all calculations
updateChart(currentPrincipal, currentAppreciationShare); // Then update chart 