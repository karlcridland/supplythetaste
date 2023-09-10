let redirect;
let c = 0;
function logged_in(){
    switch (redirect){
        case 'month_box':
            const urlParams = new URLSearchParams(window.location.search);
            let variation = urlParams.get('variation');
            c = urlParams.get('children');
            window.location.href = '/checkout.html?variation='+variation+'&children='+c;
            break;
        default:
            window.location.href = '/account'
            break;
    }
}

function registerOnLoad(){
    const urlParams = new URLSearchParams(window.location.search);
    redirect = urlParams.get('purchase');

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if (user.uid !== undefined){
                ref.child('users/last signed in/'+user.uid).set((new Date()).ymd());
            }
            logged_in();
        }
    });

    let email = document.getElementById('email');
    let password = document.getElementById('password');

    let aa = document.getElementById('email reg');
    let bb = document.getElementById('password reg');
    let cc = document.getElementById('confirm reg');
    let dd = document.getElementById('last name reg');
    let ee = document.getElementById('first name reg');

    [aa,bb,cc,dd,ee].forEach(function (field){
        field.onkeyup = function (e){
            if (e.key === 'Enter' || e.keyCode === 13) {
                document.getElementById('click register').click();
            }
        }
    });

    [email,password].forEach(function (field){
        field.onkeyup = function (e){
            if (e.key === 'Enter' || e.keyCode === 13) {
                document.getElementById('click sign in').click();
            }
        }
    })

    try{
        ['register','sign in'].forEach(function (a){
            sections.push(document.getElementById(a));
            reconfigure_sections();
        })
    }
    catch(e){}
    finally {
        if (isMobile()){
            document.getElementById('click sign in').style.bottom = '0';
            document.getElementById('click sign in').style.top = 'unset';
            document.getElementById('first').style.top = '10%';
            document.getElementById('first').style.margin = '25px';
            document.getElementById('first').style.height = 'calc(90% - 50px)';
            document.getElementById('first').style.width = 'calc(100% - 50px)';
            document.getElementById('email').style.marginTop = '20%';
            document.getElementById('forgot').style.marginTop = '10%';
            ['email','password','first name reg','last name reg','email reg','password reg','confirm reg'].forEach(function (input){
                let a = document.getElementById(input);
                a.style.width = 'unset'
                let width = a.offsetWidth;
                a.style.marginLeft = 'calc(50% - '+width/2+'px)';
            });
            try{
                document.getElementById('table 2').removeChild(document.getElementById('get rid 2'))
                document.getElementById('table 1').removeChild(document.getElementById('get rid 1'))
            }
            catch (e) {
                
            }

            let buttons = [];
            let see = true;
            ['sign in','register'].forEach(function (s){
                let section = document.getElementById(s);
                section.style.position = 'absolute';
                section.style.backgroundColor = 'white';
                section.style.width = '100%';
                section.style.height = '100%';

                let button = document.createElement('div');
                buttons.push(button);
                button.setAttribute('class','mobile_form');
                button.innerHTML = s;
                document.getElementById('main').appendChild(button);

                see = !see;
                let op = see;

                button.onclick = function (){
                    if (!op){
                        document.getElementById('sign in').style.display = 'initial';
                    }
                    else{
                        document.getElementById('sign in').style.display = 'none';
                    }
                    buttons.forEach(function (b){
                        b.style.backgroundColor = 'white';
                        b.style.color = 'black';
                    })
                    button.style.backgroundColor = '#0089f3';
                    button.style.color = 'white';
                }
            })

            buttons[0].style.right = '50px';
            buttons[0].style.left = 'unset';
            buttons[0].click()

        }
    }

    document.getElementById('first').style.display = 'block';
    ['email','password','first name reg','last name reg','email reg','password reg','confirm reg'].forEach(function (input){
        let a = document.getElementById(input);
        a.style.width = 'unset'
        let width = a.offsetWidth;
        a.style.marginLeft = 'calc(50% - '+width/2+'px)';
    });
}

function forgotten_password_popup(){
    let view = document.createElement('div');
    view.setAttribute('class','forgotten');
    let cover = document.createElement('div');
    cover.setAttribute('class','cover')
    document.getElementById('main').appendChild(cover);
    cover.appendChild(view);
    view.textContent = 'forgotten password'

    if (isMobile()){
        if (window.innerWidth < 400){
            view.style.width = window.innerWidth-100+'px';
            view.style.left = '20px';
        }
    }

    let input = document.createElement('input');
    input.setAttribute('class','sign_in');
    input.style.marginTop = '60px';
    input.style.width = 'calc(100% - 50px)';
    input.placeholder = 'email';
    view.appendChild(input);
    input.value = document.getElementById('email').value;
    window.setTimeout(function (){
        input.focus();
    },150);

    let confirm = document.createElement('div');
    confirm.setAttribute('class','send_email');
    confirm.textContent = 'send email';
    view.appendChild(confirm);

    let cancel = document.createElement('div');
    cancel.setAttribute('class','forgotten_cancel');
    cancel.textContent = 'cancel';
    cancel.style.right = confirm.offsetWidth+20+'px';
    view.appendChild(cancel);

    confirm.onclick = function (){
        if (input.validateEmail()){
            let email = input.value
            recover_email(input, function (){
                input.value = 'email sent to '+email;
                input.style.pointerEvents = 'none';
                input.style.backgroundColor = 'white';
                input.style.boxShadow = 'unset';
                view.removeChild(cancel);
                confirm.textContent = 'finish';
                confirm.onclick = function (){
                    document.getElementById('main').removeChild(cover);
                }
            });
        }
    }

    cancel.onclick = function (){
        document.getElementById('main').removeChild(cover);
    }

}

function attemptSignIn(){
    let email = document.getElementById('email');
    let password = document.getElementById('password');

    let a = email.validateEmail();
    let b = password.validatePassword();
    if (a && b){
        firebase.auth().signInWithEmailAndPassword(email.value, password.value).then((user) => {
            if (user){
                if (user.uid !== undefined){
                    ref.child('users/last signed in/'+user.uid).set((new Date()).ymd());
                }
                logged_in();
            }
        }).catch((error) => {
            email.error_message(false,'invalid email/password');
        });
    }
}

function attemptCreateUser(){
    let email = document.getElementById('email reg');
    let password = document.getElementById('password reg');
    let first_name = document.getElementById('first name reg');
    let last_name = document.getElementById('last name reg');
    let confirm = document.getElementById('confirm reg');

    let c = first_name.notEmpty();
    let a = email.validateEmail();
    let b = password.validatePassword();
    let d = last_name.notEmpty();
    let e = confirm.matchInput(password);

    if (a && b && c && d && e){
        firebase.auth().createUserWithEmailAndPassword(email.value, password.value).then((userCredential) => {
            let user = userCredential.user;
            let f = first_name.value.charAt(0).toUpperCase() + first_name.value.slice(1).toLowerCase().trim();
            let l = last_name.value.charAt(0).toUpperCase() + last_name.value.slice(1).toLowerCase().trim();
            ref.child('users/first name/'+user.uid).set(f);
            ref.child('users/last name/'+user.uid).set(l);
            ref.child('users/account created/'+user.uid).set((new Date()).ymd());
            user.updateProfile({
                displayName: [l,f].join(' ')
            }).then(function() {
                logged_in();
            }).catch(function(error) {
                email.error_message(false,'error: '+error.message);
            })
        })
        .catch((error) => {
            email.error_message(false,'error: '+error.message);
        });
    }

}

HTMLInputElement.prototype.matchInput = function (input){
    return this.error_message(((this.value === input.value) && this.value.length > 0),'must match password');
}

HTMLInputElement.prototype.validateEmail = function (){
    let a = this;
    return a.error_message((/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(a.value)),'please use a valid email address');
}

HTMLInputElement.prototype.validatePassword = function (){
    let regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
    return this.error_message(regex.test(this.value),'password must contain a mix of a-z/A-Z/0-9, min 8 characters');
}