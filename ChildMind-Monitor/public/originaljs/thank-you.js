/**
 * AJAX call that checks to see if the user placed an order in the past three minutes.
 * If yes, renders the order information.
 */
$.ajax({
    url: '/recentPurchase',
    method: "GET",
    success: function(obj) {
        document.getElementById("orderNumber").innerHTML = obj.orderId;
    }
})