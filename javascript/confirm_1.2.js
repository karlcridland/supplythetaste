function initConfirm(){
    const urlParams = new URLSearchParams(window.location.search);
    let test = urlParams.get('id');

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            ref.child('orders/user/'+user.uid+'/'+test+'/date').once('value',snapshot=>{
                console.log('orders/user/'+uid+'/'+test)
                console.log(snapshot.val())
                let str = 'thank you for shopping with us,<br>' +
                    'your order has been placed<br><br>' +
                    'delivery date: '+snapshot.val().toDate()+'<br><br>' +
                    'please check your <a id="account_click" class="account">account</a> for updates on your order!';
                document.getElementById('confirm').innerHTML = str;
                document.getElementById('account_click').href = '/account'
            })
        }
    })

}