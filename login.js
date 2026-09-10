/* =====================================================
   CITIZEN LOGIN SYSTEM
   ===================================================== */


/* =====================================================
   STORAGE
   ===================================================== */

function getCitizens() {

    const data = localStorage.getItem("citizens");

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}


function saveCitizens(citizens) {

    localStorage.setItem(
        "citizens",
        JSON.stringify(citizens)
    );
}


/* =====================================================
   TAB SWITCHING
   ===================================================== */

function showPublic() {

    document
        .getElementById("publicSection")
        .classList.remove("hidden");

    document
        .getElementById("adminSection")
        .classList.add("hidden");

    document
        .getElementById("publicTab")
        .classList.add("active");

    document
        .getElementById("adminTab")
        .classList.remove("active");
}


function showAdmin() {

    document
        .getElementById("publicSection")
        .classList.add("hidden");

    document
        .getElementById("adminSection")
        .classList.remove("hidden");

    document
        .getElementById("publicTab")
        .classList.remove("active");

    document
        .getElementById("adminTab")
        .classList.add("active");
}


/* =====================================================
   PUBLIC LOGIN / REGISTER
   ===================================================== */

function showRegister() {

    document
        .getElementById("citizenLogin")
        .classList.add("hidden");

    document
        .getElementById("citizenRegister")
        .classList.remove("hidden");
}


function showLogin() {

    document
        .getElementById("citizenRegister")
        .classList.add("hidden");

    document
        .getElementById("citizenLogin")
        .classList.remove("hidden");
}


/* =====================================================
   CHECK CITIZEN ID
   ===================================================== */

const citizenIdInput =
    document.getElementById("registerCitizenId");

const idMessage =
    document.getElementById("idMessage");


citizenIdInput.addEventListener(
    "input",
    function () {

        const citizenId =
            this.value.trim().toLowerCase();


        idMessage.textContent = "";

        idMessage.className =
            "id-message";


        if (citizenId.length === 0) {
            return;
        }


        if (citizenId.length < 4) {

            idMessage.textContent =
                "Citizen ID must contain at least 4 characters.";

            idMessage.classList.add("invalid");

            return;
        }


        /*
         * Only letters, numbers, underscore
         * and hyphen are allowed.
         */

        if (!/^[a-zA-Z0-9_-]+$/.test(citizenId)) {

            idMessage.textContent =
                "Use only letters, numbers, _ or -.";

            idMessage.classList.add("invalid");

            return;
        }


        const citizens = getCitizens();


        const exists = citizens.some(
            citizen =>
                citizen.citizenId.toLowerCase() === citizenId
        );


        if (exists) {

            idMessage.textContent =
                "✕ This Citizen ID already exists. Choose another.";

            idMessage.classList.add("exists");

        } else {

            idMessage.textContent =
                "✓ Citizen ID is available.";

            idMessage.classList.add("available");
        }

    }
);


/* =====================================================
   REGISTRATION
   ===================================================== */

document
    .getElementById("registerForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("registerName")
                    .value
                    .trim();


            const mobile =
                document
                    .getElementById("registerMobile")
                    .value
                    .trim();


            const citizenId =
                document
                    .getElementById("registerCitizenId")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("registerPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            /* NAME */

            if (name.length < 2) {

                alert(
                    "Please enter your full name."
                );

                return;
            }


            /* MOBILE */

            if (!/^[0-9]{10}$/.test(mobile)) {

                alert(
                    "Please enter a valid 10-digit mobile number."
                );

                return;
            }


            /* CITIZEN ID */

            if (
                citizenId.length < 4 ||
                !/^[a-zA-Z0-9_-]+$/.test(citizenId)
            ) {

                alert(
                    "Please choose a valid Citizen ID."
                );

                return;
            }


            /* PASSWORD */

            if (password.length < 6) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            /* CONFIRM PASSWORD */

            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            const citizens = getCitizens();


            /* DUPLICATE CHECK */

            const exists = citizens.some(
                citizen =>
                    citizen.citizenId.toLowerCase() === citizenId
            );


            if (exists) {

                idMessage.textContent =
                    "✕ This Citizen ID already exists.";

                idMessage.className =
                    "id-message exists";

                return;
            }


            /* CREATE CITIZEN */

            const newCitizen = {

                citizenId: citizenId,

                name: name,

                mobile: mobile,

                password: password,

                createdAt: new Date().toISOString()

            };


            citizens.push(newCitizen);


            saveCitizens(citizens);


            /* SAVE CURRENT USER */

            localStorage.setItem(
                "citizenLoggedIn",
                "true"
            );

            localStorage.setItem(
                "currentCitizenId",
                citizenId
            );

            localStorage.setItem(
                "currentCitizenName",
                name
            );


            alert(
                "Account created successfully!\n\n" +
                "Your Citizen ID is:\n" +
                citizenId +
                "\n\nPlease remember this ID for login."
            );


            /*
             * Go to login screen.
             */

            showLogin();


            /*
             * Put Citizen ID into login box.
             */

            document
                .getElementById("loginCitizenId")
                .value = citizenId;


            document
                .getElementById("loginPassword")
                .value = "";

        }
    );


/* =====================================================
   CITIZEN LOGIN
   ===================================================== */

document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const citizenId =
                document
                    .getElementById("loginCitizenId")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const citizens = getCitizens();


            const citizen = citizens.find(
                user =>
                    user.citizenId.toLowerCase() === citizenId &&
                    user.password === password
            );


            if (!citizen) {

                alert(
                    "Invalid Citizen ID or password."
                );

                return;
            }


            /* LOGIN SUCCESS */

            localStorage.setItem(
                "citizenLoggedIn",
                "true"
            );

            localStorage.setItem(
                "currentCitizenId",
                citizen.citizenId
            );

            localStorage.setItem(
                "currentCitizenName",
                citizen.name
            );


            alert(
                "Login successful!\n\n" +
                "Welcome, " +
                citizen.name +
                "!"
            );


            /*
             * Change this later to your
             * real My Complaints page.
             */

            window.location.href =
                "index.html";

        }
    );


/* =====================================================
   ADMIN LOGIN
   ===================================================== */

document
    .getElementById("adminForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("adminUsername")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("adminPassword")
                    .value;


            /*
             * DEMO ADMIN ACCOUNT
             *
             * Username: admin
             * Password: admin123
             */

            if (
                username === "admin" &&
                password === "admin123"
            ) {

                localStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );


                alert(
                    "Admin login successful!"
                );


                window.location.href =
                    "index.html";

            } else {

                alert(
                    "Invalid admin username or password."
                );

            }

        }
    );