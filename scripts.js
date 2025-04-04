let payments = JSON.parse(localStorage.getItem("payments")) || [];
let completedPayments = JSON.parse(localStorage.getItem("completedPayments")) || [];
const paymentList = document.getElementById("payment-list");
const completedPaymentsList = document.getElementById("completed-payments-list");
const completedPaymentsSection = document.getElementById("completed-payments-section");
const totalAmountElement = document.getElementById("total-amount");

let currentPaymentId = null;

document.getElementById("payment-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    if (!validateForm()) return;  // Validación antes de continuar

    const concept = document.getElementById("concept").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const installments = parseInt(document.getElementById("installments").value);
    const startDate = document.getElementById("date").value;
    const paymentMethod = document.getElementById("payment-method").value;

    let paymentId = new Date().getTime();
    let installmentAmount = parseFloat((amount / installments).toFixed(2));
    let currentDate = new Date(startDate);

    for (let i = 1; i <= installments; i++) {
        let paymentDate = new Date(currentDate);
        paymentDate.setMonth(paymentDate.getMonth() + i - 1); // Sumamos un mes por cada cuota

        payments.push({
            id: paymentId,
            concept,
            totalAmount: amount,
            amount: installmentAmount,
            paid: 0,
            pending: installmentAmount,
            date: paymentDate.toISOString().split('T')[0], // Fecha en formato YYYY-MM-DD
            installment: i,
            totalInstallments: installments,
            paymentMethod: paymentMethod // Guardamos el método de pago también
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
                    <table class="w-full table-auto">
                        <thead>
                            <tr>
                                <th class="border p-2">Cuota</th>
                                <th class="border p-2">Fecha de Pago</th>
                                <th class="border p-2">Monto Pagado</th>
                                <th class="border p-2">Monto Pendiente</th>
                            </tr>
                        </thead>
                        <tbody id="installment-list-${p.id}">
                            <!-- Las cuotas se agregarán aquí -->
                        </tbody>
                    </table>
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
            <tr>
                <td class="border p-2">Cuota ${p.installment}/${p.totalInstallments}</td>
                <td class="border p-2">${p.date}</td>
                <td class="border p-2">$${p.paid.toFixed(2)}</td>
                <td class="border p-2">$${p.pending.toFixed(2)}</td>
            </tr>
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

    // Validación de campos antes de proceder
    if (isNaN(amountToPay) || amountToPay <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    if (paymentMethod === "") {
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

    // Si todas las cuotas han sido pagadas, mover el pago a completados
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

// Función para validar el formulario
function validateForm() {
    const concept = document.getElementById('concept').value;
    const amount = document.getElementById('amount').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const installmentsContainer = document.getElementById('installments-container');
    const dateContainer = document.getElementById('date-container');

    // Validar Concepto y Monto
    if (!concept || !amount || !paymentMethod) {
        alert('Por favor, completa todos los campos obligatorios.');
        return false;
    }

    // Validar cuotas y fecha solo si están visibles (si "Pago a Plazos" está marcado)
    if (!installmentsContainer.classList.contains('hidden')) {
        const installments = document.getElementById('installments').value;
        const date = document.getElementById('date').value;

        if (!installments || !date) {
            alert('Por favor, completa los campos de cuotas y fecha de pago.');
            return false;
        }
    }

    // Si todo es válido
    return true;
}

// Llamada inicial para renderizar los pagos
renderPayments();
