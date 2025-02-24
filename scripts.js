const payments = JSON.parse(localStorage.getItem("payments")) || [];
const confirmedPayments = JSON.parse(localStorage.getItem("confirmedPayments")) || [];
const paymentList = document.getElementById("payment-list");
const totalAmountElement = document.getElementById("total-amount");
const confirmedPaymentList = document.getElementById("confirmed-payment-list");
const ctx = document.getElementById("paymentChart").getContext("2d");
let chart;

// Agregar pago

// Agregar pago
document.getElementById("payment-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const concept = document.getElementById("concept").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;

    // Validación para asegurarse de que los campos no estén vacíos
    if (concept && amount && date) {
        payments.push({ concept, amount: parseFloat(amount), date });
        localStorage.setItem("payments", JSON.stringify(payments));

        renderPayments(); // Renderizar la lista de pagos
        renderChart(); // Actualizar la gráfica
        this.reset(); // Limpiar los campos del formulario

        // Mostrar mensaje de éxito al agregar el pago
        showMessage("Pago agregado correctamente", "success");
    } else {
        // Mostrar mensaje de error si falta información
        showMessage("Por favor, completa todos los campos.", "error");
    }
});

// Función para mostrar mensajes dinámicos de éxito o error
function showMessage(message, type) {
    const messageContainer = document.createElement("div");
    messageContainer.textContent = message;
    messageContainer.classList.add("message", type);

    // Agregar el mensaje en el contenedor de la página
    document.body.appendChild(messageContainer);

    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}



// Renderizar los pagos
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

// Eliminar pago
function deletePayment(index) {
    payments.splice(index, 1);
    localStorage.setItem("payments", JSON.stringify(payments));
    renderPayments();
    renderChart();
}

// Confirmar pago
function confirmPayment(index) {
    confirmedPayments.push(payments[index]);
    payments.splice(index, 1);
    localStorage.setItem("payments", JSON.stringify(payments));
    localStorage.setItem("confirmedPayments", JSON.stringify(confirmedPayments));
    renderPayments();
    renderChart();
}



// Mostrar/Ocultar pagos confirmados
function toggleConfirmedPayments() {
    const confirmedDiv = document.getElementById("confirmed-payments");
    confirmedDiv.classList.toggle("hidden");

    if (!confirmedDiv.classList.contains("hidden")) {
        renderConfirmedPayments();
    }
}

// Renderizar pagos confirmados
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

// Inicializa los pagos y gráfico
renderPayments();
renderChart();
