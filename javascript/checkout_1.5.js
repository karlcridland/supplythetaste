let user_details = {};
let variation;
let temp_stamp = new Date().ymd();
let order_count = 1;
function initCheckout(){

    try{
        basket.items = JSON.parse(sessionStorage.getItem("basket")).items;
    }
    catch (e) {
        window.location.href = '/choose'
    }
    let main = document.getElementById('main');
    document.getElementById('banner').style.overflow = 'scroll';
    if(isMobile()){

        ['name','address','basket','voucher','payment'].forEach(function (segment){
            main.appendChild(document.getElementById(segment));
            document.getElementById(segment).style.transform = 'unset';
        })

        let v = document.getElementById('voucher_code');
        v.style.bottom = 'unset';
        v.style.marginLeft = '5%';
        v.style.marginTop = '50px';
        v.style.width = 'calc(90% - 240px)';

        let a = document.getElementById('apply');
        a.style.bottom = 'unset';
        a.style.marginRight = '5%';
        a.style.marginTop = '33px';

        main.removeChild(document.getElementById('banner'));

    }

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            uid = user.uid;
            user_details['email'] = user.email;
            get_details();
            get_address();
            main.style.opacity = '1';
            count_orders();
        }
        else{
            window.location.href = '/register.html?purchase=month_box';
        }
    });

    // display_delivery();
    display_basket();
    setUpConfirm();
}

function temp_address(){
    ['address line 1','address line 2','town/city','county','post code','country'].forEach(function (field){
        let new_field = field.replaceAll('address','').replaceAll(' ','');
        new_field = new_field.split('/')[0];
        if (user_details[field] !== null){
            ['temp','user'].forEach(function (a){
                write('orders/'+a+'/'+uid+'/'+temp_stamp+'/address/'+new_field,user_details[field]);
            })
        }
    })
}
function temp_basket(){
    let item_count = 1;
    basket.items.forEach(function (item){
        ['temp','user'].forEach(function (a) {
            write('orders/'+a+'/' + uid + '/' + temp_stamp + '/basket/' + item_count + '/name', item.name);
            write('orders/'+a+'/' + uid + '/' + temp_stamp + '/basket/' + item_count + '/quantity', item.quantity);
            write('orders/'+a+'/' + uid + '/' + temp_stamp + '/basket/' + item_count + '/price', item.price);
            write('orders/'+a+'/' + uid + '/' + temp_stamp + '/basket/' + item_count + '/variation', item.variation);
        })
        item_count++;
    })
}

function setUpConfirm(){
    let confirm = document.getElementById('confirm');
    confirm.style.top = 'calc(50% - '+confirm.offsetHeight/2+'px)';
    confirm.style.right = '30px';
    confirm.style.bottom = 'unset';
    document.getElementById('payment').style.maxHeight = '100px';
    document.getElementById('payment').style.minHeight = '100px';

    if (isMobile()){
        confirm.style.position = 'absolute';
        confirm.style.top = 'unset';
        confirm.style.margin = '30px';
        confirm.style.right = 'calc(5% + 20px)';
        ['address','payment'].forEach(function (a){
            document.getElementById(a).style.marginTop = '5%';
        })
    }

    confirm.onclick = function (){

        try{
            document.getElementById('body').removeChild(error_message);
            error_present.style.border = error_border;
        }
        catch (e) {

        }
        error_present = null;

        if (address_valid()){
            confirm.style.display = 'none';
            document.getElementById('payment').style.maxHeight = 'unset';
            document.getElementById('paypal_box').style.display = 'none';
            document.getElementById('paypal_box').style.display = 'block';
            set_up_paypal();
        }
    }
}

function count_orders(){
    ref.child('orders/status/'+uid).once('value',snapshot=>{
        order_count = snapshot.numChildren();
    })
}

function get_details(){
    ref.child('users/first name/'+uid).once('value',f =>{
        ref.child('users/last name/'+uid).once('value',l => {
            user_details['name'] = f.val() + ' ' + l.val();
            display_details();

            try{
                temp_basket();
            }
            catch (e) {

            }

        })
    })
}
function display_details(){
    let table = document.createElement('table');
    table.setAttribute('class','details');

    document.getElementById('name').appendChild(table);
    ['name','email', 'delivery date', 'message'].forEach(function (field){
        let row = document.createElement('tr');
        row.setAttribute('class','details');
        table.appendChild(row);

        let left = document.createElement('td');
        left.textContent = field;
        row.appendChild(left);

        if (isMobile()){
            table.style.left = '2px';
            table.style.width = 'calc(100% - 4px)';
            table.style.transform = 'translateX(-10px)';
            table.style.margin = 'unset'
            table.style.padding = 'unset'
            left.style.fontSize = '12px';
        }
        else{
            left.style.width = '30%';
        }

        let right = document.createElement('td');
        right.textContent = user_details[field];
        row.appendChild(right);

        let menu = document.createElement('div');
        switch (field){
            case 'delivery date':
                let dd = document.createElement('img');
                dd.setAttribute('class','dropdown');
                dd.src = 'media/dropdown.png';
                right.appendChild(dd);

                let dates = get_available_dates();
                let date = document.createElement('div');
                date.setAttribute('class','pick_date');
                date.innerHTML = dates[1];
                user_details['date'] = date_conversion[dates[1]];
                right.appendChild(date);

                if (!isMobile()){
                    date.onmouseenter = function (){
                        dd.src = 'media/dropdown_blue.png';
                        dd.style.opacity = '1';
                    }
                    date.onmouseleave = function (){
                        dd.src = 'media/dropdown.png';
                        dd.style.opacity = '0.5';
                    }
                }

                menu.setAttribute('class','dropdown_menu');
                document.getElementById('body').appendChild(menu);

                let once = true;
                menu.onclick = function (){
                    once = !once;
                    if (once){
                        menu.style.display = 'none';
                    }
                };

                [date,dd].forEach(function (a){
                    a.onclick = function (){
                        once = true;

                        function readjust(){
                            let viewportOffset = date.getBoundingClientRect();
                            let top = viewportOffset.top;
                            let left = viewportOffset.left;
                            menu.style.left = left+'px';
                            menu.style.top = top+'px';
                            menu.style.width = date.offsetWidth+'px';
                        }

                        document.getElementById('body').onresize = function (){
                            readjust();
                        }

                        document.getElementById('main').onscroll = function (){
                            menu.click();
                        }

                        document.getElementById('main').onclick = function (){
                            menu.click();
                        }

                        menu.innerHTML = '';
                        readjust();
                        let c = dates.length;
                        if (c > 6){
                            c = 6;
                        }
                        menu.style.height = date.offsetHeight*c+'px';
                        menu.style.display = 'initial';

                        dates.forEach(function (d){
                            let choice = document.createElement('div');
                            choice.setAttribute('class','pick_date');
                            choice.innerHTML = d;
                            choice.style.boxShadow = 'unset';
                            menu.appendChild(choice);

                            if (d !== 'choose a date'){
                                choice.onmouseenter = function (){
                                    choice.style.color = '#039be5';
                                }
                                choice.onmouseleave = function (){
                                    choice.style.color = 'black';
                                }
                                choice.onclick = function (){
                                    date.innerHTML = d;
                                    user_details['date'] = date_conversion[d];
                                }
                            }
                        })
                    }
                })

                break;
            case 'message':
                user_details['note'] = null;
                right.style.paddingTop = '10px'
                let ta = document.createElement('textarea');
                ta.placeholder = 'need to change up your order? tell us how'
                right.appendChild(ta);
                ta.onclick = function (){
                    menu.style.display = 'none';
                }
                ta.onkeyup = function (){
                    user_details['note'] = ta.value;
                }
                break;
        }
    })
}

let date_conversion = {};
function get_available_dates(){
    let d = ['choose a date'];
    let start = new Date();

    if ((new Date()).getDate() === (new Date(2020,2,9,0,0,0).getDate())){
        start = new Date(2021,2,12,0,0,0,0);
        d.push(start.str());
        date_conversion[start.str()] = start.ymd();
    }

    for (let i = -4; i < 30; i++){
        if ((i >= 0) && (start.getDay() === 5 || start.getDay() === 2)){
            d.push(start.str());
            date_conversion[start.str()] = start.ymd();
        }
        start.setDate(start.getDate()+1);
    }

    return d;
}

let save_address = true;
function get_address(){
    ref.child('users/address/flag/'+uid).once('value',snapshot=>{
        if (snapshot.val()){
            ref.child('users/address/line1/'+uid).once('value',line1 =>{
                ref.child('users/address/line2/'+uid).once('value',line2 =>{
                    ref.child('users/address/town/'+uid).once('value',town =>{
                        ref.child('users/address/county/'+uid).once('value',county =>{
                            ref.child('users/address/postcode/'+uid).once('value',postcode =>{
                                ref.child('users/address/country/'+uid).once('value',country =>{
                                    user_details['address line 1'] = line1.val();
                                    user_details['address line 2'] = line2.val();
                                    user_details['town/city'] = town.val();
                                    user_details['county'] = county.val();
                                    user_details['post code'] = postcode.val();
                                    user_details['country'] = country.val();
                                    display_address();
                                })
                            })
                        })
                    })
                })
            })
        }
        else{
            display_address();
        }
    })
}
function display_address(){
    let table = document.createElement('table');
    table.setAttribute('class','details');

    document.getElementById('address').appendChild(table);

    let last;
    ['address line 1','address line 2','town/city','county','post code','country','save for next time'].forEach(function (field){
        let row = document.createElement('tr');
        row.setAttribute('class','details');
        table.appendChild(row);

        let left = document.createElement('td');
        left.textContent = field;
        row.appendChild(left);

        if (isMobile()){
            table.style.left = '2px';
            table.style.width = 'calc(100% - 4px)';
            table.style.transform = 'translateX(-10px)';
            table.style.margin = 'unset'
            table.style.padding = 'unset'
            left.style.fontSize = '12px';
        }
        else{
            left.style.width = '30%';
        }

        let right = document.createElement('td');
        row.appendChild(right);
        last = right;

        let input = document.createElement('input');
        input.setAttribute('id',field+'_input')
        right.appendChild(input);
        if (user_details[field] !== undefined){
            input.value = user_details[field];
        }

        input.onkeyup = function (){
            user_details[field] = input.value;
        }

        input.onkeydown = function (){
            let confirm = document.getElementById('confirm');
            if (confirm.style.display === 'none'){
                confirm.style.display = 'initial';
                document.getElementById('payment').style.maxHeight = '100px';
                document.getElementById('paypal_box').style.display = 'none';
            }
            temp_address();
        }
    })

    last.innerHTML = '';
    let s = new SwitchButton(null);
    last.appendChild(s.display)
    s.display.style.transform = 'scale(0.6,0.6) translate(-32px, -30px)';
    s.toggle();

    s.display.onclick = function (){
        s.toggle()
        save_address = s.active;
    }

    try{
        temp_address();
    }catch (e) {
        
    }
}

function get_card_details(){
    ref.child('users/card/number/'+uid).once('value',number =>{
        ref.child('users/card/expiry/month/'+uid).once('value',month => {
            ref.child('users/card/expiry/year/'+uid).once('value',year => {
                ref.child('users/card/security/' + uid).once('value',security => {
                    user_details['card number'] = number.val();
                    user_details['card month'] = month.val();
                    user_details['card year'] = year.val();
                    user_details['card security'] = security.val();
                    display_card_details();
                })
            })
        })
    })
}
function display_card_details(){
    let table = document.createElement('table');
    table.setAttribute('class','details');

    document.getElementById('payment').appendChild(table);
    table.style.marginBottom = 'calc(3% + 40px)';
    ['card number','card month','card year','card security'].forEach(function (field){
        let row = document.createElement('tr');
        row.setAttribute('class','details');
        table.appendChild(row);

        let left = document.createElement('td');
        left.textContent = field;
        row.appendChild(left);

        if (isMobile()){
            table.style.left = '2px';
            table.style.width = 'calc(100% - 4px)';
            table.style.transform = 'translateX(-10px)';
            table.style.margin = 'unset'
            table.style.padding = 'unset'
            left.style.fontSize = '12px';
        }
        else{
            left.style.width = '20%';
        }

        let right = document.createElement('td');
        row.appendChild(right);

        let input = document.createElement('input');
        right.appendChild(input);
        input.value = user_details[field];

        input.onkeyup = function (){
            user_details[field] = input.value;
        }

        switch (field){
            case 'card number':
                break
            default:
                input.style.width = '30%';
                break;
        }
    })

}

let refresh_basket = function (){
    document.getElementById('basket').removeChild(document.getElementById('basket_table'));
    display_basket();
}
function display_basket(){

    function make_row(type,contents){
        let row = document.createElement('tr');
        row.setAttribute('class','details');
        let cells = [];
        contents.forEach(function (data){
            let cell = document.createElement(type);
            cell.setAttribute('class','details');
            cells.push(cell);
            cell.innerHTML = data;
            row.appendChild(cell);
            cell.style.textAlign = 'right';
        })
        cells[0].style.width = '60%';
        cells[0].style.textAlign = 'left';
        return row;
    }

    let table = document.createElement('table');
    table.setAttribute('class','details');
    document.getElementById('basket').appendChild(table);
    table.setAttribute('id','basket_table')
    table.appendChild(make_row('th',['name','quantity','price']));

    if (isMobile()) {
        table.style.left = '2px';
        table.style.width = 'calc(100% - 4px)';
        table.style.transform = 'translateX(-10px)';
        table.style.margin = 'unset'
        table.style.padding = 'unset'
    }

    basket.items.forEach(function (item){
        table.appendChild(make_row('td',[item.name,item.quantity.toString(),item.price.toString().price()]))
    })
    if (basket.voucher_applied){
        let l = 'Discount code: '+basket.voucher_code;
        let r = '-'+basket.voucher+'%';
        if (!basket.percent){
            r = '-£'+basket.voucher+'.00'
        }
        let row = make_row('td',[l,'<span style="color: white">_</span>',r]);
        table.appendChild(row);
        row.style.color = '#ff2f2f';
    }
    table.appendChild(make_row('td',['Postage','<span style="color: white">_</span>','500'.price()]))
    table.appendChild(make_row('td',['Total','<span style="color: white">_</span>',(basket.total()+500).toString().price()]))
}

let england_counties = ['Avon',
    'Bedfordshire',
    'Berkshire',
    'Buckinghamshire',
    'Cambridgeshire',
    'Cheshire',
    'Cleveland',
    'Cornwall',
    'Cumbria',
    'Derbyshire',
    'Devon',
    'Dorset',
    'Durham',
    'East Sussex',
    'Essex',
    'Gloucestershire',
    'Hampshire',
    'Herefordshire',
    'Hertfordshire',
    'Isle of Wight',
    'Kent',
    'Lancashire',
    'Leicestershire',
    'Lincolnshire',
    'London',
    'Merseyside',
    'Middlesex',
    'Norfolk',
    'Northamptonshire',
    'Northumberland',
    'North Humberside',
    'North Yorkshire',
    'Nottinghamshire',
    'Oxfordshire',
    'Rutland',
    'Shropshire',
    'Somerset',
    'South Humberside',
    'South Yorkshire',
    'Staffordshire',
    'Suffolk',
    'Surrey',
    'Tyne and Wear',
    'Warwickshire',
    'West Midlands',
    'West Sussex',
    'West Yorkshire',
    'Wiltshire',
    'Worcestershire']

function address_valid(){
    let valid = true;
    ['address line 1','town/city','county','post code','country'].forEach(function (field){
        // let f = field.replaceAll('address ','').split('/')[0].split(' ')[0];
        let f = document.getElementById(field+'_input');
        if (!f.notEmpty()){
            valid = false;
        }
    })
    let country = document.getElementById('country_input');

    let in_england = false;
    if (isEnglishCounty(document.getElementById('county_input').value)){
        let val = country.value.toLowerCase().replaceAll(' ','').replaceAll('.','');
        if (val === 'england' || val === 'unitedkingdom' || val === 'uk'){

            in_england = true;
        }
    }
    if (country.error_message(in_england, 'we are only shipping orders to England at the present'))

    return valid;
}

function isEnglishCounty(tryCounty){
    let a = false;
    england_counties.forEach(function (county){
        if (tryCounty.toLowerCase().trim().replaceAll(' ','') === county.toLowerCase().trim().replaceAll(' ','') ){
            a = true;
        }
    })
    return a;
}

function commit_address(){
    if (save_address){
        ['address line 1','town/city','county','post code','country'].forEach(function (field) {
            let key = field.replaceAll('address ', '').split('/')[0].replaceAll(' ','');
            ref.child('users/address/'+key+'/'+uid).set(user_details[field]);
        })
        ref.child('users/address/flag/'+uid).set(true);
    }
    else{
        ref.child('users/address/flag/'+uid).set(false);
    }
}