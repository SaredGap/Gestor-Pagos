const payments = JSON.parse(localStorage.getItem("payments")) || [];
const confirmedPayments = JSON.parse(localStorage.getItem("confirmedPayments")) || [];
const paymentList = document.getElementById("payment-list");
const totalAmountElement = document.getElementById("total-amount");
const confirmedPaymentList = document.getElementById("confirmed-payment-list");

document.getElementById("payment-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const concept = document.getElementById("concept").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    
    if (concept && amount && date) {
        payments.push({ concept, amount: parseFloat(amount), date });
        localStorage.setItem("payments", JSON.stringify(payments));
        renderPayments();
    }
});

function renderPayments() {
    paymentList.innerHTML = "";
    let total = 0;
    payments.forEach((p, index) => {
        total += p.amount;
        paymentList.innerHTML += `
            <tr>
                <td class="border p-2">${p.concept}</td>
                <td class="border p-2">$${p.amount}</td>
                <td class="border p-2">${p.date}</td>
                <td class="border p-2">
                    <button onclick="confirmPayment(${index})" class="bg-green-500 text-white p-1 rounded">Confirmar</button>
                    <button onclick="deletePayment(${index})" class="bg-red-500 text-white p-1 rounded ml-2">Eliminar</button>
                </td>
            </tr>
        `;
    });
    totalAmountElement.textContent = total;
}

function deletePayment(index) {
    payments.splice(index, 1);
    localStorage.setItem("payments", JSON.stringify(payments));
    renderPayments();
}

function confirmPayment(index) {
    confirmedPayments.push(payments[index]);
    payments.splice(index, 1);
    localStorage.setItem("payments", JSON.stringify(payments));
    localStorage.setItem("confirmedPayments", JSON.stringify(confirmedPayments));
    renderPayments();
    renderConfirmedPayments();
}

function renderConfirmedPayments() {
    confirmedPaymentList.innerHTML = "";
    confirmedPayments.forEach(p => {
        confirmedPaymentList.innerHTML += `
            <tr>
                <td class="border p-2">${p.concept}</td>
                <td class="border p-2">$${p.amount}</td>
                <td class="border p-2">${p.date}</td>
            </tr>
        `;
    });
}

// Función para mostrar u ocultar secciones
function showSection(section) {
    const sections = document.querySelectorAll(".section");
    sections.forEach(s => {
        s.classList.add("hidden");
    });
    document.getElementById(section).classList.remove("hidden");
}

// Inicializar la página con los pagos
renderPayments();
renderConfirmedPayments();

