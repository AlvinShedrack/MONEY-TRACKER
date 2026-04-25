// Function to get stored expenses from localStorage
function getExpensesFromStorage(provider, week) {
    const storedData = localStorage.getItem(`${provider}-week-${week}`);
    return storedData ? JSON.parse(storedData) : [];
}

// Function to save expenses to localStorage
function saveExpensesToStorage(provider, week, expenses) {
    localStorage.setItem(`${provider}-week-${week}`, JSON.stringify(expenses));
}

// Function to create the expense table for a week
function createExpenseTable(provider, week, mondayDate) {
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('week-table-container');
    tableContainer.id = `${provider}-week-${week}-table`;

    const tableHeader = document.createElement('h3');
    tableHeader.textContent = `Week ${week} - ${provider}`;
    tableHeader.style.cursor = 'pointer';
    tableHeader.addEventListener('click', () => toggleWeek(provider, week));
    tableContainer.appendChild(tableHeader);

    // Add delete button to header
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Week';
    deleteButton.addEventListener('click', () => deleteWeek(provider, week));
    tableHeader.appendChild(deleteButton);

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody></tbody>
        <tfoot>
            <tr>
                <td>Total</td>
                <td></td>
                <td id="${provider}-week-${week}-total-breakfast">0</td>
                <td id="${provider}-week-${week}-total-lunch">0</td>
                <td></td>
            </tr>
            <tr>
                <td>Combined Total</td>
                <td></td>
                <td colspan="2" id="${provider}-week-${week}-total-combined">0</td>
                <td></td>
            </tr>
        </tfoot>
    `;
    tableContainer.appendChild(table);
    document.getElementById(`${provider}-weeks`).appendChild(tableContainer);

    // Add 6 rows for Monday to Saturday
    const expenses = getExpensesFromStorage(provider, week);
    const tableBody = table.getElementsByTagName('tbody')[0];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let breakfastTotal = 0;
    let lunchTotal = 0;

    for (let i = 0; i < 6; i++) {
        const row = tableBody.insertRow();
        const dayCell = row.insertCell(0);
        const dateCell = row.insertCell(1);
        const breakfastCell = row.insertCell(2);
        const lunchCell = row.insertCell(3);
        const actionCell = row.insertCell(4);

        dayCell.textContent = daysOfWeek[i];
        
        const date = new Date(mondayDate);
        date.setDate(date.getDate() + i);
        dateCell.textContent = date.toLocaleDateString();

        // Set initial values for breakfast and lunch
        const breakfastSelect = createDropdown(expenses[i] ? expenses[i].breakfast : null);
        const lunchSelect = createDropdown(expenses[i] ? expenses[i].lunch : null);

        breakfastCell.appendChild(breakfastSelect);
        lunchCell.appendChild(lunchSelect);

        // Add event listeners to update expense when a new amount is selected
        breakfastSelect.addEventListener('change', (e) => updateMealExpense(e, provider, week, i, 'breakfast', e.target.value));
        lunchSelect.addEventListener('change', (e) => updateMealExpense(e, provider, week, i, 'lunch', e.target.value));

        // Sum totals for the week
        breakfastTotal += expenses[i] ? expenses[i].breakfast : 0;
        lunchTotal += expenses[i] ? expenses[i].lunch : 0;
    }

    // Update weekly totals
    document.getElementById(`${provider}-week-${week}-total-breakfast`).textContent = breakfastTotal;
    document.getElementById(`${provider}-week-${week}-total-lunch`).textContent = lunchTotal;
    document.getElementById(`${provider}-week-${week}-total-combined`).textContent = breakfastTotal + lunchTotal;
}

// Function to create dropdown for meal amounts
function createDropdown(selectedValue) {
    const dropdown = document.createElement('select');
    const options = [null, 500, 1000, 1500, 2000, 2500, 3000, 3500];
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option === null ? 'Select Amount' : option;
        if (option === selectedValue) {
            opt.selected = true;
        }
        dropdown.appendChild(opt);
    });
    return dropdown;
}

// Function to update the meal expense
function updateMealExpense(event, provider, week, dayIndex, mealType, amount) {
    const expenses = getExpensesFromStorage(provider, week);
    if (!expenses[dayIndex]) expenses[dayIndex] = { breakfast: null, lunch: null };

    expenses[dayIndex][mealType] = parseInt(amount);
    saveExpensesToStorage(provider, week, expenses);

    // Recalculate and update totals without re-creating the table
    let breakfastTotal = 0;
    let lunchTotal = 0;
    for (let i = 0; i < 6; i++) {
        breakfastTotal += expenses[i] ? expenses[i].breakfast : 0;
        lunchTotal += expenses[i] ? expenses[i].lunch : 0;
    }
    document.getElementById(`${provider}-week-${week}-total-breakfast`).textContent = breakfastTotal;
    document.getElementById(`${provider}-week-${week}-total-lunch`).textContent = lunchTotal;
    document.getElementById(`${provider}-week-${week}-total-combined`).textContent = breakfastTotal + lunchTotal;
}

// Function to delete a week
function deleteWeek(provider, week) {
    const confirmation = confirm(`Are you sure you want to delete Week ${week}?`);
    if (confirmation) {
        localStorage.removeItem(`${provider}-week-${week}`);
        document.getElementById(`${provider}-week-${week}-table`).remove();
    }
}

// Add new week
function addNewWeek(provider) {
    const week = document.querySelectorAll(`#${provider}-weeks .week-table-container`).length + 1;
    const mondayDate = document.getElementById(`${provider}-monday-date`).value;

    if (mondayDate) {
        createExpenseTable(provider, week, mondayDate);
    } else {
        alert('Please enter Monday\'s date first');
    }
}

// Event listeners for adding new weeks
document.getElementById('add-provider1-week').addEventListener('click', () => addNewWeek('provider1'));
document.getElementById('add-provider2-week').addEventListener('click', () => addNewWeek('provider2'));

// Function to toggle provider sections
function toggleProvider(provider) {
    const weeksContainer = document.getElementById(`${provider}-weeks`);
    weeksContainer.style.display = weeksContainer.style.display === 'none' ? 'block' : 'none';
}

// Function to toggle week tables
function toggleWeek(provider, week) {
    const table = document.querySelector(`#${provider}-week-${week}-table table`);
    table.style.display = table.style.display === 'none' ? 'table' : 'none';
}