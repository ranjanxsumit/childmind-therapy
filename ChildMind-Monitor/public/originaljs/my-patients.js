$(document).ready(async function () {

    /**
     * 
     * This function will populate the table in the html page after fetching all the data from the database.
     * 
     * @param {*} cartData as object
     * @param {*} patientInfo as array
     */
    function populatePatients(cartData, patientInfo) {
        let multiplier;
        var x = `<tr class="tableRows">`;
        let purchasedDate = new Date(cartData.purchased);
        let offSet = purchasedDate.getTimezoneOffset() * 60 * 1000;
        let tLocalISO = new Date(purchasedDate - offSet).toISOString().slice(0, 10);
        x += `<td>${tLocalISO}</td>`;
        x += `<td>${new Date(cartData.purchased).toLocaleString('en-CA', { hour: 'numeric', minute: 'numeric', hour12: true })}</td>`
        x += `<td>${patientInfo.fullName}</td>`
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
        x += `<td>$${parseFloat(patientInfo.sessionCost * multiplier * 1.12).toFixed(2)}</td>`
        x += `<td>${cartData.orderId}</td>`
        if (cartData.status == "refunded") {
            x += `<td>Refunded</td></tr>`
        } else if (new Date(cartData.expiringTime) > new Date()) {
            x += `<td class="activeStatus">Active</td></tr>`
        } else x += `<td class="expiredStatus">Expired</td></tr>`
        $("tbody").append(x);
    }

    /**
     * AJAX call that finds all previous patients for a certain therapists
     * and calls the populatepatients helper function to display them.
     */
    await $.ajax({
        url: '/getPreviousPatients',
        type: "GET",
        success: function (data) {
            if (data.length > 0) {
                document.getElementById('noPatientsAvailable').style.display = 'none';
                document.getElementById('patientToolbar').style.display = 'flex';
                document.getElementById('patientTableContainer').style.display = 'flex';

                data.forEach(cartData => {
                    getPatient(cartData, populatePatients);
                });
                document.getElementById("resultsFound").innerHTML = data.length;
            }
        }
    });

    /**
     * Set the caret icons faced down by default
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
});

/**
 * 
 * This function will call an AJAX call to get the patients information.
 * 
 * @param {*} cartData as an object
 * @param {*} callback as a listener
 */
function getPatient(cartData, callback) {
    let userId = cartData.userId
    let therapistId = cartData.therapist
    let patientInfo;
    /**
     * AJAX call that gets the patient information.
     */
    $.ajax({
        url: '/getPatientInfo',
        method: "POST",
        data: {
            _id: userId
        },
        success: function (patient) {
            patientInfo = {
                fullName: `${patient.firstName.charAt(0)}. ${patient.lastName}`
            }
            /**
             * AJAX call that gets the therapist's information from the cart
             * and returns it along with the patient information from previous AJAX call.
             */
            $.ajax({
                url: '/getTherapistInfo',
                method: "POST",
                data: {
                    therapistId: therapistId
                },
                success: function (therapist) {
                    patientInfo.sessionCost = therapist.sessionCost;
                    callback(cartData, patientInfo);
                }
            })
        }
    })
}

/**
 * Live search function for table search.
 */
function searchTable() {
    const searchInput = document.getElementById("searchbar").value.toUpperCase();
    const table = document.getElementById("patientTable");
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
    const table = document.getElementById('patientTable');
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