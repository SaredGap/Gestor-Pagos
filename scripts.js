const payments = JSON.parse(localStorage.getItem("payments")) || [];
const completedPayments = JSON.parse(localStorage.getItem("completedPayments")) || [];
let currentPaymentId = null;

document.getElementById("payment-form").addEventListener("submit", addPayment);
document.getElementById("confirm-payment").addEventListener("click", confirmPayment);

function saveAndRender() {
    localStorage.setItem("payments", JSON.stringify(payments));
    localStorage.setItem("completedPayments", JSON.stringify(completedPayments));
    renderPayments();
}

function addPayment(event) {
    event.preventDefault();
    const concept = document.getElementById("concept").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const installments = parseInt(document.getElementById("installments").value);
    const date = document.getElementById("date").value;

    if (!concept || isNaN(amount) || isNaN(installments) || !date || amount <= 0 || installments <= 0) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
    }

    const paymentId = Date.now();
    const installmentAmount = parseFloat((amount / installments).toFixed(2));

    for (let i = 1; i <= installments; i++) {
        payments.push({
            id: paymentId,
            concept,
            totalAmount: amount,
            amount: installmentAmount,
            paid: 0,
            pending: installmentAmount,
            date,
            installment: i,
            totalInstallments: installments
        });
    }

    saveAndRender();
    event.target.reset();
}

function renderPayments() {
    const paymentList = document.querySelector("#payment-list tbody");
    const completedList = document.querySelector("#completed-payments tbody");
    paymentList.innerHTML = "";
    completedList.innerHTML = "";

    payments.forEach(p => {
        paymentList.innerHTML += `
            <tr>
                <td>${p.concept}</td>
                <td>$${p.totalAmount}</td>
                <td>$${p.paid.toFixed(2)}</td>
                <td>$${p.pending.toFixed(2)}</td>
                <td>
                    <button onclick="openPaymentModal(${p.id}, ${p.pending})">💰 Pagar</button>
                    <button onclick="deletePayment(${p.id})">❌ Eliminar</button>
                </td>
            </tr>
        `;
    });

    completedPayments.forEach(p => {
        completedList.innerHTML += `
            <tr>
                <td>${p.concept}</td>
                <td>$${p.totalAmount}</td>
                <td><button onclick="deleteCompletedPayment(${p.id})">🗑️ Eliminar</button></td>
            </tr>
        `;
    });
}

function openPaymentModal(paymentId, pendingAmount) {
    currentPaymentId = paymentId;
    document.getElementById("payment-modal").classList.remove("hidden");
    document.getElementById("payment-amount").value = pendingAmount.toFixed(2);
}

function closeModal() {
    document.getElementById("payment-modal").classList.add("hidden");
}

function confirmPayment() {
    let amountToPay = parseFloat(document.getElementById("payment-amount").value);
    if (isNaN(amountToPay) || amountToPay <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    let selectedPayments = payments.filter(p => p.id === currentPaymentId);
    let totalPending = selectedPayments.reduce((sum, p) => sum + p.pending, 0);

    if (amountToPay > totalPending) {
        alert("El monto ingresado supera la cantidad pendiente.");
        return;
    }

    selectedPayments.forEach(p => {
        if (amountToPay > 0) {
            let paymentAmount = Math.min(amountToPay, p.pending);
            p.paid += paymentAmount;
            p.pending -= paymentAmount;
            amountToPay -= paymentAmount;
        }
    });

    if (selectedPayments.every(p => p.pending === 0)) {
        completedPayments.push({
            id: currentPaymentId,
            concept: selectedPayments[0].concept,
            totalAmount: selectedPayments[0].totalAmount
        });
        payments.splice(payments.findIndex(p => p.id === currentPaymentId), selectedPayments.length);
    }

    saveAndRender();
    closeModal();
}

function deletePayment(paymentId) {
    payments.splice(payments.findIndex(p => p.id === paymentId), 1);
    saveAndRender();
}

function deleteCompletedPayment(paymentId) {
    completedPayments.splice(completedPayments.findIndex(p => p.id === paymentId), 1);
    saveAndRender();
}

saveAndRender();
