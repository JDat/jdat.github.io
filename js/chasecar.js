let chaseDebug = true;

const chaseUploadInterval = 15;            // in seconds

if (chaseDebug) {
    var fakeCorrds = [57.00, 25.00];
}

let chaseData = {
callSign : 'Voldemort',
antenna : 'Portable 1/4 monopole',
email : 'none@none.org'
};

let message = 'Send your location to server?\nChase car mode.';
let chaseMode = window.confirm(message);

if (chaseMode) {
    loadChaseParameters();
}

function getCookie(cname) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    //console.log(document.cookie);
    let ca = decodedCookie.split(";");
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function loadChaseParameters() {
    let lastChaseUpload = Date.now();


    if (getCookie("chaseDataCallSign") != "") {
        chaseData.callSign = getCookie("chaseDataCallSign");
    }
    chaseData.callSign = prompt("Enter callsign:", chaseData.callSign);

    if (getCookie("chaseDataAntenna") != "") {
        chaseData.antenna = getCookie("chaseDataAntenna");
    }
    chaseData.antenna = prompt("Enter Antenna name:", chaseData.antenna);

    if (getCookie("chaseDataEmail") != "") {
        chaseData.email = getCookie("chaseDataEmail");
    }
    chaseData.email = prompt("Enter your email.\n Need if sondehub.org admins have questions.", chaseData.email);

    const d = new Date();
    d.setTime(d.getTime() + (10*365*24*60*60*1000));    // 10 years
    let expires = 'expires='+ d.toUTCString();

    document.cookie = "chaseDataCallSign=" + chaseData.callSign + ";" + expires + ";path=/;SameSite=None; Secure";
    document.cookie = "chaseDataAntenna=" + chaseData.antenna + ";" + expires + ";path=/;SameSite=None; Secure";
    document.cookie = "chaseDataEmail=" + chaseData.email + ";" + expires + ";path=/;SameSite=None; Secure";
    
    setInterval( doSomethingWithChasePOST, chaseUploadInterval * 1000);
}

function doSomethingWithChasePOST() {
    try {
        let a = myPos;
    }
    catch (err) {
        console.log('No myPos variable!');
        if (!chaseDebug) return;
    }
    
    let altitude = isNaN(myPos.altitude) ? 0 : myPos.altitude;
    
    if (chaseDebug) {
        //console.log(fakeCorrds, myPos);
        altitude = 50;
        fakeCorrds[0] +=0.001;
        fakeCorrds[1] +=0.001;
        doChaseUpload(fakeCorrds[0], fakeCorrds[1], altitude, chaseData.callSign, chaseData.antenna, chaseData.email);
    } else {
        doChaseUpload(myPos.latlng.latitude, myPos.latlng.longitude, altitude, chaseData.callSign, chaseData.antenna, chaseData.email);
    }

}

function doChaseUpload(lat, lon, alt, callsign, antenna, email) {
    let url = "https://api.v2.sondehub.org/listeners";

    let data = `{"software_name": "kgChase",
        "software_version": "0.0.1",
        "uploader_callsign": "` + callsign + `",
        "uploader_position": [` + lat +`, ` + lon + `, ` + alt + `],
        "uploader_antenna": "` + antenna + `",
        "uploader_contact_email": "` + email + `",
        "mobile": true
    }`;

    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
       if (xhr.readyState === 4) {
          //console.log(xhr.status);
          //console.log(xhr.statusText);
          //console.log(xhr.responseText.toString());
       }};

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}
