/* =========================================
   CITIZEN DASHBOARD
   ========================================= */


/* Check login */

const loggedIn =
    localStorage.getItem("citizenLoggedIn");

const citizenId =
    localStorage.getItem("currentCitizenId");

const citizenName =
    localStorage.getItem("currentCitizenName");


/*
 * If the citizen is not logged in,
 * send them back to login.
 */

if (
    loggedIn !== "true" ||
    !citizenId
) {

    window.location.href = "login.html";

}


/* Display citizen information */

document.getElementById("citizenName").textContent =
    citizenName || "Citizen";

document.getElementById("citizenId").textContent =
    citizenId || "---";


/* =========================================
   RAISE COMPLAINT
   ========================================= */

function raiseComplaint() {

    window.location.href =
        "complaint.html";

}


/* =========================================
   MY COMPLAINTS
   ========================================= */

function viewComplaints() {

    /*
     * Member B will eventually connect
     * GET /complaints/mine here.
     *
     * For now we will create the page
     * in the next step.
     */

    window.location.href =
        "my-complaints.html";

}


/* =========================================
   LOGOUT
   ========================================= */

function logout() {

    localStorage.removeItem(
        "citizenLoggedIn"
    );

    localStorage.removeItem(
        "currentCitizenId"
    );

    localStorage.removeItem(
        "currentCitizenName"
    );

    window.location.href =
        "login.html";

}