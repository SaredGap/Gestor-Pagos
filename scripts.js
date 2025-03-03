let payments = JSON.parse(localStorage.getItem("payments")) || [];
let completedPayments = JSON.parse(localStorage.getItem("completedPayments")) || [];
const paymentList = document.getElementById("payment-list");
const completedPaymentsList = document.getElementById("completed-payments-list");
const completedPaymentsSection = document.getElementById("completed-payments-section");
const totalAmountElement = document.getElementById("total-amount");

let currentPaymentId = null;

document.getElementById("payment-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const concept = document.getElementById("concept").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const installments = parseInt(document.getElementById("installments").value);
    const date = document.getElementById("date").value;

    if (!concept || isNaN(amount) || isNaN(installments) || !date || amount <= 0 || installments <= 0) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
    }

    let paymentId = new Date().getTime();
    let installmentAmount = parseFloat((amount / installments).toFixed(2));

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
    this.reset();
});

function renderPayments() {
    paymentList.innerHTML = "";
    completedPaymentsList.innerHTML = "";
    let total = 0;
    let groupedPayments = {};

    payments.forEach(p => {
        total += p.amount;
        if (!groupedPayments[p.id]) {
            groupedPayments[p.id] = { ...p, paid: 0, pending: 0 };
        }
        groupedPayments[p.id].paid += p.paid;
        groupedPayments[p.id].pending += p.pending;
    });

    Object.values(groupedPayments).forEach(p => {
        let progress = (p.paid / p.totalAmount) * 100; // Calculamos el porcentaje de pago
        paymentList.innerHTML += `
            <tr>
                <td class="border p-2">${p.concept}</td>
                <td class="border p-2">$${p.totalAmount}</td>
                <td class="border p-2">$${p.paid}</td>
                <td class="border p-2">$${p.pending}</td>
                <td class="border p-2">
                    <button onclick="openPaymentModal(${p.id}, ${p.pending})" class="bg-green-500 text-white p-1 rounded">Pagar</button>
                    <button onclick="toggleInstallments(${p.id})" class="bg-blue-500 text-white p-1 rounded">Cuotas</button>
                    <button onclick="deletePayment(${p.id})" class="bg-red-500 text-white p-1 rounded">Eliminar</button>
                </td>
            </tr>
            <tr id="installments-${p.id}" class="hidden">
                <td colspan="5">
                    <div class="p-2 bg-gray-100 rounded">
                        <strong>Cuotas:</strong>
                        <ul id="installment-list-${p.id}"></ul>
                    </div>
                </td>
            </tr>
            <tr>
                <td colspan="5">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${progress}%;"></div>
                    </div>
                    <p class="text-sm text-center">${progress.toFixed(2)}% Pagado</p>
                </td>
            </tr>
        `;
    });

    completedPayments.forEach(p => {
        completedPaymentsList.innerHTML += `
            <tr>
                <td class="border p-2">${p.concept}</td>
                <td class="border p-2">$${p.totalAmount}</td>
                <td class="border p-2">${p.date}</td>
                <td class="border p-2">${p.paymentMethod}</td>
                <td class="border p-2">
                    <button onclick="deleteCompletedPayment(${p.id})" class="bg-red-500 text-white p-1 rounded">Eliminar</button>
                </td>
            </tr>
        `;
    });

    totalAmountElement.textContent = total.toFixed(2);
}

function toggleInstallments(paymentId) {
    const installmentDiv = document.getElementById(`installments-${paymentId}`);
    installmentDiv.classList.toggle("hidden");
    renderInstallments(paymentId);
}

function renderInstallments(paymentId) {
    const list = document.getElementById(`installment-list-${paymentId}`);
    list.innerHTML = "";
    payments.filter(p => p.id === paymentId).forEach(p => {
        list.innerHTML += `
            <li>Cuota ${p.installment}/${p.totalInstallments}: Pagado $${p.paid.toFixed(2)}, Pendiente $${p.pending.toFixed(2)}</li>
        `;
    });
}

function openPaymentModal(paymentId, pendingAmount) {
    currentPaymentId = paymentId;
    document.getElementById("payment-modal").classList.remove("hidden");
    document.getElementById("payment-amount").value = pendingAmount.toFixed(2);
    document.getElementById("payment-method").value = ''; // Limpiar el campo del método de pago
}

function closeModal() {
    document.getElementById("payment-modal").classList.add("hidden");
}

function confirmPayment() {
    let amountToPay = parseFloat(document.getElementById("payment-amount").value);
    const paymentMethod = document.getElementById("payment-method").value;

    if (isNaN(amountToPay) || amountToPay <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }
    
    if (!paymentMethod) {
        alert("Por favor, selecciona un método de pago.");
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
            totalAmount: selectedPayments[0].totalAmount,
            date: selectedPayments[0].date,
            paymentMethod: paymentMethod
        });
        payments = payments.filter(p => p.id !== currentPaymentId);
    }

    saveAndRender();
    closeModal();
}

function deletePayment(paymentId) {
    payments = payments.filter(p => p.id !== paymentId);
    saveAndRender();
}

function deleteCompletedPayment(paymentId) {
    completedPayments = completedPayments.filter(p => p.id !== paymentId);
    saveAndRender();
}

function toggleCompletedPayments() {
    completedPaymentsSection.classList.toggle("hidden");
}

function saveAndRender() {
    localStorage.setItem("payments", JSON.stringify(payments));
    localStorage.setItem("completedPayments", JSON.stringify(completedPayments));
    renderPayments();
}

renderPayments();
