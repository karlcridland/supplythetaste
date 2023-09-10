let toggle;
function init_user(){
    let main = document.getElementById('main');
    main.innerHTML = '';

    let background = document.createElement('div');
    background.setAttribute('class','background')
    main.appendChild(background);

    let side = document.createElement('div');
    side.setAttribute('class','sidebar');
    side.setAttribute('id','sidebar');
    main.appendChild(side);

    result = document.createElement('div');
    result.setAttribute('class','result');
    result.setAttribute('id','result');
    main.appendChild(result);

    download_user_info();

    toggle = document.createElement('img');
    toggle.setAttribute('class','toggle');
    toggle.src = 'media/arrow.png'
    toggle.style.transform = 'rotate(180deg)';
    document.getElementById('main').appendChild(toggle);

    let expanded = true;
    toggle.onclick = function (){
        expanded = !expanded;
        let br = 'unset';
        let o = 0;
        let width = 0;
        if (expanded){
            width = 300;
            br = '20px 0 0 20px';
            o = 1;
        }
        side.animate([
            {opacity: o.toString()}
        ],{
            duration: 200,
            iterations: 1
        })
        toggle.animate([
            {transform: 'rotate('+(o*180)+'deg)'}
        ],{
            duration: 200,
            iterations: 1
        })
        result.animate([
            {left: width+'px', width: 'calc(100% - '+width+'px)', borderRadius: br}
        ],{
            duration: 200,
            iterations: 1
        })
        window.setTimeout(function (){
            result.style.left = width+'px';
            result.style.width = 'calc(100% - '+width+'px)';
            result.style.borderRadius = br;
            side.style.opacity = o.toString();
            toggle.style.transform = 'rotate('+(o*180)+'deg)';
        },150)
    }
    init_sidebar();
}

let selected = 'dashboard';
let result;
let user_info = {}
let user_orders = {};
let sidebar_buttons = {};
let recipe_guide = [];
let has_active = false;

function download_user_info(){
    ref.child('users/first name/'+uid).once('value',snapshot=>{
        user_info['first name'] = snapshot.val()
        document.getElementById('welcome').textContent = 'Welcome back, '+snapshot.val();
    });
    ref.child('orders/user/'+uid).once('value',snapshot=>{
        downloadMenus(function (){
            snapshot.forEach(function (order){
                let user_order = new Basket();
                let items = order.child('basket');
                user_order.address = order.child('address').val();
                user_order.delivery_slot = order.val()['date'];
                user_order.delivered_to = order.val()['name'];
                let voucher = order.val()['voucher'];
                let voucher_code = voucher.split(': ');
                user_order.apply_coupon(voucher_code[0],voucher_code[1].replaceAll('%',''),true);
                items.forEach(function (item_data){
                    let name = item_data.val()['name'];
                    let result = has_instructions(name);
                    console.log(result)
                    if (!recipe_guide.includes(name) && result){
                        recipe_guide.push(name)
                        recipe_guide.sort()
                    }
                    let price = item_data.val()['price'];
                    let quantity = item_data.val()['quantity'];
                    let item = new BasketItem(name,quantity,null,price);
                    user_order.items.push(item);
                })
                ref.child('orders/status/'+uid+'/'+order.key).on('value',status=>{
                    ref.child('orders/timestamp/'+uid+'/'+order.key).on('value',timestamp=>{
                        user_order.dispatched = status.val()['dispatched'];
                        user_order.prepared = status.val()['prepared'];

                        if (user_order.dispatched){
                            user_order.last_update = timestamp.val()['dispatched'];
                            user_order.dispatched_date = timestamp.val()['dispatched'];
                            user_order.status = 'dispatched';
                        }
                        else if (user_order.prepared){
                            user_order.last_update = timestamp.val()['prepared'];
                            user_order.prepared_date = timestamp.val()['prepared'];
                            user_order.status = 'prepared';
                        }
                        else{
                            user_order.last_update = order.key;
                            user_order.status = 'received';
                        }

                        has_active = false;
                        Object.values(user_orders).forEach(function (uo){
                            if (uo.status === 'prepared' || uo.status === 'received'){
                                has_active = true;
                            }
                        })

                        open_sidebar_button(false);
                    })
                })
                user_orders[order.key] = user_order;
            })
        })
    });
    ['address line 1','address line 2','town/city','county','postcode','country'].forEach(function (field){
        let key = field.replaceAll('address ', '').split('/')[0].replaceAll(' ','');
        ref.child('users/address/'+key+'/'+uid).once('value',snapshot=>{
            user_info[field] = snapshot.val()
            if (try_address()){
                open_sidebar_button()
            }
        })
    });
    ['paper','email'].forEach(function (id){
        ref.child('users/settings/'+id+'/'+uid).once('value',snapshot=>{
            if (snapshot.exists()){
                user_info[id] = snapshot.val()
                open_sidebar_button();
            }
        })
    })
}

function try_address(){
    let all_there = true;
    ['address line 1','address line 2','town/city','county','postcode','country'].forEach(function (field){
        if (user_info[field] === undefined){
            all_there = false;
        }
    })
    return all_there;
}

function get_address(obj){
    let from = obj;
    if (from === undefined){
        from = user_info;
    }
    let address = '';
    ['address line 1','address line 2','town/city','county','postcode','country'].forEach(function (field){
        let key = field;
        if (obj !== undefined){
            key = field.replaceAll('address ', '').split('/')[0].replaceAll(' ','');
        }
        if (from[key] !== undefined && from[key] !== ''){
            if (address !== ''){
                address += '<br>'
            }
            address += from[key]
        }
    })
    return address;
}

function open_dashboard(){
    let orders = document.createElement('div');
    orders.setAttribute('class','result_item');
    result.appendChild(orders);
    orders.textContent = 'active orders';

    let table = order_table();
    orders.appendChild(table);

    if (has_active){
        Object.entries(user_orders).forEach(function ([key,value]){
            if (value.status !== 'dispatched'){
                let row = basket_item_row(key,value);
                table.appendChild(row);
            }
        })
    }
    else{
        orders.removeChild(table);
        let backup = document.createElement('div');
        backup.setAttribute('class','result_contents');
        orders.appendChild(backup);
        backup.innerHTML = 'You have no active orders.<br><br><br>Browse through our wide range of meals and create a new one <span class="link" id="meals">here</span>.' +
            '<br><br>Or look through your order history <span class="link" id="history">here</span>.';
        document.getElementById('meals').onclick = function (){
            window.location.href = '/choose';
        }
        document.getElementById('history').onclick = function (){
            sidebar_buttons['orders'].click();
            if (isMobile()){
                toggle.click()
            }
        }
    }

    let blocks = {};

    ['address','settings'].forEach(function (title){
        let settings = document.createElement('div');
        settings.setAttribute('class','result_item');
        settings.setAttribute('id',title);
        result.appendChild(settings);
        settings.textContent = title;

        let settings_body = document.createElement('div');
        settings_body.setAttribute('class','result_contents');
        settings.appendChild(settings_body);
        blocks[title] = settings_body;

        if (!isMobile()){
            settings.style.width = 'calc(50% - 40px)';
            settings_body.style.width = 'calc(100% - 40px)';
        }
    })

    if (!isMobile()){
        function rs(){
            if (result.offsetWidth < 1000){
                document.getElementById('address').style.width = 'calc(100% - 40px)';
                document.getElementById('settings').style.width = 'calc(100% - 40px)';
            }
            else{
                document.getElementById('address').style.width = 'calc(50% - 40px)';
                document.getElementById('settings').style.width = 'calc(50% - 40px)';
            }
        }
        rs();
        document.getElementById('body').onresize = function (){
            rs();
        }
    }

    let address = document.createElement('div');
    address.setAttribute('class','address');
    if (try_address()){
        address.innerHTML = '<span style="color: #039be5; font-size: 14px; width: 100%; text-align: right">edit<br></span><br>'+get_address();
    }
    else{
        address.innerHTML = '<span style="color: #039be5">add your address</span>'
    }
    blocks['address'].appendChild(address);

    address.onclick = function (){
        let cover = document.createElement('div');
        cover.setAttribute('class','cover');
        document.getElementById('main').appendChild(cover);

        let change = document.createElement('div');
        cover.appendChild(change);

        if (isMobile()){
            change.setAttribute('class', 'address_change_mobile');
        }
        else{
            change.setAttribute('class', 'address_change');
        }

        change.textContent = 'update address';

        let confirm = document.createElement('div');
        confirm.setAttribute('class','confirm');
        confirm.textContent = 'confirm';
        change.appendChild(confirm);

        let cancel = document.createElement('div');
        cancel.setAttribute('class','cancel');
        cancel.style.right = confirm.offsetWidth+'px';
        cancel.textContent = 'cancel';
        change.appendChild(cancel);

        cancel.onclick = function (){
            cover.parentElement.removeChild(cover);
        };

        ['address line 1','address line 2','town/city','county','postcode','country'].forEach(function (field){
            let input = document.createElement('input');
            input.setAttribute('class','address');
            input.setAttribute('id',field+'_input');
            input.placeholder = field;
            input.value = user_info[field];
            change.appendChild(input);
        })

        confirm.onclick = function (){
            let writes = 6;
            ['address line 1','address line 2','town/city','county','postcode','country'].forEach(function (field){
                let key = field.replaceAll('address ', '').split('/')[0].replaceAll(' ','');
                write('users/address/'+key+'/'+uid,document.getElementById(field+'_input').value,function (){
                    user_info[field] = document.getElementById(field+'_input').value;
                    writes--;
                    if (writes === 0){
                        cover.parentElement.removeChild(cover);
                        address.innerHTML = '<span style="color: #039be5; font-size: 14px; width: 100%; text-align: right">edit<br></span><br>'+get_address();
                    }
                })
            })

        }
    }

    let settings = document.createElement('table');
    settings.setAttribute('class','settings_table');
    blocks['settings'].appendChild(settings);

    ['receive paper menus','receive email updates'].forEach(function (title){
        let row = document.createElement('tr');
        settings.appendChild(row);
        let left = document.createElement('td');
        left.style.width = '50%';
        left.style.height = '50px';
        left.innerHTML = title;
        row.appendChild(left);
        let right = document.createElement('td');
        let sb = new SwitchButton(null);
        sb.display.style.transform = 'scale(0.5,0.5) translateY(-40px)'
        sb.display.style.margin = 'unset'
        right.style.width = '50%';
        right.appendChild(sb.display)
        row.appendChild(right);

        let id = title.split(' ')[1];
        if (user_info[id] === true){
            sb.toggle();
        }
        sb.display.setAttribute('id',id);
        sb.display.onclick = function (){
            sb.toggle();
            ref.child('users/settings/'+id+'/'+uid).set(sb.active);
        }
    })

}

basket_item_row = function (time,value){
    let row = document.createElement('tr');
    let a = value;
    console.log(a.delivery_slot)
    try{
        [value.delivery_slot.toDate(),a.status,a.last_update.toDate(),null].forEach(function (text){
            let cell = document.createElement('td');
            cell.style.fontSize = '14px';
            cell.style.paddingTop = '30px';
            cell.textContent = text;
            row.appendChild(cell);

            if (text === null){
                let see_more = document.createElement('div');
                see_more.setAttribute('class','see_more');
                see_more.textContent = 'details';
                cell.appendChild(see_more);


                see_more.onclick = function () {
                    let cover = document.createElement('div');
                    cover.setAttribute('class', 'cover');
                    document.getElementById('main').appendChild(cover);

                    let change = document.createElement('div');
                    cover.appendChild(change);

                    if (isMobile()){
                        change.setAttribute('class', 'address_change_mobile');
                    }
                    else{
                        change.setAttribute('class', 'address_change');
                    }

                    let confirm = document.createElement('div');
                    confirm.setAttribute('class', 'confirm');
                    confirm.textContent = 'done';
                    change.appendChild(confirm);

                    let cancel = document.createElement('div');
                    cancel.setAttribute('class', 'cancel');
                    cancel.style.right = confirm.offsetWidth + 'px';
                    cancel.textContent = 'report a problem';
                    // change.appendChild(cancel);

                    let scroll = document.createElement('div');
                    scroll.setAttribute('class','scroll');
                    change.appendChild(scroll);

                    let details = document.createElement('div');
                    details.setAttribute('class','scroll_element');
                    scroll.appendChild(details);

                    details.innerHTML = value.delivered_to+'<br>'+value.total().toString().price()+'<br><span style="font-size: 18px"><br>'+get_address(value.address)+'</span>'

                    let dates_table = document.createElement('table');
                    dates_table.setAttribute('class','scroll_element');
                    scroll.appendChild(dates_table);
                    let dates = {
                        'delivery slot':value.delivery_slot,
                        'date purchased':time,
                        'date prepared':value.prepared_date,
                        'date dispatched':value.dispatched_date
                    }
                    Object.keys(dates).forEach(function (date_title){
                        let row = document.createElement('tr');
                        dates_table.appendChild(row);
                        let left = document.createElement('td');
                        row.appendChild(left);
                        left.textContent = date_title;
                        let date = '--'
                        if (dates[date_title] !== undefined){
                            date = dates[date_title].toDate();
                        }
                        let right = document.createElement('td');
                        row.appendChild(right);
                        right.textContent = date;
                    })

                    let items_table = document.createElement('table');
                    items_table.setAttribute('class','scroll_element');
                    scroll.appendChild(items_table);

                    function add_row(left_val,right_val){
                        let row = document.createElement('tr');
                        let left = document.createElement('td');
                        left.style.height = '30px';
                        row.appendChild(left);
                        left.textContent = left_val;

                        let right = document.createElement('td');
                        row.appendChild(right);
                        right.textContent = right_val;
                        return row;
                    }
                    value.items.forEach(function (item_title){
                        let row = add_row(item_title.name,item_title.price.toString().price());
                        items_table.appendChild(row);
                    })
                    if (value.voucher_applied){
                        let row = add_row("Voucher applied: "+value.voucher_code,'-'+value.voucher+'%');
                        items_table.appendChild(row);
                    }
                    let row = add_row("Postage",value.postage.toString().price());
                    items_table.appendChild(row);


                    confirm.onclick = function (){
                        cover.parentElement.removeChild(cover);
                    }
                }
            }
        })
    }
    catch(e){

    }
    return row;
}

function order_table(){
    let table = document.createElement('table');
    table.setAttribute('class','order_table');
    table.style.fontFamily = 'Sans-Serif';

    let headers = ['delivery slot','status','last updated','information'];
    let row = document.createElement('tr');
    table.appendChild(row);
    headers.forEach(function (header){
        let cell = document.createElement('th');
        cell.textContent = header;
        row.appendChild(cell);
    })
    return table;
}

function open_recipes(){
    let orders = document.createElement('div');
    orders.setAttribute('class','result_item');
    result.appendChild(orders);
    orders.textContent = 'recipe list';

    if (!isMobile()){
        orders.textContent = 'recipe list - make sure pop ups aren\'t blocked.'
    }

    let backup = document.createElement('div');
    backup.setAttribute('class','result_contents');
    orders.appendChild(backup);

    if (isMobile()){
        orders.style.overflowX = 'auto';
        backup.style.overflowX = 'auto';
    }

    if (recipe_guide.length > 0){
        orders.style.height = 'calc(100% - 40px)';
        backup.style.overflowY = 'scroll';
        backup.style.height = 'calc(100% - 80px)';
        backup.style.backgroundColor = 'rgba(255,255,255,0.5)'

        recipe_guide.forEach(function (recipe){

            let button = document.createElement('div');
            button.innerHTML = recipe;
            button.setAttribute('class','recipe');
            backup.appendChild(button);

            // let image = document.createElement('img');
            // image.src = 'media/recipe.png';
            // button.appendChild(image);
            // image.setAttribute('class','recipe')

            button.onclick = function (){
                open_instructions(recipe);
            }
        })
    }
    else{
        backup.innerHTML = 'Once you\'ve placed your first order, the recipes you\'ll need can be found in this menu. <br><br>' +
            'Browse through our wide range of meals and create that order <span class="link" id="meals">here</span>.'
        document.getElementById('meals').onclick = function (){
            window.location.href = '/choose';
        }
    }
}

function open_orders(){
    let orders = document.createElement('div');
    orders.setAttribute('class','result_item');
    result.appendChild(orders);
    orders.textContent = 'order history';

    let table = order_table();
    orders.appendChild(table);
    Object.entries(user_orders).forEach(function ([key,value]){
        let row = basket_item_row(key,value);
        table.appendChild(row);
    })
}

function open_settings(){
}

function init_sidebar(){
    let sidebar = document.getElementById('sidebar');
    let welcome = document.createElement('div');
    welcome.setAttribute('class','welcome');
    welcome.setAttribute('id','welcome');
    sidebar.appendChild(welcome);

    let buttons = [];
    ['dashboard', 'recipes', 'orders','sign out'].forEach(function (title){
        let button = document.createElement('div');
        buttons.push(button);
        sidebar_buttons[title] = button;
        button.setAttribute('class','sidebar_button');
        button.textContent = title;
        sidebar.appendChild(button);
        if (title === 'sign out') {
            button.style.marginBottom = '80px';
        }

        button.onmouseenter = function (){
            if (title !== selected){
                if (title === 'sign out'){
                    button.style.color = '#ff5454';
                    button.style.backgroundColor = 'rgba(255,255,255,0.5)';
                }
                else{
                    button.style.backgroundColor = 'rgba(255,255,255,0.3)';
                }
            }
        }

        button.onmouseleave = function (){
            if (title !== selected){
                button.style.backgroundColor = 'unset';
                button.style.color = 'white';
            }
        }

        button.onclick = function (){
            open_sidebar_button(title,true)
            buttons.forEach(function (b){
                b.style.backgroundColor = 'unset';
                b.style.color = 'white';
            })
            if (title === 'sign out'){
                sidebar_buttons[selected].style.backgroundColor = 'rgba(255,255,255,0.8)';
                sidebar_buttons[selected].style.color = 'black';
                return;
            }
            else{
                selected = title;
            }
            button.style.backgroundColor = 'rgba(255,255,255,0.8)';
            button.style.color = 'black';
        }
    })
    buttons[0].click();
}

function open_sidebar_button(button,toggled){
    if (button !== 'sign out'){
        result.innerHTML = '';
    }
    let title = button;
    if (!title){
        title = selected;
    }
    switch (title){
        case 'sign out':
            attempt_sign_out();
            return;
        case 'dashboard':
            open_dashboard();
            break;
        case 'recipes':
            open_recipes();
            break;
        case 'settings':
            open_settings();
            break;
        case 'orders':
            open_orders();
            break;
    }
    if (isMobile() && toggled){
        toggle.click();
    }
}

function attempt_sign_out(){
    let cover = document.createElement('div');
    cover.setAttribute('class','cover');
    document.getElementById('main').appendChild(cover);

    let sign_out = document.createElement('div');
    sign_out.setAttribute('class','sign_out_background');
    document.getElementById('body').appendChild(sign_out);
    sign_out.textContent = 'are you sure you want to sign out?'

    if (isMobile()){
        sign_out.style.left = '10px';
        sign_out.style.width = 'calc(100% - 80px)';
    }

    let confirm = document.createElement('div');
    confirm.setAttribute('class','sign_out_button');
    sign_out.appendChild(confirm);
    confirm.textContent = 'sign out';

    let cancel = document.createElement('div');
    cancel.setAttribute('class','sign_out_cancel');
    sign_out.appendChild(cancel);
    cancel.style.right = confirm.offsetWidth+10+'px';
    cancel.textContent = 'cancel';

    cancel.onclick = function (){
        document.getElementById('main').removeChild(cover);
        document.getElementById('body').removeChild(sign_out);
    }

    confirm.onclick = function (){
        signOut();
    }
}