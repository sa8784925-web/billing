/* ==========================================
   INITIAL DATA
========================================== */

let items = [
    {
        name: "TZ4",
        hsn: "-",
        qty: 1,
        rate: 1066.41,
        gst: 28,
        discount: 385
    }
];


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const today = new Date();

    document.getElementById("invoiceDate").value =
        formatDateInput(today);

    document.getElementById("dueDate").value =
        formatDateInput(today);

    renderEditorItems();

    updateInvoice();
});


/* ==========================================
   DATE
========================================== */

function formatDateInput(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) return "";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* ==========================================
   CURRENCY
========================================== */

function money(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    ).format(value);

}


/* ==========================================
   ADD ITEM
========================================== */

function addItem() {

    items.push({
        name: "",
        hsn: "-",
        qty: 1,
        rate: 0,
        gst: 18,
        discount: 0
    });

    renderEditorItems();

    updateInvoice();
}


/* ==========================================
   REMOVE ITEM
========================================== */

function removeItem(index) {

    if (items.length === 1) {

        items[0] = {
            name: "",
            hsn: "-",
            qty: 1,
            rate: 0,
            gst: 18,
            discount: 0
        };

    } else {

        items.splice(index, 1);

    }

    renderEditorItems();

    updateInvoice();
}


/* ==========================================
   EDITOR ITEMS
========================================== */

function renderEditorItems() {

    const tbody =
        document.getElementById("editorItems");

    tbody.innerHTML = "";

    items.forEach((item, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                <input
                    value="${escapeHTML(item.name)}"
                    oninput="changeItem(${index}, 'name', this.value)">
            </td>

            <td>
                <input
                    value="${escapeHTML(item.hsn)}"
                    oninput="changeItem(${index}, 'hsn', this.value)">
            </td>

            <td>
                <input
                    type="number"
                    min="0"
                    value="${item.qty}"
                    oninput="changeItem(${index}, 'qty', this.value)">
            </td>

            <td>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value="${item.rate}"
                    oninput="changeItem(${index}, 'rate', this.value)">
            </td>

            <td>
                <input
                    type="number"
                    min="0"
                    max="100"
                    value="${item.gst}"
                    oninput="changeItem(${index}, 'gst', this.value)">
            </td>

            <td>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value="${item.discount}"
                    oninput="changeItem(${index}, 'discount', this.value)">
            </td>

            <td>
                <button
                    class="remove-item"
                    onclick="removeItem(${index})">
                    ×
                </button>
            </td>

        `;

        tbody.appendChild(row);
    });
}


/* ==========================================
   CHANGE ITEM
========================================== */

function changeItem(index, property, value) {

    if (
        property === "qty" ||
        property === "rate" ||
        property === "gst" ||
        property === "discount"
    ) {

        value = Number(value) || 0;

    }

    items[index][property] = value;

    updateInvoice();
}


/* ==========================================
   CALCULATIONS
========================================== */

function calculate() {

    let taxableTotal = 0;

    let discountTotal = 0;

    let cgstTotal = 0;

    let sgstTotal = 0;

    let totalQty = 0;

    items.forEach(item => {

        const gross =
            Number(item.qty) *
            Number(item.rate);

        const discount =
            Number(item.discount);

        const taxable =
            Math.max(
                gross - discount,
                0
            );

        const gstAmount =
            taxable *
            Number(item.gst) /
            100;

        const cgst =
            gstAmount / 2;

        const sgst =
            gstAmount / 2;

        taxableTotal += taxable;

        discountTotal += discount;

        cgstTotal += cgst;

        sgstTotal += sgst;

        totalQty += Number(item.qty);

    });


    const totalTax =
        cgstTotal + sgstTotal;


    const grandTotal =
        taxableTotal + totalTax;


    return {
        taxableTotal,
        discountTotal,
        cgstTotal,
        sgstTotal,
        totalTax,
        grandTotal,
        totalQty
    };
}


/* ==========================================
   UPDATE ENTIRE INVOICE
========================================== */

function updateInvoice() {

    updateBusiness();

    updateCustomer();

    updateInvoiceDetails();

    renderInvoiceItems();

    renderTaxSummary();

    const totals = calculate();

    document.getElementById(
        "outTotalQty"
    ).textContent =
        totals.totalQty.toFixed(3);

    document.getElementById(
        "outGrandTotal"
    ).textContent =
        money(totals.grandTotal);

    document.getElementById(
        "amountWords"
    ).textContent =
        "INR " +
        numberToWords(
            Math.round(totals.grandTotal)
        ) +
        " Rupees Only.";

    updatePaymentStatus();
}


/* ==========================================
   BUSINESS
========================================== */

function updateBusiness() {

    setText(
        "outBusinessName",
        getValue("businessName")
    );

    setText(
        "outGSTIN",
        getValue("businessGSTIN")
    );

    setText(
        "outAddress",
        getValue("businessAddress")
    );

    setText(
        "outCity",
        getValue("businessCity")
    );

    setText(
        "outMobile",
        getValue("businessMobile")
    );

    setText(
        "signatureBusiness",
        getValue("businessName")
    );
}


/* ==========================================
   CUSTOMER
========================================== */

function updateCustomer() {

    setText(
        "outCustomerName",
        getValue("customerName")
    );

    setText(
        "outCustomerPhone",
        getValue("customerPhone")
    );

    setText(
        "outCustomerAddress",
        getValue("customerAddress")
    );

    const gst =
        getValue("customerGSTIN");

    setText(
        "outCustomerGSTIN",
        gst ? "GSTIN: " + gst : ""
    );
}


/* ==========================================
   INVOICE DETAILS
========================================== */

function updateInvoiceDetails() {

    setText(
        "outInvoiceNumber",
        getValue("invoiceNumber")
    );

    setText(
        "outInvoiceDate",
        formatDate(
            getValue("invoiceDate")
        )
    );

    setText(
        "outDueDate",
        formatDate(
            getValue("dueDate")
        )
    );

    setText(
        "outPlace",
        getValue("placeSupply")
    );
}


/* ==========================================
   RENDER ITEMS
========================================== */

function renderInvoiceItems() {

    const tbody =
        document.getElementById(
            "invoiceItems"
        );

    tbody.innerHTML = "";


    items.forEach((item, index) => {

        const gross =
            Number(item.qty) *
            Number(item.rate);

        const taxable =
            Math.max(
                gross - Number(item.discount),
                0
            );

        const gstAmount =
            taxable *
            Number(item.gst) /
            100;

        const total =
            taxable + gstAmount;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>

                <b>
                    ${escapeHTML(item.name || "-")}
                </b>

                <div class="summary-content">

                    <i>Taxable Amount</i>

                    <br>

                    CGST
                    ${(item.gst / 2).toFixed(1)}%

                    <br>

                    SGST
                    ${(item.gst / 2).toFixed(1)}%

                    <br>

                    Discount

                </div>

            </td>

            <td style="text-align:right">
                ${escapeHTML(item.hsn || "-")}
            </td>

            <td style="text-align:center">
                ${item.gst}%
            </td>

            <td style="text-align:right">
                ${Number(item.qty).toFixed(3)}
                NOS
            </td>

            <td style="text-align:right">
                ${formatNumber(item.rate)}
            </td>

            <td style="text-align:center">
                NOS
            </td>

            <td style="text-align:right">

                ${formatNumber(gross)}

                <div class="summary-content">

                    ${formatNumber(taxable)}

                    <br>

                    ${money(gstAmount / 2)}

                    <br>

                    ${money(gstAmount / 2)}

                    <br>

                    -${money(item.discount)}

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });


    /*
        Add blank space after items.
        This keeps the invoice visually similar
        to the reference.
    */

    const blankRows =
        Math.max(
            0,
            2 - items.length
        );

    for (let i = 0; i < blankRows; i++) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        `;

        tbody.appendChild(row);
    }
}


/* ==========================================
   TAX SUMMARY
========================================== */

function renderTaxSummary() {

    const tbody =
        document.getElementById(
            "taxSummary"
        );

    tbody.innerHTML = "";


    const totals = calculate();


    /*
       Group tax information by GST rate
    */

    const groups = {};


    items.forEach(item => {

        const gross =
            item.qty * item.rate;

        const taxable =
            Math.max(
                gross - item.discount,
                0
            );

        const gstAmount =
            taxable * item.gst / 100;


        if (!groups[item.gst]) {

            groups[item.gst] = {
                taxable: 0,
                tax: 0,
                hsn: item.hsn
            };

        }


        groups[item.gst].taxable += taxable;

        groups[item.gst].tax += gstAmount;

    });


    Object.keys(groups).forEach(rate => {

        const group =
            groups[rate];

        const halfRate =
            Number(rate) / 2;

        const halfTax =
            group.tax / 2;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHTML(group.hsn || "-")}
            </td>

            <td>
                ${formatNumber(group.taxable)}
            </td>

            <td>
                ${halfRate.toFixed(1)}%
            </td>

            <td>
                ${formatNumber(halfTax)}
            </td>

            <td>
                ${halfRate.toFixed(1)}%
            </td>

            <td>
                ${formatNumber(halfTax)}
            </td>

            <td>
                ${formatNumber(group.tax)}
            </td>

        `;


        tbody.appendChild(row);

    });


    const totalRow =
        document.createElement("tr");


    totalRow.innerHTML = `

        <td>
            <b>TOTAL</b>
        </td>

        <td>
            <b>
                ${formatNumber(
                    totals.taxableTotal
                )}
            </b>
        </td>

        <td></td>

        <td>
            <b>
                ${formatNumber(
                    totals.cgstTotal
                )}
            </b>
        </td>

        <td></td>

        <td>
            <b>
                ${formatNumber(
                    totals.sgstTotal
                )}
            </b>
        </td>

        <td>
            <b>
                ${formatNumber(
                    totals.totalTax
                )}
            </b>
        </td>

    `;


    tbody.appendChild(totalRow);
}


/* ==========================================
   PAYMENT
========================================== */

function updatePaymentStatus() {

    const status =
        getValue("paymentStatus");

    const element =
        document.getElementById(
            "outPaymentStatus"
        );


    if (status === "paid") {

        element.innerHTML = `
            <span class="paid-icon">✓</span>
            Amount Paid
        `;

    } else {

        element.innerHTML = `
            <span style="
                color:#dc2626;
                font-weight:bold;
                margin-right:5px;
            ">●</span>
            Amount Due
        `;

    }
}


/* ==========================================
   PRINT
========================================== */

function printInvoice() {

    updateInvoice();

    window.print();

}


/* ==========================================
   NEW INVOICE
========================================== */

function newInvoice() {

    if (
        !confirm(
            "Create a new invoice?"
        )
    ) {
        return;
    }


    items = [
        {
            name: "",
            hsn: "-",
            qty: 1,
            rate: 0,
            gst: 18,
            discount: 0
        }
    ];


    document.getElementById(
        "invoiceNumber"
    ).value = "INV-" +
        Math.floor(
            Math.random() * 9000
        ) + 1000;


    const today =
        new Date();


    document.getElementById(
        "invoiceDate"
    ).value =
        formatDateInput(today);


    document.getElementById(
        "dueDate"
    ).value =
        formatDateInput(today);


    document.getElementById(
        "customerName"
    ).value = "";


    document.getElementById(
        "customerPhone"
    ).value = "";


    document.getElementById(
        "customerAddress"
    ).value = "";


    document.getElementById(
        "customerGSTIN"
    ).value = "";


    renderEditorItems();

    updateInvoice();
}


/* ==========================================
   HELPERS
========================================== */

function getValue(id) {

    return document.getElementById(id).value;

}


function setText(id, value) {

    document.getElementById(id).textContent =
        value || "";

}


function formatNumber(number) {

    return Number(number).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ==========================================
   NUMBER TO WORDS
========================================== */

function numberToWords(number) {

    number = Math.floor(number);


    if (number === 0) {

        return "Zero";

    }


    const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen"
    ];


    const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety"
    ];


    function convertLessThanThousand(num) {

        let result = "";


        if (num >= 100) {

            result +=
                ones[
                    Math.floor(num / 100)
                ] +
                " Hundred ";

            num %= 100;
        }


        if (num >= 20) {

            result +=
                tens[
                    Math.floor(num / 10)
                ];

            if (num % 10 !== 0) {

                result +=
                    " " +
                    ones[num % 10];

            }

        } else if (num > 0) {

            result += ones[num];

        }


        return result.trim();

    }


    let result = "";


    if (number >= 10000000) {

        result +=
            convertLessThanThousand(
                Math.floor(
                    number / 10000000
                )
            ) +
            " Crore ";

        number %= 10000000;
    }


    if (number >= 100000) {

        result +=
            convertLessThanThousand(
                Math.floor(
                    number / 100000
                )
            ) +
            " Lakh ";

        number %= 100000;
    }


    if (number >= 1000) {

        result +=
            convertLessThanThousand(
                Math.floor(
                    number / 1000
                )
            ) +
            " Thousand ";

        number %= 1000;
    }


    if (number > 0) {

        result +=
            convertLessThanThousand(
                number
            );

    }


    return result.trim();

}
