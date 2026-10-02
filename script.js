// Set today's date
document.getElementById("invoiceDate").value =
    new Date().toISOString().split("T")[0];


// Add new item row
function addRow() {

    const tbody = document.getElementById("itemBody");

    const row = document.createElement("tr");

    row.innerHTML = `
        <td></td>

        <td>
            <input type="text" placeholder="Product / Service">
        </td>

        <td>
            <input type="number"
                   class="qty"
                   value="1"
                   min="1"
                   oninput="calculate()">
        </td>

        <td>
            <input type="number"
                   class="price"
                   value="0"
                   min="0"
                   oninput="calculate()">
        </td>

        <td>
            <input type="number"
                   class="tax"
                   value="0"
                   min="0"
                   oninput="calculate()">
        </td>

        <td class="row-total">
            ₹0.00
        </td>

        <td>
            <button class="delete-btn"
                    onclick="deleteRow(this)">
                Delete
            </button>
        </td>
    `;

    tbody.appendChild(row);

    updateNumbers();
    calculate();
}


// Delete item
function deleteRow(button) {

    const row = button.closest("tr");

    row.remove();

    updateNumbers();
    calculate();
}


// Update row numbers
function updateNumbers() {

    const rows = document.querySelectorAll("#itemBody tr");

    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}


// Calculate invoice
function calculate() {

    const rows = document.querySelectorAll("#itemBody tr");

    let subtotal = 0;
    let totalTax = 0;

    rows.forEach(row => {

        const qty =
            parseFloat(row.querySelector(".qty").value) || 0;

        const price =
            parseFloat(row.querySelector(".price").value) || 0;

        const tax =
            parseFloat(row.querySelector(".tax").value) || 0;

        const itemSubtotal = qty * price;

        const itemTax =
            itemSubtotal * tax / 100;

        const itemTotal =
            itemSubtotal + itemTax;

        row.querySelector(".row-total").textContent =
            formatCurrency(itemTotal);

        subtotal += itemSubtotal;

        totalTax += itemTax;
    });


    // Discount
    const discountPercent =
        parseFloat(document.getElementById("discount").value) || 0;

    const discountAmount =
        subtotal * discountPercent / 100;


    const grandTotal =
        subtotal - discountAmount + totalTax;


    document.getElementById("subtotal").textContent =
        formatCurrency(subtotal);

    document.getElementById("discountAmount").textContent =
        formatCurrency(discountAmount);

    document.getElementById("taxTotal").textContent =
        formatCurrency(totalTax);

    document.getElementById("grandTotal").textContent =
        formatCurrency(grandTotal);
}


// Currency formatter
function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(amount);
}


// Print invoice
function printInvoice() {
    window.print();
}


// Clear invoice
function clearInvoice() {

    const confirmation =
        confirm("Are you sure you want to clear the invoice?");

    if (!confirmation) {
        return;
    }

    document.querySelectorAll("input").forEach(input => {

        if (input.classList.contains("qty")) {
            input.value = 1;
        }
        else if (
            input.classList.contains("price") ||
            input.classList.contains("tax")
        ) {
            input.value = 0;
        }
        else if (input.id === "discount") {
            input.value = 0;
        }
        else {
            input.value = "";
        }
    });

    document.querySelectorAll("textarea").forEach(
        textarea => textarea.value = ""
    );

    document.getElementById("itemBody").innerHTML = `
        <tr>
            <td>1</td>

            <td>
                <input type="text" placeholder="Product / Service">
            </td>

            <td>
                <input type="number"
                       class="qty"
                       value="1"
                       min="1"
                       oninput="calculate()">
            </td>

            <td>
                <input type="number"
                       class="price"
                       value="0"
                       min="0"
                       oninput="calculate()">
            </td>

            <td>
                <input type="number"
                       class="tax"
                       value="0"
                       min="0"
                       oninput="calculate()">
            </td>

            <td class="row-total">₹0.00</td>

            <td>
                <button class="delete-btn"
                        onclick="deleteRow(this)">
                    Delete
                </button>
            </td>
        </tr>
    `;

    calculate();
}


// Initial calculation
calculate();
