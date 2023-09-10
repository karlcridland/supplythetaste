let display;
let save;
class UserOrder{
    constructor(user,id,name,date,card,basket,address,message,prepared,dispatched) {
        this.user = user;
        this.id = id;
        this.name = name;
        this.date = date;
        this.card = card;
        this.basket = basket;
        this.address = address;
        this.message = message;
        this.prepared = prepared;
        this.dispatched = dispatched;
    }

    item_list(){
        let str = ''
        this.basket.forEach(function (item){
            str += [item.quantity + ' x ' + item.name].join(', ');
            if (item.variation !== null){
                str += ' ('+item.variation+')';
            }
            str += '<br><br>';
        })
        str = str.substring(0, str.length - 8);
        return str;
    }
}
class TrueFalseButton{
    constructor() {
        this.active = true;
        let display = document.createElement('div');
        display.setAttribute('class','tfb');
        this.display = display;
        this.toggle();
    }

    toggle(){
        let a = this;
        a.active = !a.active;
        if (a.active){
            a.display.style.backgroundColor = '#1cbc3e';
            a.display.innerHTML = 'completed';
        }
        else{
            a.display.style.backgroundColor = '#e03019';
            a.display.innerHTML = 'incomplete';
        }
    }
}

function initAccount(){
//
    let admin = false;
    let button_names = ['dashboard', 'orders', 'sign out'];

    let body = document.getElementById('body');
    let desc = document.createElement('div');
    desc.setAttribute('class','menu_button_description');
    let menu = document.getElementById('menu');

    display = document.createElement('div');
    display.setAttribute('class','account_display');
    document.getElementById('main').appendChild(display);

    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            return;
        }
        else{
            if (isAdmin()){
                admin = true;
                menu.style.backgroundImage = 'linear-gradient(330deg, #0767b1, #20a4fd)';
                button_names = ['dashboard', 'menu', 'specials', 'task list', 'history', 'sign out'];
                setUpPage();
            }
            else{
                menu.style.backgroundImage = 'linear-gradient(330deg, #6e13cf, #a259ef)';
                init_user();
            }
        }
    });

    save = document.createElement('div');
    save.setAttribute('class','save');
    save.textContent = 'save';
    body.appendChild(save);

    function setUpPage(){

        button_names.forEach(function (name){
            let button = document.createElement('img');
            button.setAttribute('class','menu_button');
            button.src = 'media/'+name+'.png';
            menu.appendChild(button);

            button.onclick = function (){
                menu_button_clicked(name,admin)
            }
            if (!isMobile()){
                button.onmouseenter = function (){
                    body.appendChild(desc);
                    desc.textContent = name;
                    desc.style.top = button.offsetTop+140+'px';
                    button.style.backgroundColor = 'rgba(255,255,255,0.2)';

                    switch (name){
                        case 'sign out':
                            desc.style.backgroundColor = '#dd1616';
                            break;
                        default:
                            if (admin){
                                desc.style.backgroundColor = '#20a4fd';
                            }
                            else{
                                desc.style.backgroundColor = '#a259ef';
                            }
                            break;
                    }
                }

                button.onmouseleave = function (){
                    body.removeChild(desc);
                    button.style.backgroundColor = 'unset';
                }
            }

        })

        menu_button_clicked('dashboard',admin);
    }

    if (isMobile()){
        menu.style.left = '0';
        menu.style.top = '0';
        menu.style.width = '100%';
        menu.style.margin = '0';
        menu.style.borderRadius = '0';
        menu.style.height = '80px';
        display.style.left = '0';
        display.style.top = '80px';
        display.style.width = '100%';
        display.style.margin = '0';
        display.style.borderRadius = '0';
        display.style.height = 'calc(100% - 80px)';
    }
}

function menu_button_clicked(button,admin){
    display.innerHTML = '';
    save.style.display = 'none';
    save.onclick = null;
    switch (button){
        case 'sign out':
            signOut();
            break;
        case 'menu':
            open_menus();
            break;
        case 'dashboard':
            if (admin){
                open_dashboard_admin();
            }
            else{
                open_dashboard();
            }
            break;
        case 'specials':
            open_specials();
            break;
        case 'task list':
            open_task_list(false);
            break;
        case 'history':
            open_task_list(true);
            break;
        case 'orders':
            open_orders();
            break;
        case 'settings':
            open_settings();
            break;
    }
}

let displayMenus;

// admin

function open_menus(){

    const category_color = {
        'starter':'#ff0000',
        'main': '#0595e3',
        'dessert': '#373737',
        'side': '#27b700',
        'misc': '#c8c500'
    };

    function save_menus(){
        ref.child('meals').set(null);
        categories.forEach(function (category){
            let meals = [];
            menus.forEach(function (m){
                if (m.category === category && !m.isEmpty()){
                    meals.push(m)
                }
            })
            let i = 0;
            meals.forEach(function (m){
                if (!m.isEmpty()){
                    ref.child('meals/'+category+'/'+(i)+'/name').set(m.name);
                    ref.child('meals/'+category+'/'+(i)+'/desc').set(m.description);
                    ref.child('meals/'+category+'/'+(i)+'/allergens').set(m.allergens);
                    try{
                        ref.child('meals/'+category+'/'+(i)+'/price').set(m.price);
                        ref.child('meals/'+category+'/'+(i)+'/head_count').set(m.head_count);
                        ref.child('meals/'+category+'/'+(i)+'/instructions').set(m.instructions);
                    }
                    catch (e) {

                    }
                    i++;
                }
            })
        })
    }

    displayMenus = function(){
        let table = document.createElement('table');
        table.setAttribute('class','meal_table');
        save.style.display = 'inline';
        let r = document.createElement('tr');
        table.appendChild(r);
        ['name','description','category','allergens (optional)'].forEach(function (title){
            let th = document.createElement('th');
            th.textContent = title;
            th.setAttribute('class','meal_table');
            r.appendChild(th);
        })
        display.appendChild(table);

        save.onclick = function (){
            save_menus();
        }

        try{
            menus.forEach(function (m){
                table.appendChild(meal_row(m.name,m.description,m.allergens,m.category,m));
            })
        }
        catch (e) {

        }
        finally {
            table.appendChild(meal_row(null,null,null,null,null));
            empty_input.onkeypress = function (){
                if (empty_input.value.length > 0){
                    refresh_table(table)
                }
            }
        }
    }

    let empty_input;

    function refresh_table(table){
        table.appendChild(meal_row(null,null,null,null,null));
        empty_input.onkeypress = function (){
            if (empty_input.value.length > 0){
                refresh_table(table)
            }
        }
    }

    function meal_row(name,description,allergens,category,reference){

        let entry = reference;
        if (reference === null){
            entry = new Meal('','','','');
            menus.push(entry);
        }

        let row = document.createElement('tr');

        let a = document.createElement('td');
        let b = document.createElement('td');
        let c = document.createElement('td');
        let d = document.createElement('td');

        [a,b,c,d].forEach(function (e){
            row.appendChild(e);
            e.setAttribute('class','meal_table');
        })

        let n = document.createElement('input');
        empty_input = n;
        n.setAttribute('class','meal_table');
        n.value = name;
        a.appendChild(n);

        n.onkeyup = function (){
            entry.name = n.value;
        }

        let desc = document.createElement('textarea');
        desc.setAttribute('class','meal_table');
        desc.value = description;
        b.appendChild(desc);

        desc.onkeyup = function (){
            entry.description = desc.value;
        }

        let cat = document.createElement('div');
        cat.setAttribute('class','meal_table');
        c.appendChild(cat);

        let bubbles = [];
        categories.forEach(function (c){
            let bubble = document.createElement('div');
            bubbles.push(bubble);
            bubble.setAttribute('class','meal_table_bubble');
            bubble.style.backgroundColor = category_color[c];
            cat.appendChild(bubble);

            bubble.textContent = c.slice(0,2);
            if (category === c){
                bubble.style.opacity = '1';
            }
            else{
                bubble.style.opacity = '0.3';
            }

        })

        bubbles.forEach(function (bubble){
            bubble.onclick = function (){
                bubbles.forEach(function (b){
                    b.style.opacity = '0.3';
                })
                bubble.style.opacity = '1';
                switch (bubble.textContent){
                    case 'de':
                        entry.category = 'dessert';
                        break;
                    case 'ma':
                        entry.category = 'main';
                        break;
                    case 'st':
                        entry.category = 'starter';
                        break;
                    case 'si':
                        entry.category = 'side';
                        break;
                    case 'mi':
                        entry.category = 'misc';
                        break;
                }
            }
        })

        let allergy = document.createElement('input');
        allergy.setAttribute('class','meal_table');
        allergy.value = allergens;
        d.appendChild(allergy);

        allergy.onkeyup = function (){
            entry.allergens = allergy.value;
        }

        return row;
    }

    downloadMenus(function (){
        displayMenus();
    });
}
function open_dashboard_admin(){
    let both = document.createElement('section');
    both.style.width = '100%';
    both.style.overflowY = 'scroll';
    display.appendChild(both);

    let left = document.createElement('section');
    left.setAttribute('class','inside');
    both.appendChild(left);
    let right = document.createElement('section');
    right.setAttribute('class','inside');
    both.appendChild(right);

    function create_outstanding(){
        let table = document.createElement('table');
        table.setAttribute('class','breakdown');

        let big_size = '50px';

        let top = document.createElement('tr');
        table.appendChild(top);

        let tl = document.createElement('td');
        tl.style.width = '40%';
        tl.style.fontSize = big_size;
        tl.style.textAlign = 'center'
        top.appendChild(tl);
        ref.child('orders/status').once('value',snapshot=>{
            let t = 0;
            snapshot.forEach(function (user){
                user.forEach(function (order){
                    if (!order.child('dispatched').val()){
                        t++;
                    }
                })
            })
            tl.textContent = t.toString();
        })

        let tr = document.createElement('td');
        top.appendChild(tr);
        tr.textContent = 'outstanding orders';

        let bottom = document.createElement('tr');
        table.appendChild(bottom);

        let bl = document.createElement('td');
        bl.style.width = '40%';
        bl.style.fontSize = big_size;
        bl.style.textAlign = 'center'
        bottom.appendChild(bl);
        bl.textContent = '0';

        let br = document.createElement('td');
        bottom.appendChild(br);
        br.textContent = 'issues raised';

        return table;
    }

    function create_monthly_breakdown(){
        let table = document.createElement('table');
        table.setAttribute('class','monthly');

        let top = document.createElement('tr');
        table.appendChild(top);

        let bottom = document.createElement('tr');
        table.appendChild(bottom);

        months.forEach(function (month){
            let line = document.createElement('td');
            top.appendChild(line);
            line.style.height = '80%';

            let m = document.createElement('td');
            bottom.appendChild(m);
            m.textContent = month[0].toUpperCase();
        })

        return table;
    }

    function create_user_breakdown(){
        let table = document.createElement('table');
        table.setAttribute('class','users');

        let big_size = '50px';

        let top = document.createElement('tr');
        table.appendChild(top);

        let tl = document.createElement('td');
        tl.style.width = '40%';
        tl.style.fontSize = big_size;
        tl.style.textAlign = 'center'
        top.appendChild(tl);
        tl.textContent = '0';

        let tr = document.createElement('td');
        top.appendChild(tr);
        tr.textContent = 'total users';

        let middle = document.createElement('tr');
        table.appendChild(middle);

        let ml = document.createElement('td');
        ml.style.width = '40%';
        ml.style.fontSize = big_size;
        ml.style.textAlign = 'center'
        middle.appendChild(ml);
        ml.textContent = '0';

        let mr = document.createElement('td');
        middle.appendChild(mr);
        mr.textContent = 'active users';

        let bottom = document.createElement('tr');
        table.appendChild(bottom);

        let bl = document.createElement('td');
        bl.style.width = '40%';
        bl.style.fontSize = big_size;
        bl.style.textAlign = 'center'
        bottom.appendChild(bl);
        bl.textContent = '0';

        let br = document.createElement('td');
        bottom.appendChild(br);
        br.textContent = 'new monthly users';

        let numDaysBetween = function(d1, d2) {
            let diff = Math.abs(d1.getTime() - d2.getTime());
            return diff / (1000 * 60 * 60 * 24);
        };

        ref.child('users/last signed in').once('value', snapshot =>{
            tl.innerHTML = (snapshot.numChildren()-1).toString();
            let tally = 0;
            snapshot.forEach(function (date){
                let split = date.val().split(':')
                let y = parseInt(split[0]);
                let m = parseInt(split[1]);
                let d = parseInt(split[2]);
                let h = parseInt(split[3]);
                let mi = parseInt(split[4]);
                let s = parseInt(split[5]);
                let date_ = new Date(y,m,d,h,mi,s);
                if (numDaysBetween(date_,new Date()) <= 30){
                    tally++;
                }
            })

            ml.innerHTML = (tally-1).toString();
        })

        ref.child('users/account created').once('value', snapshot =>{
            let tally = 0;
            snapshot.forEach(function (date){
                let split = date.val().split(':')
                let y = parseInt(split[0]);
                let m = parseInt(split[1]);
                let d = parseInt(split[2]);
                let h = parseInt(split[3]);
                let mi = parseInt(split[4]);
                let s = parseInt(split[5]);
                let date_ = new Date(y,m,d,h,mi,s);
                if (numDaysBetween(date_,new Date()) <= 30){
                    tally++;
                }
            })

            bl.innerHTML = tally.toString();
        })

        return table;
    }

    left.appendChild(create_outstanding());
    left.appendChild(create_monthly_breakdown());
    right.appendChild(create_user_breakdown());

}
function open_task_list(history){
    let orders = {}
    ref.child('orders/status').once('value',snapshot=>{
        snapshot.forEach(function (user){
            user.forEach(function (order){
                let check = !order.child('dispatched').val();
                if (history){
                    check = order.child('dispatched').val() && order.child('prepared').val();
                }
                if (check){
                    if (Object.keys(orders).includes(user.key)){
                        orders[user.key].push(order.key);
                    }
                    else{
                        orders[user.key] = [order.key];
                    }
                }
            })
        })
        download_order_details();
    })

    let tasks = {};

    function display_orders(){

        function add_row(order){
            let row = document.createElement('tr');
            row.setAttribute('class','task_list');
            let contents = ['info','contents','note','prepared','dispatched'];
            if (order !== null){
                contents = [[order.name,order.address].join(', '),order.item_list(),order.message,'prepared','dispatched'];
            }

            let w = [24,24,24,14,14];
            let i = 0;
            let prep;
            let disp;
            contents.forEach(function (data){
                let cell = document.createElement('td');
                cell.setAttribute('class','task_list');
                row.appendChild(cell)
                cell.style.width = w[i]+'%';
                i++;

                if (order === null){
                    cell.style.textAlign = 'center';
                    cell.style.paddingRight = '50px';
                    cell.style.color = '#888888'
                }

                if (order !== null && (data === 'prepared' || data === 'dispatched')){
                    let button = new TrueFalseButton();
                    cell.appendChild(button.display);
                    if (data === 'prepared'){
                        if (order.prepared){
                            button.toggle();
                        }
                        prep = button;
                    }
                    if (data === 'dispatched'){
                        if (order.dispatched){
                            button.toggle();
                        }
                        disp = button;
                    }
                    let d = button.display;
                    d.onmouseenter = function (){
                        if (button.active){
                            d.style.backgroundColor = '#20d446';

                        }
                        else{
                            d.style.backgroundColor = '#ff361c';
                        }
                    }
                    d.onmouseleave = function (){
                        if (button.active){
                            d.style.backgroundColor = '#1cbc3e';

                        }
                        else{
                            d.style.backgroundColor = '#e03019';
                        }

                    }
                    d.onclick = function (){
                        button.toggle();
                        ref.child('orders/status/'+order.user+'/'+order.id+'/'+data).set(button.active);
                        let d = new Date().ymd()
                        console.log(d)
                        if (button.active){
                            ref.child('orders/timestamp/'+order.user+'/'+order.id+'/'+data).set(d);
                        }
                        else{
                            ref.child('orders/timestamp/'+order.user+'/'+order.id+'/'+data).set(null);
                        }
                        if (data === 'dispatched' && button.active){
                            if (!prep.active){
                                prep.display.click();
                            }
                        }
                        if (data === 'prepared' && !button.active){
                            if (disp.active){
                                disp.display.click();
                            }
                        }
                    }
                }
                else{
                    cell.innerHTML = data;
                }
            })
            return row;
        }

        // info, order, prepared, dispatched

        display.innerHTML = '';
        let table = document.createElement('table');
        table.setAttribute('class','task_list');
        table.appendChild(add_row(null));
        display.appendChild(table);
        let dates = Object.keys(tasks).sort();
        dates.forEach(function (date){
            let date_row = document.createElement('tr');
            date_row.setAttribute('class','task_list');
            table.appendChild(date_row);
            let date_cell = document.createElement('th');
            date_cell.setAttribute('class','task_list');
            date_row.appendChild(date_cell);
            let day = parseInt(date.split(':')[2]).ordinate();
            let month = months[parseInt(date.split(':')[1])];
            let year = date.split(':')[0];
            date_cell.innerHTML = [day,month,year].join(' ');
            date_cell.colSpan = 5;

            tasks[date].forEach(function (order){
                let row = add_row(order);
                table.appendChild(row);
            })
        })
    }

    function download_order_details(){
        Object.keys(orders).forEach(function (user){
            orders[user].forEach(function (id){
                ref.child('orders/status/'+user+'/'+id+'/prepared').once('value',prepared=>{
                    ref.child('orders/user/'+user+'/'+id).once('value',order=>{
                        let name = order.child('name').val();
                        let date = order.child('date').val();
                        let card = order.child('card').val();
                        let message = order.child('note').val();
                        if (message === null){
                            message = '';
                        }
                        let address = getAddress(order);
                        let items = [];
                        order.child('basket').forEach(function (item){
                            let new_item = new BasketItem(item.child('name').val(),item.child('quantity').val(),item.child('variation').val(),item.child('price').val())
                            items.push(new_item);
                        })
                        let sp = date.split(':');
                        let new_id = [sp[0],sp[1],sp[2]].join(':');
                        let new_order = new UserOrder(user,id,name,date,card,items,address,message,prepared.val(),history);
                        if (Object.keys(tasks).includes(new_id)){
                            tasks[new_id].push(new_order);
                        }
                        else{
                            tasks[new_id] = [new_order];
                        }
                        display_orders();
                    })
                })
            })
        })
    }
}
function getAddress(order){
    let lines = [];
    ['line1','line2','town','county','postcode','country'].forEach(function (line){
        let l = order.child('address').child(line).val();
        if (l !== null){
            lines.push(l);
        }
    })
    return lines.join(', ');
}

// user

function open_dashboard(){
    let back = document.createElement('div');
    back.setAttribute('class','user_banner_back');
    display.appendChild(back);
    back.style.display = 'none';
    let banner = document.createElement('div');
    banner.setAttribute('class','user_banner');
    display.appendChild(banner);
    banner.style.display = 'none';
    ref.child('users/first name/'+uid).once('value',snapshot=>{
        console.log(snapshot.val(),uid)
        banner.innerHTML = 'Welcome back, '+snapshot.val();
        banner.style.display = 'inherit';
        back.style.display = 'inherit';
    });

    if (isMobile()){
        [back,banner].forEach(function (a){
            a.style.left = '0';
            a.style.top = '0';
            a.style.margin = '10px';
            a.style.width = 'calc(100% - 70px)';
            a.style.borderRadius = '7px';
        })
    }

    // let backup = 'no active orders ..go check out the <span class="offer" id="offer">box of the month</span> 😉';
    // display_user_orders(back,false,backup);
}
function open_orders(){
    let back = document.createElement('div');
    back.setAttribute('class','user_banner_back');
    display.appendChild(back);
    let banner = document.createElement('div');
    banner.setAttribute('class','user_banner');
    banner.innerHTML = 'Order History';
    display.appendChild(banner);

    if (isMobile()){
        [back,banner].forEach(function (a){
            a.style.left = '0';
            a.style.top = '0';
            a.style.margin = '10px';
            a.style.width = 'calc(100% - 70px)';
            a.style.borderRadius = '7px';
        })
    }

    display_user_orders(back,true,'check back later after your first order\'s been dispatched')
}
function display_user_orders(back,history,backup){
    let orders = [];

    ref.child('orders/status/'+uid).once('value',snapshot=>{
        snapshot.forEach(function (id){
            let check = !id.child('dispatched').val();
            if (history){
                check = id.child('dispatched').val();
            }
            if (check){
                ref.child('orders/user/'+uid+'/'+id.key).once('value',order=>{
                    let name = order.child('name').val();
                    let date = order.child('date').val();
                    let card = order.child('card').val();
                    let message = order.child('note').val();
                    if (message === null){
                        message = '';
                    }
                    let address = getAddress(order);
                    let items = [];
                    order.child('basket').forEach(function (item){
                        let new_item = new BasketItem(item.child('name').val(),item.child('quantity').val(),item.child('variation').val(),item.child('price').val())
                        items.push(new_item);
                    })
                    console.log(id.val())
                    console.log(id.child('prepared').val())
                    let new_order = new UserOrder(uid,id.key,name,date,card,items,address,message,id.child('prepared').val(),false);
                    orders.push(new_order);
                    display_orders();
                })
            }
        })
        display_orders();
    })
    function display_orders(){
        back.innerHTML = '';
        if (orders.length === 0){
            back.innerHTML = backup;
            document.getElementById('offer').onclick = function (){
                open_menu_box_choice();
            }
        }
        else{
            let table = document.createElement('table');
            back.appendChild(table);
            table.style.width = '100%';

            function make_row(cells,type){
                let row = document.createElement('tr');
                table.appendChild(row);

                let i = 0;
                cells.forEach(function (data){
                    let cell = document.createElement(type)
                    cell.innerHTML = data;
                    row.appendChild(cell);
                    if (i > 0 && type === 'td'){
                        row.style.height = '100px'
                        cell.style.textAlign = 'center';
                    }
                    i++;
                })

                return row;
            }

            table.appendChild(make_row(['description','order placed','delivery date','prepared','dispatched'],'th'));
            let x = {true:'yes',false:'no'};
            orders.forEach(function (order){
                console.log(order.id)
                table.appendChild(make_row([order.item_list(),order.id.toDate(),order.date.toDate(),x[order.prepared],x[order.dispatched]],'td'))
            })
        }
    }
}
function open_settings(){
    let back = document.createElement('div');
    back.setAttribute('class','user_banner_back');
    display.appendChild(back);
    let banner = document.createElement('div');
    banner.setAttribute('class','user_banner');
    banner.innerHTML = 'Settings';
    display.appendChild(banner);
}

// specials for admin

class Special{
    constructor(name,extra,s1,s2,m1,m2,d1,d2) {
        this.name = name;
        this.extra = extra;
        this.s1 = s1;
        this.s2 = s2;
        this.m1 = m1;
        this.m2 = m2;
        this.d1 = d1;
        this.d2 = d2;
    }
}
let specials = {};
let current_month;
function open_specials(){
    save.style.display = 'inline';
    let table = document.createElement('table');
    table.setAttribute('class','months');
    display.appendChild(table);

    let m = new Date().getMonth()+1;
    if (m === 12){
        m = 0
    }
    let all = [];
    let when_ready;
    months.forEach(function (month){
        let row = document.createElement('tr');
        table.appendChild(row);

        let button = document.createElement('td');
        all.push(button);
        row.appendChild(button);
        button.textContent = month;
        button.style.cursor = 'pointer';

        button.onmouseenter = function (){
            button.style.color = '#039be5';
        }

        button.onmouseleave = function (){
            button.style.color = 'black';
            if (current_month === month){
                button.style.color = '#039be5';
            }
        }

        button.onclick = function (){
            current_month = month;
            all.forEach(function (b){
                b.style.color = 'black';
            })
            button.style.color = '#039be5';
            display_specials(month);
        }

        if (months[m] === month){
            when_ready = function (){
                button.click();
            }
        }

    })

    function download_specials(){
        ref.child('specials').once('value',snapshot=>{
            months.forEach(function (month){
                let name = snapshot.child('name').child(month).val();
                let extra = snapshot.child('extra').child(month).val();
                let starter_1 = snapshot.child('starter').child(month).child('1').val();
                let starter_2 = snapshot.child('starter').child(month).child('2').val();
                let main_1 = snapshot.child('mains').child(month).child('1').val();
                let main_2 = snapshot.child('mains').child(month).child('2').val();
                let dessert_1 = snapshot.child('dessert').child(month).child('1').val();
                let dessert_2 = snapshot.child('dessert').child(month).child('2').val();
                let special = new Special(name,extra,starter_1,starter_2,main_1,main_2,dessert_1,dessert_2);
                specials[month] = special;
            })
            when_ready();
        })
    }
    download_specials();

    function display_specials(month){
        try{
            display.removeChild(document.getElementById('edit_special'))
        }
        catch (e) {

        }
        finally{
            try{
                display.removeChild(document.getElementById('polaroid'));
            }
            catch (e) {

            }
            let table = document.createElement('table');
            table.setAttribute('class','edit_special');
            table.setAttribute('id','edit_special');
            display.appendChild(table);

            let polaroid = document.createElement('div');
            polaroid.setAttribute('class','polaroid');
            polaroid.setAttribute('id','polaroid');
            display.appendChild(polaroid);

            let caption = document.createElement('div');
            caption.setAttribute('class','polaroid_caption');
            caption.textContent = 'upload an image...';
            polaroid.appendChild(caption);

            let picture = document.createElement('img');
            picture.setAttribute('class','picture');
            picture.setAttribute('id','picture');
            polaroid.appendChild(picture);
            picture.style.height = picture.offsetWidth+'px';
            polaroid.style.height = picture.offsetWidth+120+'px';
            picture.getImage('specials/'+month,null);

            if (specials[current_month].picture){
                document.getElementById('picture').src = URL.createObjectURL(specials[current_month].picture);
            }

            document.getElementById('body').onresize = function (){
                picture.style.height = picture.offsetWidth+'px';
                polaroid.style.height = picture.offsetWidth+120+'px';
            }

            let input = document.createElement('input');
            input.type = 'file';
            input.addEventListener("change", handleFiles, false);

            ['name','starter (option 1)','starter (option 2)','main (option 1)','main (option 2)','dessert (option 1)','dessert (option 2)','extra'].forEach(function (title){
                let row = document.createElement('tr');
                table.appendChild(row);

                let t = document.createElement('td');
                t.textContent = title;
                t.style.width = '20%'
                t.style.color = '#6e6e6e';
                row.appendChild(t);

                let value = document.createElement('td');
                row.appendChild(value);
                let input = document.createElement('input');
                input.setAttribute('class','edit_special');
                value.appendChild(input);

                input.onkeyup = function (){
                    switch (title){
                        case 'name':
                            specials[month].name = input.value;
                            break;
                        case 'starter (option 1)':
                            specials[month].s1 = input.value;
                            break;
                        case 'starter (option 2)':
                            specials[month].s2 = input.value;
                            break;
                        case 'main (option 1)':
                            specials[month].m1 = input.value;
                            break;
                        case 'main (option 2)':
                            specials[month].m2 = input.value;
                            break;
                        case 'dessert (option 1)':
                            specials[month].d1 = input.value;
                            break;
                        case 'dessert (option 2)':
                            specials[month].d2 = input.value;
                            break;
                        case 'extra':
                            specials[month].extra = input.value;
                            break;

                    }
                }

                try{
                    switch (title){
                        case 'name':
                            input.value = specials[month].name;
                            break;
                        case 'starter (option 1)':
                            input.value = specials[month].s1;
                            break;
                        case 'starter (option 2)':
                            input.value = specials[month].s2;
                            break;
                        case 'main (option 1)':
                            input.value = specials[month].m1;
                            break;
                        case 'main (option 2)':
                            input.value = specials[month].m2;
                            break;
                        case 'dessert (option 1)':
                            input.value = specials[month].d1;
                            break;
                        case 'dessert (option 2)':
                            input.value = specials[month].d2;
                            break;
                        case 'extra':
                            input.value = specials[month].extra;
                            break;

                    }
                }
                catch (e) {
                    input.value = null;
                }
            })

            polaroid.onclick = function (){
                input.click();
            }
        }
    }

    let file;

    function handleFiles() {
        file = this.files[0];

        if (file.size > 1024 * 1024 * 1024){
            window.alert('Files must be smaller than 1 gigabyte.')
            document.getElementById('input').value = '';
            return;
        }

        document.getElementById('picture').src = URL.createObjectURL(file);
        specials[current_month].picture = file;

    }

    class Progress{
        constructor() {
            this.percentage = 0;
        }
    }

    save.onclick = function (){
        let b = [];
        months.forEach(function (month){
            let m = specials[month]
            ref.child('specials/name/'+month).set(m.name);
            ref.child('specials/extra/'+month).set(m.extra);
            ref.child('specials/starter/'+month+'/1').set(m.s1);
            ref.child('specials/starter/'+month+'/2').set(m.s2);
            ref.child('specials/mains/'+month+'/1').set(m.m1);
            ref.child('specials/mains/'+month+'/2').set(m.m2);
            ref.child('specials/dessert/'+month+'/1').set(m.d1);
            ref.child('specials/dessert/'+month+'/2').set(m.d2);
            if(m.picture){
                let next = storage.ref().child('specials/'+month).put(m.picture);
                let n = new Progress();
                b.push(n);
                next.on('state_changed', function (snap) {
                    let p = parseInt((snap.bytesTransferred * 1000 / snap.totalBytes).toString()) / 10;
                    n.percentage = p;
                    let total = 0;
                    b.forEach(function (a){
                        total += a.percentage;
                    })
                    console.log((total/b.length)+'%');
                })
            }
        })
    }
}