var therapistInformation;
var totalPrice;
$(document).ready(async function () {
    /**
     * AJAX call that checks the status of a cart to see if
     * there is an item that exist in the shopping cart.
     */
    await $.ajax({
        url: '/checkStatus',
        method: 'GET',
        success: function (cart) {
            if (cart) {
                $('#orderNumber').text(`${cart.orderId}`)
                $("#noOrderSummary").hide();
                $("#orderSummary").show();
                getTherapist(cart.therapist);
                $('#cartPlan').val(`${cart.timeLength}`)
                updateCart();
            }
        }
    })
})

/**
 * 
 * This function has an AJAX call that finds the therapist that is selected from the shopping cart
 * and displays their information in the checkout page.
 * 
 * @param {*} therapistId as object id
 */
function getTherapist(therapistId) {
    $.ajax({
        url: '/getTherapistInfo',
        method: "POST",
        data: {
            therapistId: therapistId
        },
        success: function (therapist) {
            $('#therapistName').text(`${therapist.firstName} ${therapist.lastName}`)
            $('#therapistDesc').text(`${therapist.yearsExperience} years of experience in the profession, and offers $${therapist.sessionCost} per session`)
            $('#therapistImg').attr('src', `${therapist.profileImg}`)
            therapistInformation = therapist;
            therapistInformation._id = therapistId;
            let multiplier;
            if ($('#cartPlan').val() == "freePlan") {
                multiplier = 0;
            } else if ($('#cartPlan').val() == "monthPlan") {
                multiplier = 1;
            } else if ($('#cartPlan').val() == "threeMonthPlan") {
                multiplier = 3;
            } else {
                multiplier = 6;
            }
            $("#cartCost").html(`${parseFloat(therapistInformation.sessionCost * multiplier).toFixed(2)}`)
            $("#subTotal").html(`${parseFloat(therapistInformation.sessionCost * multiplier).toFixed(2)}`)
            $("#taxTotal").html(`$${parseFloat(therapistInformation.sessionCost * multiplier * 0.12).toFixed(2)}`)
            $("#total").html(`$${parseFloat(therapistInformation.sessionCost * multiplier * 1.12).toFixed(2)}`)
        }
    })
}

/**
 * This function allows users to change their shopping cart's timelength.
 * It has an AJAX call that changes the timelength for the user's shopping cart
 * in the database so when the order is confirmed the expiring time changes
 * corrosponding to the timelength.
 */
function updateCart() {
    $('#cartPlan').change(() => {
        $.ajax({
            url: '/updateCart',
            type: 'PUT',
            data: {
                timeLength: $('#cartPlan').val()
            },
            success: function () {
                let multiplier;
                if ($('#cartPlan').val() == "freePlan") {
                    multiplier = 0;
                } else if ($('#cartPlan').val() == "monthPlan") {
                    multiplier = 1;
                } else if ($('#cartPlan').val() == "threeMonthPlan") {
                    multiplier = 3;
                } else {
                    multiplier = 6;
                }
                $("#cartCost").html(`${parseFloat(therapistInformation.sessionCost * multiplier).toFixed(2)}`)
                $("#subTotal").html(`${parseFloat(therapistInformation.sessionCost * multiplier).toFixed(2)}`)
                $("#taxTotal").html(`$${parseFloat(therapistInformation.sessionCost * multiplier * 0.12).toFixed(2)}`)
                $("#total").html(`$${parseFloat(therapistInformation.sessionCost * multiplier * 1.12).toFixed(2)}`)
            }
        })
    })
}

/**
 * Variables for Delete User Modal.
 */
var removeOrderModal = document.getElementById("removeOrderModal");
document.getElementById('removeItem').onclick = function (e) {
    removeOrderModal.style.display = "block";
    document.body.style.overflow = 'hidden';

    document.getElementById('removeOrderBtn').onclick = function () {
        /**
         * AJAX call that deletes a item from the shopping cart and changes the status of the cart.
         */
        $.ajax({
            url: '/deleteCart',
            type: 'DELETE',
            success: function (data) {
                removeOrderModal.style.display = "none";
                document.getElementById('signupSuccessModal').style.display = 'flex';
                document.body.style.overflow = 'hidden';
                setTimeout(() => {
                    location.reload();
                }, 2500);
            }
        })
    }
}

/**
 * If cancel button is clicked, hide modal for Delete User
 */
document.getElementById("cancelRemove").onclick = function () {
    removeOrderModal.style.display = "none";
    document.body.style.overflow = 'auto';
}

/**
 * 
 * If user clicks outside of the modal for both Create and Delete then hide modal
 * 
 * @param {*} event as an event listener
 */
window.onclick = function (event) {
    if (event.target == removeOrderModal) {
        removeOrderModal.style.display = "none";
        document.body.style.overflow = 'auto';
    }
}

const checkoutErrorMsg = document.getElementById("checkoutErrorMessage");

/**
 * 
 * If the order is successfully placed redirect patient to
 * thank you page and display their order number and a
 * thank you message.
 * 
 * @param {*} data as form field
 */
function handleConfirmOrder(data) {
    if (data.errorMsg) {
        checkoutErrorMsg.style.display = 'block';
        checkoutErrorMsg.innerHTML = data.errorMsg;
    } else {
        checkoutErrorMsg.style.display = 'none';
        document.getElementById('signupSuccessModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            window.location = "/thank-you"
        }, 2500);
    }
}

/**
 * This onclick calls the AJAX call that confirms an order. Before
 * calling the AJAX call it will check the timeLength the user
 * chose for their session. It will then change the expiring time
 * of the cart based on the timeLength when confirm order is done.
 */
document.getElementById('confirmOrder').onclick = function () {
    const time = new Date();
    var timeLengthforUse;
    var selectedTime = $('#cartPlan').val();
    if (selectedTime == "freePlan") {
        timeLengthforUse = new Date(time.setMinutes(time.getMinutes() + 3));
    } else if (selectedTime == "monthPlan") {
        timeLengthforUse = new Date(time.setMinutes(time.getMinutes() + 5));
    } else if (selectedTime == "threeMonthPlan") {
        timeLengthforUse = new Date(time.setMinutes(time.getMinutes() + 10));
    } else if (selectedTime == "yearPlan") {
        timeLengthforUse = new Date(time.setMinutes(time.getMinutes() + 15));
    }
    /**
     * AJAX call that will confirm the order in the database and start the session for the user.
     */
    $.ajax({
        url: "/confirmCart",
        method: "POST",
        data: {
            cartPlan: $('#cartPlan').val(),
            timeLengthforUse: timeLengthforUse,
            totalPrice: totalPrice,
            therapistID: therapistInformation._id
        },
        success: handleConfirmOrder
    })
}

/**
 * 
 * Print invoice function
 * 
 * @returns N/A
 */
function printInvoice() {
    var printWindow = window.open('', 'new div', 'height=600,width=600');
    printWindow.document.write('<html><head><title>Print Invoice</title>');
    printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">');
    printWindow.document.write('<link rel="stylesheet" type="text/css" href="../css/style.css" /><link rel="stylesheet" type="text/css" href="../css/checkout.css" /><link rel="stylesheet" type="text/css" href="../css/responsive.css" />');
    printWindow.document.write('</head><body> <div id="wrapper"><div id="orderSummary" style="display: block;">');
    printWindow.document.write('<div id="orderNumSec"><h2>Order: <span id="orderNumber">MM0509123456</span></h2></div><div id="orderTable">');
    printWindow.document.write(document.getElementById('orderTable').innerHTML);
    printWindow.document.write('</div><hr /><div id="cartTotalSec">');
    printWindow.document.write(document.getElementById('cartTotalSec').innerHTML);
    printWindow.document.write('</div>');
    printWindow.document.write('</div></div></body></html>');
    printWindow.document.close();

    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 1000);
    return false;
}