# Home Equity Loan Calculator

An interactive financial calculator for a novel home equity loan product that offers lump sum payments upfront in exchange for below-market rate interest-only payments, principal repayment, and a share of home price appreciation.

## Product Overview

This calculator helps homeowners understand the financial implications of taking out a home equity loan with the following terms:
- Interest-only monthly payments at 4.5% APR
- Principal repayment at term end
- 6% share of final home value at term end

## Input Parameters

1. **Principal Amount**
   - Type: Currency input
   - Format: Whole numbers
   - Example: $100,000

2. **Home Price Appreciation**
   - Type: Picklist
   - Options:
     - No appreciation (0%)
     - 3% annual appreciation
     - 4.34% annual appreciation
     - 8% annual appreciation
     - -2.5% annual appreciation
     - Special case: -5% in years 1-2, then 3% annually

3. **Duration**
   - Type: Picklist
   - Options: 1-10 years

4. **Home Value**
   - Type: Currency input
   - Format: Whole numbers
   - Example: $600,000

## Output Display

1. **Stacked Bar Chart**
   - Bottom layer: Principal amount
   - Top layer: 6% share of final home value

2. **Monthly Payment Amount**
   - Calculated as: Principal × 4.5% ÷ 12

## Technical Implementation

This is a front-end only implementation with no backend storage requirements. The calculator will be built using:
- HTML5
- CSS3
- JavaScript
- Chart.js for visualization

## Example Calculation

Given:
- Home Value: $600,000
- Principal: $100,000
- Duration: 5 years
- Appreciation: 4.34% annually

Results:
- Monthly Payment: $375 ($100,000 × 0.045 ÷ 12)
- Final Home Value: $741,866.67 ($600,000 × (1 + 0.0434)^5)
- Appreciation Share: $44,512 ($741,866.67 × 0.06)
- Total Payment: $144,512 ($100,000 + $44,512)

## Development Plan

1. Create basic HTML structure with input fields
2. Implement input validation and formatting
3. Create calculation logic
4. Implement stacked bar chart visualization
5. Add responsive styling
6. Add error handling and user feedback

## Questions to Address

1. Should we add any additional input validation rules?
2. Would you like to include any tooltips or help text for users?
3. Should we add the ability to compare different scenarios?
4. Would you like to include any additional visualizations beyond the stacked bar chart?
5. Should we add a print or export feature for the calculations? 