/**
 * Constant variables.
 */
const cartExistModal = document.getElementById('cartExistModal');
const therapistExistModal = document.getElementById('therapySessionExistModal');
const notAuthorizedModal = document.getElementById('notAuthorizedModal');

var currentURL = window.location.href;
/**
 * Wait 0.5 seconds before loading the page, allows us to fetch data faster if there are more than 20 therapists.
 */
if (currentURL !=  window.location.origin + '/therapists') {
    setTimeout("window.location=currentURL", 500);
}

$(document).ready(async function () {
    /**
     * AJAX call that gets all the therapists from the database and 
     * displays them in a table as rows on the page.
     */
    await $.ajax({
        url: '/getTherapists',
        type: "GET",
        success: function (data) {
            var i = 1;

            data.forEach(function (Therapist) {
                var x = `<div class="therapistCard" id="${i}">`;
                x += `<img src="${Therapist.profileImg}" alt="Therapist 1">`
                x += '<div class="cardContent">'
                x += `<h3>${Therapist.firstName} ${Therapist.lastName}</h3>`
                x += `<p>${Therapist.yearsExperience} years of experience in the profession, and offers $${Therapist.sessionCost} per session</p>`
                x += `<div><button class="therapistBtn" id="${Therapist._id}">Purchase Session</button></div>`
                x += '</div>'
                x += '</div>'
                document.getElementById("therapistList").innerHTML += x;
                i++;
            })
        }
    })

    /**
     * 
     * Helper function that allows a user to add a therapist to their shopping cart.
     * 
     * @param {*} data as an object
     */
    function addToCartHandler(data) {
        $.get('/isLoggedIn', function (user) {
            if (user.userType != 'patient') {
                notAuthorizedModal.style.display = 'block';
                btn.title = "Only patients can purchase therapy sessions."
                btn.style.cursor = "context-menu";
            } else {
                if (data == 'cartExists') {
                    cartExistModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                } else if (data == "orderExists") {
                    setTimeout(() => {
                        /**
                         * AJAX GET call that checks to see if an active session already exists for the user.
                         */
                        $.get('/activeSession', function (data) {
                            $("#therapistName").text(`${data.therapistName}.`);
                            $("#expireDate").text(`${new Date(data.purchased).toLocaleString('en-CA', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}`)
                            $("#expireTime").text(`${new Date(data.purchased).toLocaleString('en-CA', { hour: 'numeric', minute: 'numeric', hour12: true })}`)
                        })
                        therapistExistModal.style.display = 'block';
                        document.body.style.overflow = 'hidden';
                    }, 50);
                } else {
                    window.location = "/checkout"
                }
            }
        });
    }
    /**
     * Disable buttons for admin, therapists, and logged out users.
     */
    const therapistBtns = document.querySelectorAll(".therapistBtn");
    therapistBtns.forEach(function (btn) {
        $(btn).click(() => {
            /**
             * AJAX call that adds an item to the cart by calling its helper function.
             */
            $.ajax({
                url: "/addToCart",
                type: "POST",
                data: {
                    therapist: btn.id
                },
                success: addToCartHandler
            })
        })
    })
})

/**
 * If cancel button is clicked, hide modal for Cart Exist 
 */
document.getElementById("closeCart").onclick = function () {
    cartExistModal.style.display = "none";
    document.body.style.overflow = 'auto';
}

/**
 * If cancel button is clicked, hide modal for Cart Exist 
 */
document.getElementById("closeSession").onclick = function () {
    therapistExistModal.style.display = "none";
    document.body.style.overflow = 'auto';
}

/**
 * If cancel button is clicked, hide modal for Cart Exist 
 */
document.getElementById("closeAuthorized").onclick = function () {
    notAuthorizedModal.style.display = "none";
    document.body.style.overflow = 'auto';
}

/**
 * 
 * If user clicks outside of the modal for Cart Exist Modal then hide modal.
 * 
 * @param {*} event as an event listener
 */
window.onclick = function (event) {
    if (event.target == cartExistModal) {
        cartExistModal.style.display = "none";
        document.body.style.overflow = 'auto';
    } else if (event.target == therapistExistModal) {
        therapistExistModal.style.display = "none";
        document.body.style.overflow = 'auto';
    }
}