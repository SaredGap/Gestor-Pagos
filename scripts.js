// Inicializamos los pagos desde el localStorage o un array vacío
const payments = JSON.parse(localStorage.getItem("payments")) || [];
const paymentList = document.getElementById("payment-list");
const payModal = new bootstrap.Modal(document.getElementById('payModal'));
const payButton = document.getElementById("pay-button");
const paymentAmountInput = document.getElementById("payment-amount");
const paymentMessage = document.getElementById("payment-message");
let currentPaymentIndex = null;

// Cargar y mostrar los pagos en la tabla
function loadPayments() {
    paymentList.innerHTML = "";
    payments.forEach((payment, index) => {
        paymentList.innerHTML += `
            <tr>
                <td>${payment.concept}</td>
                <td>$${payment.amount.toFixed(2)}</td>
                <td>${payment.startDate}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="showInstallments(${index})">Ver Cuotas</button>
                    <button class="btn btn-success btn-sm" onclick="openPayModal(${index})">Pagar</button>
                </td>
            </tr>
        `;
    });
}

// Abrir modal de pago
function openPayModal(index) {
    currentPaymentIndex = index;
    const payment = payments[currentPaymentIndex];
    paymentAmountInput.value = ""; // Limpiar input
    paymentMessage.innerHTML = ""; // Limpiar mensaje
    payModal.show();
}

// Realizar pago
payButton.addEventListener("click", () => {
    const amountToPay = parseFloat(paymentAmountInput.value);
    if (isNaN(amountToPay) || amountToPay <= 0) {
        paymentMessage.innerHTML = "Por favor ingresa una cantidad válida.";
        return;
    }

    const payment = payments[currentPaymentIndex];
    let totalPaid = 0;

    // Intentamos pagar las cuotas con la cantidad ingresada
    for (let i = 0; i < payment.installmentsData.length; i++) {
        if (payment.installmentsData[i].paid < payment.installmentsData[i].amount) {
            const remainingAmount = payment.installmentsData[i].amount - payment.installmentsData[i].paid;
            const amountToPayThisInstallment = Math.min(remainingAmount, amountToPay);
            payment.installmentsData[i].paid += amountToPayThisInstallment;
            totalPaid += amountToPayThisInstallment;
            amountToPay -= amountToPayThisInstallment;

            if (payment.installmentsData[i].paid === payment.installmentsData[i].amount) {
                // Si la cuota ya está pagada, la eliminamos
                payment.installmentsData.splice(i, 1);
                i--; // Ajustamos el índice después de eliminar una cuota
            }

            if (amountToPay <= 0) break;
        }
    }

    payment.remainingAmount -= totalPaid;
    localStorage.setItem("payments", JSON.stringify(payments));

    // Actualizamos la vista
    loadPayments();
    payModal.hide();
    alert(`Has abonado $${totalPaid.toFixed(2)} de la cuota`);

    // Si se pagó todo, mostrar mensaje
    if (payment.remainingAmount === 0) {
        alert("El pago se completó exitosamente.");
    }
});

// Mostrar cuotas de un pago
function showInstallments(index) {
    const payment = payments[index];
    let installmentsHtml = "<ul>";
    payment.installmentsData.forEach((installment, i) => {
        installmentsHtml += `
            <li>Cuota ${installment.installmentNumber}: $${installment.amount.toFixed(2)} - Pagado: $${installment.paid.toFixed(2)} - Fecha de vencimiento: ${installment.dueDate}</li>
        `;
    });
    installmentsHtml += "</ul>";

    alert(installmentsHtml); // Mostramos las cuotas en un alert (puedes hacer esto en un modal si prefieres)
}

// Función para agregar un pago manualmente (solo como ejemplo)
function addPayment() {
    const newPayment = {
        concept: "Pago de ejemplo",
        amount: 500,
        startDate: "2023-01-01",
        remainingAmount: 500,
        installmentsData: [
            { installmentNumber: 1, amount: 250, paid: 0, dueDate: "2023-02-01" },
            { installmentNumber: 2, amount: 250, paid: 0, dueDate: "2023-03-01" }
        ]
    };
    payments.push(newPayment);
    localStorage.setItem("payments", JSON.stringify(payments));
    loadPayments();
}

// Agregar un pago de ejemplo para mostrar
addPayment();
