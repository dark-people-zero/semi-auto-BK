var firebaseConfig = {
    apiKey: "AIzaSyAc2rQEf2fx_FXR7DYLMkHUcTdkz1Ra8tw",
    authDomain: "augipt-social.firebaseapp.com",
    databaseURL: "https://augipt-social.firebaseio.com",
    projectId: "augipt-social",
    storageBucket: "augipt-social.appspot.com",
    messagingSenderId: "1048845974504"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let provider = new firebase.auth.GoogleAuthProvider();

function check() {
    firebase.auth().onAuthStateChanged(user => {
        console.log(user);
    })
}

function login() {
    document.querySelector('.loading').classList.add('show');
    var situs = document.getElementById("situs").value;
    var dataLogin = {
        method: "google",
        situs: situs,
    }
    firebase.auth().signInWithPopup(provider).then(res => {
        var credential = res.credential;
        var token = credential.accessToken;
        dataLogin.token = token;
        dataLogin.email = res.user.email;
        dataLogin.password = res.user.uid;
        window.loginFirebase(dataLogin);
    }).catch(e=>{
        console.log(e)
    })
}

function logout() {
    firebase.auth().signOut();
}

document.getElementById('loginGoogle').addEventListener('click', login);
