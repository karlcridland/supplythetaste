// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let config = {
    apiKey: "AIzaSyCDcbA9tK9AtyV231HcEHNpB3OIXI72kPI",
    authDomain: "supplythetaste.firebaseapp.com",
    projectId: "supplythetaste",
    storageBucket: "supplythetaste.appspot.com",
    messagingSenderId: "62865581138",
    appId: "1:62865581138:web:b960385353952f6b7a2b8b",
    measurementId: "G-E2H7Y8F1XJ"
}

firebase.initializeApp(config);

let storage = firebase.storage();

let ref = firebase.database().ref();

function write(path,value,callback){
    ref.child(path).set(value);
    let attempts = 0;
    function check_value(){
        ref.child(path).once('value',snapshot=>{
            if (snapshot.val() === value){
                if (callback !== undefined){
                    callback()
                }
            }
            else{
                if (attempts < 5){
                    check_value()
                    attempts++;
                }
            }
        })
    }
    check_value();
}

function signOut(){
    firebase.auth().signOut().then(function() {
        window.location.href = '/'
    }).catch(function(error) {
        // An error happened.
    });
}

function recover_email(input,callback){
    firebase.auth().sendPasswordResetEmail(input.value).then(function() {
        callback()
    }).catch(function(error) {
        input.error_message(false,error);
    });
}

HTMLImageElement.prototype.getImage = function (path,error_){
    let image = this;
    storage.ref(path).getDownloadURL().then(function(url) {
        image.src = url;
    }).catch(function(error) {
        console.log(error);
        if (error_){
            error_();
        }
    });
}