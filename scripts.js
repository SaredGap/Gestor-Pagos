// Inicializamos la lista de pagos desde localStorage, o un array vacío si no existe
let payments = JSON.parse(localStorage.getItem("payments")) || [];
const paymentList = document.getElementById("payment-list");
const totalAmountElement = document.getElementById("total-amount");

document.getElementById("payment-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const concept = document.getElementById("concept").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const installments = parseInt(document.getElementById("installments").value);
    const startDate = document.getElementById("start-date").value;

    if (concept && amount && installments && startDate) {
        const payment = {
            concept,
            amount,
            installments,
            startDate,
            remainingAmount: amount,
            installmentsData: generateInstallments(installments, amount, startDate)
        };

        payments.push(payment);
        localStorage.setItem("payments", JSON.stringify(payments));  // Guardar el pago en localStorage
        renderPayments();
        this.reset();
    } else {
        alert("Por favor, completa todos los campos.");
    }
});

// Generar las cuotas
function generateInstallments(installments, amount, startDate) {
    const installmentAmount = amount / installments;
    let installmentsData = [];
    let currentDate = new Date(startDate);

    for (let i = 1; i <= installments; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        installmentsData.push({
            installmentNumber: i,
            dueDate: currentDate.toISOString().split('T')[0],
            amount: installmentAmount,
            paid: 0
        });
    }

    return installmentsData;
}

// Función para renderizar los pagos
function renderPayments() {
    paymentList.innerHTML = "";
    let total = 0;
    payments.forEach((payment, index) => {
        total += payment.amount;
        paymentList.innerHTML += `
            <tr>
                <td>${payment.concept}</td>
                <td>$${payment.amount.toFixed(2)}</td>
                <td>${payment.startDate}</td>
                <td>
                    <button onclick="viewInstallments(${index})" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#installmentsModal">Ver Cuotas</button>
                    <button onclick="deletePayment(${index})" class="btn btn-danger btn-sm">Eliminar</button>
                </td>
            </tr>
        `;
    });
    totalAmountElement.textContent = `$${total.toFixed(2)}`;
}

// Función para eliminar un pago
function deletePayment(index) {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este pago?");
    if (confirmDelete) {
        payments.splice(index, 1);
        localStorage.setItem("payments", JSON.stringify(payments));  // Actualizar localStorage
        renderPayments();
    }
}

// Función para ver cuotas
function viewInstallments(index) {
    const payment = payments[index];
    const installmentsList = document.getElementById("installments-list");
    installmentsList.innerHTML = '';

    payment.installmentsData.forEach(installment => {
        const li = document.createElement("li");
        li.innerHTML = `<p>Cuota ${installment.installmentNumber}: $${installment.amount.toFixed(2)} - Fecha: ${installment.dueDate} - Saldo pendiente: $${(installment.amount - installment.paid).toFixed(2)}</p>`;
        installmentsList.appendChild(li);
    });

    const payButton = document.getElementById("pay-button");
    payButton.onclick = () => payInstallment(index);
}

// Función para realizar el pago de cuotas
function payInstallment(index) {
    let paymentAmount = parseFloat(document.getElementById("payment-amount").value);
    let payment = payments[index];  // Usamos let para asegurar que el valor de payment sea modificable
    let totalPaid = 0;

    // Realizamos el pago de las cuotas
    for (let i = 0; i < payment.installmentsData.length; i++) {
        if (payment.installmentsData[i].paid < payment.installmentsData[i].amount && paymentAmount > 0) {
            const remainingAmount = payment.installmentsData[i].amount - payment.installmentsData[i].paid;
            const amountToPay = Math.min(remainingAmount, paymentAmount);

            payment.installmentsData[i].paid += amountToPay;
            totalPaid += amountToPay;
            paymentAmount -= amountToPay;
        }

        if (paymentAmount <= 0) break;
    }

    payment.remainingAmount -= totalPaid;
    localStorage.setItem("payments", JSON.stringify(payments));

    // Actualizamos la vista
    renderPayments();
    document.getElementById("payment-amount").value = ''; // Limpiamos el input
    alert(`Has abonado $${totalPaid.toFixed(2)}.`);
}

// Llamamos a renderPayments para cargar los pagos al inicio
renderPayments();
