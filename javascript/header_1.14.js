
class Basket{
    constructor() {
        this.items = [];
        this.postage = 500;
    }

    append(item){
        this.items.push(item)
    }

    contains(name){
        let result = null
        this.items.forEach(function (item){
            if (item.name.toLowerCase() === name.toLowerCase()){
                result = item;
            }
        })
        return result;
    }

    remove(name){
        let a = this;
        a.items.forEach(function (item){
            if (item.name.toLowerCase() === name.toLowerCase()){
                a.items.splice(a.items.indexOf(item), 1);
            }
        })
    }

    total(){
        let t = 0;
        this.items.forEach(function (item){
            t += item.quantity * item.price;
        })
        if (this.voucher_applied){
            if (this.percent){
                t = t*(100-this.voucher)/100;
            }
        }
        return t;
    }

    paypal(){
        if (uid === 'szQHoW15FIfV3qf6VPFwXfCu3163'){
            return '0.01';
        }
        let total = this.total()+this.postage;
        let pounds = parseInt((total/100).toString());
        let pence = total%100;
        return [pounds,pence].join('.');
    }

    apply_coupon(code,amount,percent){
        this.voucher_applied = true;
        this.percent = percent;
        this.voucher_code = code;
        this.voucher = amount;
        try{
            refresh_basket();
        }
        catch (e) {
            
        }
    }

    remove_voucher(){
        this.voucher_applied = false;
        this.percent = undefined;
        this.voucher_code = undefined;
        this.voucher = undefined;
        refresh_basket();
    }
}

class BasketItem{
    constructor(name,quantity,variation,price) {
        this.name = name;
        this.quantity = quantity;
        this.variation = variation;
        this.price = price;
    }
}

let button_links = {'user':'/register.html','how it works':'/directions.html','food':'/choose.html','checkout':'/checkout.html'};
let button_description = {'user':'account','how it works':'how it works','food':'meal selection','search':'search','basket':'basket','checkout':'checkout'};
let months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
let basket = new Basket();
let error_message = document.createElement('div');
let error_present = null;
let error_border;
let uid;


HTMLInputElement.prototype.error_message = function (logic,message){
    let a = this;
    error_border = a.style.border;
    if (!logic){
        if (error_present !== null){
            a.style.borderColor = 'rgba(255, 86, 70, 0.95)';
            a.onkeydown = function () {
                a.style.border = error_border;
            }
            return logic;
        }
        error_present = a;
        document.getElementById('body').appendChild(error_message);

        error_message.setAttribute('class','error_message');
        error_message.innerHTML = message;
        error_present.focus();
        error_present.style.borderColor = 'rgba(255, 86, 70, 0.95)';

        function readjust(){
            let viewportOffset = a.getBoundingClientRect();
            let top = viewportOffset.top;
            let left = viewportOffset.left;
            error_message.style.left = left+'px';
            error_message.style.width = a.offsetWidth-40+'px';
            error_message.style.top = top-(error_message.offsetHeight)-5+'px';
        }

        readjust();

        document.getElementById('body').onresize = function (){
            readjust();
        }

        document.getElementById('main').onscroll = function (){
            readjust();
        }

        error_present.onkeydown = function (){
            try{
                document.getElementById('body').removeChild(error_message);
                error_present.style.border = error_border;
            }
            catch (e) {

            }
            error_present = null;
        }
    }
    return logic;
}
HTMLInputElement.prototype.notEmpty = function (){
    return this.error_message(this.value.length > 0,'field cannot be left empty');
}


Number.prototype.ordinate = function (){
    return this+''
}
Date.prototype.str = function (){
    let d = this;
    let year = d.getFullYear().toString();
    let month = months[d.getMonth()];
    let day = d.getDate();
    return day.ordinate() + ' ' + month + ' ' + year;
}
Date.prototype.ymd = function (){
    let d = this;
    let month = '' + (d.getMonth());
    let day = '' + (d.getDate());
    let year = '' + (d.getFullYear());
    let hour = '' + (d.getHours());
    let minute = '' + (d.getMinutes());
    let second = '' + (d.getSeconds());

    let b = [year];
    [month,day,hour,minute,second].forEach(function (a){
        if (a.length < 2){
            b.push('0' + a);
        }
        else{
            b.push(a);
        }
    })

    return b.join(':');
}

function initHeader(){
    let header = document.getElementById('header');
    let body = document.getElementById('body');
    let logo = document.getElementById('logo');
    let main = document.getElementById('main');

    try{
        basket.items = JSON.parse(sessionStorage.getItem("basket")).items;
    }
    catch (e) {
    }

    if (isMobile()){

        logo.style.fontSize = '20px';
        header.style.paddingLeft = '15px';
        header.style.width = 'calc(100% - 15px)';
        header.style.paddingTop = '15px';
        header.style.height = '45px';
        main.style.top = '60px';
        main.style.height = 'calc(100% - 60px)';

        header.style.overflow = 'hidden';
        let menu_button = document.createElement('img');
        menu_button.setAttribute('class','header_button_mobile');
        menu_button.src = 'media/menu_button.png';
        header.appendChild(menu_button);
        menu_button.style.right = '0';

        let is_extended = false;

        main.onmouseover = function (){
            is_extended = true;
            menu_button.click();
        }

        menu_button.onclick = function (){
            is_extended = !is_extended;
            let h = 60;
            if (is_extended){
                h = 120;
            }
            header.animate([
                {height: h-15}
            ],{
                duration: 200,
                iterations: 1
            })
            window.setTimeout(function (){
                header.style.height = h-15+'px';
            },150);

        }
    }
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            button_description['user'] = 'sign in / register';
        }
        else{
            button_description['user'] = 'account';
            isSignedIn = true;
            uid = user.uid;
        }
    });

    body.style.opacity = '1';

    let desc = document.createElement('div');
    desc.setAttribute('class','header_button_description')

    let i = 0;
    let buttons = [];
    //
    ['user', 'checkout', 'food'].forEach(function (a){
        if (a === 'checkout' && basket.items.length === 0){
            return;
        }
        let button = document.createElement('img');
        buttons.push(button);
        button.src = 'media/'+a+'.png';

        if (isMobile()){
            button.setAttribute('class','header_button_mobile');
            button.style.right = (i*50+10)+'px';
            button.style.top = '60px';
            button.style.margin = '0';
        }
        else{
            button.setAttribute('class','header_button');
            button.style.right = (i*80+20)+'px';

            button.onmouseenter = function (){
                body.appendChild(desc);
                desc.textContent = button_description[a];
                desc.style.right = button.style.right;
                button.style.backgroundColor = '#ececec';
            }

            button.onmouseleave = function (){
                body.removeChild(desc);
                button.style.filter = 'invert(0)';
                button.style.backgroundColor = 'unset';
            }
        }

        header.appendChildLink(button, button_links[a]);

        reset_header = function (){
            buttons.forEach(function (button){
                try{
                    body.removeChild(desc);
                }
                catch (e){

                }
                finally {
                    button.style.filter = 'invert(0)';
                    button.style.backgroundColor = 'unset';
                }
            })
        }
        body.onmouseover = function (){
            reset_header();
        }
        body.onmousedown = function (){
            reset_header();
        }

        i++;
    })



}

let reset_header;

let isSignedIn = false;

function isAdmin(){
    return firebase.auth().currentUser.uid === 'sOJL3aQvxTXzSQBQLB2c5cw1p923'
}

let sections = [];
function reconfigure_sections(){
    if (isMobile()){
        sections.forEach(function (section){
            section.style.width = '100%';
            section.style.height = '50%';
        })
    }
}

HTMLElement.prototype.appendChildLink = function (child,link){
    let a = document.createElement('a');
    this.appendChild(a);
    a.href = link;

    if (link === '/register.html'){
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                a.href = '/account.html'
            }
        });
    }

    a.appendChild(child);
}

function isMobile(){
    // return true;
    function iOS() {
        return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform);
    }

    function android(){
        return navigator.userAgent.toLowerCase().indexOf('android') > -1;
    }

    if (iOS() || android()){
        return true;
    }
    return false;

}

const categories = ['starter','main','dessert','side','misc'];
let menus = [];
class Meal{
    constructor(name,description,allergens,category) {
        this.name = name;
        this.description = description;
        this.allergens = allergens;
        this.category = category;
        this.empty = true;
        this.head_count = null;
    }

    isEmpty(){
        return this.name.length === 0 || this.description.length === 0 || this.category.length === 0;
    }

    metadata(){

    }

    result(search){
        let includes = false
        let a = this;
        let b = "";
        try{
            b = this.tags.join()
        }
        catch(e){}
        [a.name,a.description,a.category,b].forEach(function (field){
            field.split(' ').forEach(function (word){
                if (word.toLowerCase().normalize().includes(search.toLowerCase().normalize())){
                    includes = true
                }
            })
        })
        return includes
    }

}
function has_instructions(title){
    let result = false
    menus.forEach(function (menu){
        if (menu.name.toLowerCase() === title.toLowerCase()){
            console.log(title,menu.name.toLowerCase(),menu.instructions)
            result = menu.instructions
        }
    })
    return result
}
function downloadMenus(finish,ignore){
    if (menus.length > 0 && !ignore){
        menus.pop();
        finish();
        return;
    }
    ref.child('meals').once('value', snapshot =>{
        categories.forEach(function (category){
            snapshot.child(category).forEach(function (meal){
                let name = meal.child('name').val();
                let desc = meal.child('desc').val();
                let price = meal.child('price').val();
                let head_count = meal.child('head_count').val();
                let allergens = meal.child('allergens').val();
                let instructions = meal.child('instructions').val();
                let m = new Meal(name,desc,allergens,category);
                m.price = price;
                m.empty = false;
                m.instructions = instructions;
                m.head_count = head_count;
                m.spiciness = meal.child('spiciness').val();
                m.vegetarian = meal.child('vegetarian').val();
                m.vegan = meal.child('vegan').val();
                let tags = [];
                meal.child('meal_tags').forEach(function (tag){
                    tags.push(tag.val());
                })
                m.tags = tags;
                menus.push(m);
            })
        })
        finish();
    })
}

function open_instructions(key){
    let recipe = key.replaceAll(' ','').replaceAll('\'','').toLowerCase()
    let only;
    ref.child('instructions/').once('value',snapshot=>{
        snapshot.forEach(function (instruction){
            instruction.forEach(function (keys){
                if (keys.val() === recipe){
                    only = instruction.key;
                }
            })
        })
        if (isMobile()){
            window.location.href = '/menus/'+only+'.pdf';
        }
        else{
            window.open('/menus/'+only+'.pdf', '_blank').focus();
        }
    })
}

function coming_soon(){

    let fucking_table = document.createElement('table');
    fucking_table.setAttribute('class','coming_soon')
    let fucking_row = document.createElement('tr');
    fucking_row.style.height = '100px';
    fucking_table.appendChild(fucking_row);

    let fucking_left = document.createElement('td');
    fucking_left.style.width = '20%';
    fucking_row.appendChild(fucking_left);

    let warning = document.createElement('img');
    warning.setAttribute('class','coming_soon');
    warning.src = 'media/warning.png';
    fucking_left.appendChild(warning);

    let fucking_right = document.createElement('td');
    fucking_row.appendChild(fucking_right);
    fucking_right.style.paddingRight = '30px'

    fucking_right.textContent = 'Only the valentines box is currently available; the subscription meal packs are coming soon, sit tight!'

    return fucking_table;
}

function getStarted(){
    let button = document.createElement('a');
    button.setAttribute('class','get_started');
    button.textContent = 'get started';
    button.href = '/offers.html'

    if (isMobile()){
        button.style.top = '60px';
        button.style.margin = '10px';
    }

    return button;
}

class SwitchButton{
    constructor(image) {
        let circle = document.createElement('img');
        circle.setAttribute('class','switch_button');
        if (image !== null){
            circle.src = 'media/'+image+'.png';
        }

        let background = document.createElement('div');
        background.setAttribute('class','switch_button');
        background.appendChild(circle);
        this.display = background;
        this.circle = circle;

        this.active = true;
        this.toggle();

    }

    toggle(){
        let a = this;
        a.active = !a.active;
        if (a.active){
            a.circle.style.left = '40px';
            a.display.style.backgroundColor = '#20e002';
        }
        else{
            a.circle.style.left = '0';
            a.display.style.backgroundColor = 'gray';
        }
    }
}

String.prototype.price = function (){
    let pounds = parseInt((parseInt(this)/100).toString());
    let pence = parseInt(this)%100;

    let dot = '.';
    if (pence < 10){
        dot = '.0'
    }

    return '£'+pounds+dot+pence;
}

function open_menu_box_choice(){
    let cover = document.createElement('div');
    cover.setAttribute('class','cover');
    document.getElementById('body').appendChild(cover);

    let choice = document.createElement('div');
    choice.setAttribute('class','basket_choice');
    choice.innerHTML = 'please select an option'
    cover.appendChild(choice);

    if (isMobile()){
        choice.style.width = 'calc(100% - 40px)';
        choice.style.borderRadius = '0';
        choice.style.left = '0';
    }

    let checkout = document.createElement('a');
    checkout.setAttribute('class','box');
    checkout.innerHTML = 'checkout';
    choice.appendChild(checkout);
    checkout.style.right = '0';
    checkout.style.bottom = '0';
    checkout.style.margin = '20px'

    let exit = document.createElement('div');
    exit.setAttribute('class','exit_basket')
    exit.innerHTML = 'close';
    choice.appendChild(exit);
    exit.style.right = checkout.offsetWidth+40+'px';

    let table = document.createElement('table');
    table.setAttribute('class','basket_options');
    choice.appendChild(table);

    let href = '/register.html';
    if (isSignedIn){
        href = '/checkout.html';
    }
    checkout.href = href+'?purchase=month_box&children=0';

    let c = 0;
    let o = '?purchase=month_box';

    function update_link(){
        checkout.href = href+o+'&children='+c;
    }

    let buttons = [];
    let options = {
        'the valentines box':'?purchase=month_box',
        'the valentines box (1 veg)':'?purchase=month_box&variation=1_veg_1_reg',
        'the valentines box (2 veg)':'?purchase=month_box&variation=2_veg'
    };
    ['the valentines box','the valentines box (1 veg)','the valentines box (2 veg)'].forEach(function (option){
        let row = document.createElement('tr');
        table.appendChild(row);
        let left = document.createElement('td');
        row.appendChild(left);
        left.innerHTML = '⚪️';
        left.style.textAlign = 'center';
        left.style.cursor = 'pointer';
        buttons.push(left);
        left.style.width = '60px';
        let right = document.createElement('td');
        right.setAttribute('class','basket_options')
        row.appendChild(right);
        right.innerHTML = option;
        [left,right].forEach(function (c){
            c.onclick = function (){
                buttons.forEach(function (a){
                    a.innerHTML = '⚪️';
                })
                left.innerHTML = '🔵';
                o = options[option];
                update_link();
            }
        })
    })
    buttons[0].innerHTML = '🔵';

    let children = document.createElement('tr');
    table.appendChild(children);
    let l = document.createElement('td');
    children.appendChild(l);
    let r = document.createElement('td');
    children.appendChild(r);
    r.textContent = '0 children\'s meals'

    l.innerHTML = '<span class="children" id="less children">🔽</span><span class="children" id="more children">🔼</span>'

    function change_children(by){
        c += by;
        if (c < 0){
            c = 0;
        }
        switch (c){
            case 1:
                r.textContent = c+' children\'s meal'
                break;
            default:
                r.textContent = c+' children\'s meals'
                break;

        }
        update_link();
    }

    document.getElementById('less children').onclick = function (){
        change_children(-1)
    }

    document.getElementById('more children').onclick = function (){
        change_children(1)
    }

    exit.onclick = function (){
        document.getElementById('body').removeChild(cover);
    }

}
String.prototype.toDate = function (){
    let sp = this.split(':');
    let month = months[parseInt(sp[1])];
    if (isMobile()){
        month = month.slice(0,3);
    }
    return [sp[2],month,sp[0]].join(' ');
}

function get_month(){
    let n = (new Date()).getMonth();
    if (n === 12) {
        n = 0
    }
    return months[n]
}