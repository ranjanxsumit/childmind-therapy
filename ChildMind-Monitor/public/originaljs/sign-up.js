/**
 * Constant variables.
 */
const batmanAnimation = document.getElementById('batmanImg');
const batmanSec = document.getElementById('batmanImg');

/**
 * 
 * This function helps with input validation from the forms to ensure user
 * inputs values that match our patterns and minumum requirements.
 * 
 * @returns true if the inputted values are invalid.
 */
function clientInputValidation(){
    validated = false;
    var phoneLength = $("#phone").val();
    if (phoneLength.length != 10) {
        window.scrollTo(0, document.body.scrollHeight);
        document.getElementById("signUpErrorMessage").style.display = 'block';
        document.getElementById("signUpErrorMessage").innerHTML = "Your phone number must be of length 10";
    } else if (!isEmail($("#email").val())) {
        window.scrollTo(0, document.body.scrollHeight);
        document.getElementById("signUpErrorMessage").style.display = 'block';
        document.getElementById("signUpErrorMessage").innerHTML = "Please follow this email pattern: example@email.com";
    } else if (inputValidation($("#userType").val())) {
        window.scrollTo(0, document.body.scrollHeight);
        document.getElementById("signUpErrorMessage").style.display = 'block';
        document.getElementById("signUpErrorMessage").innerHTML = "There are empty fields";
    } else if (passwordValidation()) {
        window.scrollTo(0, document.body.scrollHeight);
        document.getElementById("signUpErrorMessage").style.display = 'block';
        document.getElementById("signUpErrorMessage").innerHTML = "Password must be at least 5 or less than 20 characters long";
    } else if (negativeValidation()) {
        window.scrollTo(0, document.body.scrollHeight);
        document.getElementById("signUpErrorMessage").style.display = 'block';
        document.getElementById("signUpErrorMessage").innerHTML = "Experience or cost of session cannot be less than 0";
    } else{
        validated = true;
    }
    return validated;
}

/**
 * 
 * This function acts as a helper function that displays proper error messages
 * if duplicate records exists in the database.
 * 
 * @param {*} data as an JSON object
 */
function handleSignUpResponse(data) {
    if (data == "existingEmail") {
        window.scrollTo(0, document.body.scrollHeight);
        document.getElementById("signUpErrorMessage").style.display = 'block';
        document.getElementById("signUpErrorMessage").innerHTML = "A user with that email already exists";
    } else if (data == "existingPhone") {
        window.scrollTo(0, document.body.scrollHeight);
        document.getElementById("signUpErrorMessage").style.display = 'block';
        document.getElementById("signUpErrorMessage").innerHTML = "A user with that phone number already exists";
    } else if (data == "existingUsername") {
        window.scrollTo(0, document.body.scrollHeight);
        document.getElementById("signUpErrorMessage").style.display = 'block';
        document.getElementById("signUpErrorMessage").innerHTML = "A user with that username already exists";
    } else if (data == "login") {
        document.getElementById("signUpErrorMessage").style.display = 'none';
        document.getElementById('signupSuccessModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            window.location = '/login'
        }, 2500);
    }
}

/**
 * AJAX call that signs up the user if input validations and duplicate records are cleared.
 */
$('#signupBtn').click(() => {
    if (clientInputValidation()) {
        $.ajax({
            url: '/sign-up',
            type: 'POST',
            data: {
                firstname: $("#firstname").val().charAt(0).toUpperCase() + $("#firstname").val().substring(1),
                lastname: $("#lastname").val().charAt(0).toUpperCase() + $("#lastname").val().substring(1),
                username: $("#username").val().toLowerCase(),
                phone: $("#phone").val(),
                email: $("#email").val().toLowerCase(),
                userType: $("#userType").val(),
                yearsExperience: $("#yearsExperience").val(),
                sessionCost: $("#sessionCost").val(),
                password: $("#password").val(),
            }, success: handleSignUpResponse
        })
    }
});

/**
 * Set for every second.
 */
setInterval(eastereEgg, 1000);

/**
 * Easter egg function.
 */
var doOnce = false;
/**
 * This function plays an animation when the username field includes the word 'batman'.
 */
function eastereEgg() {
    $('#username').keyup(function () {
        var userField = $(this).val().toLowerCase();
        if (userField.includes('batman') && doOnce == false) {
            window.scrollTo(0, document.body.scrollHeight);
            batmanAnimation.classList.add('startAnimation');
            document.getElementById("audio").play();
            document.getElementById("audio").volume = 1;
            doOnce = true;
        }
    });
}

/**
 * 
 * This function checks to see if the email in the form field mathces the email pattern.
 * 
 * @param {*} email as an input valie
 * @returns true if the email is valid, else returns false.
 */
function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

/**
 * 
 * Helper function that checks the input validations on the fields.
 * 
 * @param {*} userType as a input value
 * @returns true if the input values are invalid
 */
function inputValidation(userType) {
    const inpObjFirstName = document.getElementById("firstname");
    const inpObjLastName = document.getElementById("lastname");
    const inpObjUsername = document.getElementById("username");
    const inpObjExperience = document.getElementById("yearsExperience");
    const inpObjSession = document.getElementById("sessionCost");
    if (userType == "therapist") {
        if (!inpObjFirstName.checkValidity() || !inpObjLastName.checkValidity() || !inpObjUsername.checkValidity()
            || !inpObjExperience.checkValidity() || !inpObjSession.checkValidity()) {
            return true;
        }
    } else {
        if (!inpObjFirstName.checkValidity() || !inpObjLastName.checkValidity() || !inpObjUsername.checkValidity()) {
            return true;
        }
    }
}

/**
 * 
 * Checks the input validation for password field.
 * 
 * @returns true if the input value is invalid
 */
function passwordValidation() {
    const inpObjPassword = document.getElementById("password");
    if (!inpObjPassword.checkValidity()) {
        return true;
    }
}

/**
 * 
 * Checks the input validation for sessionCost and yearsExperience fields.
 * 
 * @returns true if the fields are invalid
 */
function negativeValidation() {
    const yearsExp = document.getElementById("yearsExperience").value;
    const cost = document.getElementById("sessionCost").value;
    if (yearsExp < 0 || cost < 0) {
        return true;
    }
}


/**
 * 
 * Display therapy field options if usertype is a therapist
 * 
 * @param {*} selectObject as event listener
 */
function showTherapyOptions(selectObject) {
    const value = selectObject.value;
    const therapyFieldOptions = document.querySelectorAll('.therapistOptions');
    if (value == 'therapist') {
        for (var i = 0; i < therapyFieldOptions.length; i++) {
            therapyFieldOptions[i].style.display = 'flex';
        }
    } else {
        for (var i = 0; i < therapyFieldOptions.length; i++) {
            therapyFieldOptions[i].style.display = 'none';
        }
    }
}

/**
 * Trigger click function for enter key for all input fields.
 */
const input = document.querySelectorAll(".form-control");
for (var i = 0; i < input.length; i++) {
    input[i].addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("signupBtn").click();
        }
    });
}