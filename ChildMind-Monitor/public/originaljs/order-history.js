/**
 * Constant variable.
 */
const orderRefundModal = document.getElementById('orderRefundModal');

$(document).ready(async function () {
    /**
     * 
     * This helper function allows us to get an actual date with the proper timezone.
     * 
     * @param {*} purchasedDate as a DATE
     * @returns the LocalISO time with proper timezone
     */
    function getActuatDate(purchasedDate) {
        let offSet = purchasedDate.getTimezoneOffset() * 60 * 1000;
        let tLocalISO = new Date(purchasedDate - offSet).toISOString().slice(0, 10);
        return tLocalISO;
    }

    /**
     * 
     * This helper function populates all previous purchases with the therapists for the patient
     * in a table as rows.
     * 
     * @param {*} therapistInfo as an object 
     * @param {*} cartData as an object
     */
    function populateTherapist(therapistInfo, cartData) {
        let multiplier;
        var x = `<tr class="tableRows">`;
        x += `<td>${getActuatDate(new Date(cartData.purchased))}</td>`;
        x += `<td>${new Date(cartData.expiringTime).toLocaleString('en-CA', { hour: 'numeric', minute: 'numeric', hour12: true })}</td>`
        x += `<td>${therapistInfo.fullName}</td>`
        if (cartData.timeLength == 'freePlan') {
            x += `<td>Trial</td>`
            multiplier = 0;
        } else if (cartData.timeLength == 'monthPlan') {
            x += `<td>1 Month</td>`
            multiplier = 1;
        } else if (cartData.timeLength == 'threeMonthPlan') {
            x += `<td>3 Months</td>`
            multiplier = 3;
        } else {
            x += `<td>1 Year</td>`
            multiplier = 6;
        }
        x += `<td>$${parseFloat(therapistInfo.sessionCost * multiplier * 1.12).toFixed(2)}</td>`
        x += `<td>${cartData.orderId}</td>`
        if (cartData.status == "refunded") {
            x += `<td>Refunded</td></tr>`
        } else if (new Date(cartData.expiringTime) > new Date()) {
            x += `<td class="activeStatus">Active</td></tr>`
        } else {
            x += `<td class="expiredStatus">Expired</td></tr>`
        }
        $("tbody").append(x);
    }

    /**
     * AJAX call that gets all previous purchases from the databsae and calls the helper function above to populate them.
     */
    await $.ajax({
        url: '/getPreviousPurchases',
        type: "GET",
        success: function (data) {
            if (data.length > 0) {
                document.getElementById('noOrderHistorySummary').style.display = 'none';
                document.getElementById('orderToolbar').style.display = 'flex';
                document.getElementById('orderTableContainer').style.display = 'flex';

                data.forEach(cartData => {
                    getTherapist(cartData, populateTherapist)
                });
                document.getElementById("resultsFound").innerHTML = data.length;
            }
        }
    });

    /**
     * Set the caret icons faced down by default.
     */
    document.getElementById('0').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('1').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('2').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('3').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('4').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('5').setAttribute("class", "bi bi-caret-down-fill");
    document.getElementById('6').setAttribute("class", "bi bi-caret-down-fill");

    /**
     * Call sort table fucntion when user clicks table headings.
     */
    sortTable();

    /**
     * If create button is clicked, display modal (form).
     */
    document.getElementById('refundBtn').onclick = function () {
        setTimeout(() => {
            /**
             * AJAX GET call that checks to see if the user already has an active session.
             */
            $.get('/activeSession', function (data) {
                if (data == "NoActiveSession") {
                    document.getElementById('modalHeader').style.display = 'block';
                    document.getElementById("headerRefund").innerHTML = "No active orders found"
                    document.getElementById("msgRefund").innerHTML = "You have no active session at this time. Please place an order from our <a href='/therapists'>Therapists</a> page"
                    document.getElementById('refundButtonsSec').style.display = 'none';
                } else {
                    $("#refundTherapist").text(`${data.therapistName}.`);
                    $("#refundPrice").text(`$${data.cost}`)
                }
            })
            orderRefundModal.style.display = "block";
            document.body.style.overflow = 'hidden';
        }, 50);
        $('#orderRefundBtn').off();
        $('#orderRefundBtn').click(() => {
            orderRefundModal.style.display = "none";
            document.getElementById('signupSuccessModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                /**
                 * AJAX POST call that allows user to refund their order.
                 */
                $.post('/refundOrder', function () {
                    location.reload();
                })
            }, 2500);
        });
    }
});

/**
 * 
 * This function calls an AJAX call to get therapist information.
 * 
 * @param {*} cartData as object
 * @param {*} callback as listener
 */
function getTherapist(cartData, callback) {
    let therapistId = cartData.therapist
    let therapistInfo;
    /**
     * AJAX call that gets the therapists information, adds the required info into an array
     * and returns it back through the callback.
     */
    $.ajax({
        url: '/getTherapistInfo',
        method: "POST",
        data: {
            therapistId: therapistId
        },
        success: function (therapist) {
            therapistInfo = {
                fullName: `${therapist.firstName.charAt(0)}. ${therapist.lastName}`,
                sessionCost: therapist.sessionCost
            }
            callback(therapistInfo, cartData);
        }
    })
}

/**
 * Live search function for table search.
 */
function searchTable() {
    const searchInput = document.getElementById("searchbar").value.toUpperCase();
    const table = document.getElementById("orderTable");
    const trs = table.tBodies[0].getElementsByTagName("tr");
    let count = 0;

    // Loop through tbody's rows
    for (var i = 0; i < trs.length; i++) {
        var tds = trs[i].getElementsByTagName("td");
        trs[i].style.display = "none";

        // loop through row cells to check each element
        for (var j = 0; j < tds.length; j++) {
            // check if there's a match in the table
            if (tds[j].innerHTML.toUpperCase().indexOf(searchInput) > -1) {
                trs[i].style.display = "";
                count++;
                break;
            }
        }
    }
    $("#resultsFound").html(`${count}`);
}

/**
 * Sort table function when table headings is clicked.
 */
function sortTable() {
    const table = document.getElementById('orderTable');
    const headers = table.querySelectorAll('.tHead');
    const directions = Array.from(headers).map(function (header) {
        return '';
    });

    const transform = function (index, content) {
        const type = headers[index].getAttribute('data-type');
        var sort = {};
        switch (type) {
            case 'number':
                content = content.substring(1);
                return parseFloat(content);
            case 'string':
            case 'plan':
                content = content.substring(2);
                return content;
            default:
                return content;
        }
    };

    const tableBody = table.querySelector('tbody');
    const rows = tableBody.getElementsByClassName('tableRows');

    const sortColumn = function (index) {
        const direction = directions[index] || 'asc';
        const multiplier = direction === 'asc' ? 1 : -1;
        const newRows = Array.from(rows);

        newRows.sort(function (rowA, rowB) {
            const cellA = rowA.querySelectorAll('td')[index].innerHTML.toLowerCase();
            const cellB = rowB.querySelectorAll('td')[index].innerHTML.toLowerCase();

            const a = transform(index, cellA);
            const b = transform(index, cellB);

            switch (true) {
                case a > b:
                    return 1 * multiplier;
                case a < b:
                    return -1 * multiplier;
                case a === b:
                    return 0;
            }
        });

        [].forEach.call(rows, function (row) {
            tableBody.removeChild(row);
        });

        if (direction === 'asc') {
            directions[index] = 'desc';
            document.getElementById(index).setAttribute("class", "bi bi-caret-down-fill");

        } else {
            directions[index] = 'asc';
            document.getElementById(index).setAttribute("class", "bi bi-caret-up-fill");
        }

        newRows.forEach(function (newRow) {
            tableBody.appendChild(newRow);
        });
    };

    [].forEach.call(headers, function (header, index) {
        header.addEventListener('click', function () {
            sortColumn(index);
            for (var i = 0; i < headers.length; i++) {
                if (i == index) {
                    if (directions[index] === 'asc') {
                        document.getElementById(i).parentElement.style.color = '#000';
                    } else {
                        document.getElementById(i).parentElement.style.color = '#09C5A3';
                    }
                } else {
                    document.getElementById(i).parentElement.style.color = '#000';
                }
            }
        });
    });
}

/**
 * If cancel button is clicked, hide modal for Delete User.
 */
document.getElementById("closeRefund").onclick = function () {
    orderRefundModal.style.display = "none";
    document.body.style.overflow = 'auto';
}

/**
 * If cancel button is clicked, hide modal for Delete User.
 */
document.getElementById("closeRefundIcon").onclick = function () {
    orderRefundModal.style.display = "none";
    document.body.style.overflow = 'auto';
}

/**
 * 
 * If user clicks outside of the modal for both Create, Edit and Delete then hide modal
 * 
 * @param {*} event as event listener
 */
window.onclick = function (event) {
    if (event.target == orderRefundModal) {
        orderRefundModal.style.display = "none";
        document.body.style.overflow = 'auto';
    }
}