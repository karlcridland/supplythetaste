function initIndex() {
    // botm();
    set_up_box_month();
    // set_up_what_do_we_do();
    on_scroll();

    let i = 0;
    ['instagram', 'twitter', 'tiktok'].reverse().forEach(function (social) {
        let img = document.createElement('img');
        img.alt = social;
        document.getElementById('3').appendChildLink(img, 'https://' + social + '.com/supplythetaste');
        img.setAttribute('class', 'social');
        img.setAttribute('id', social);
        img.style.right = (i++ * 100 + 20) + 'px';
        img.style.transform = 'scale(0.8,0.8)';
        img.src = 'media/' + social + '.png'
        if (social === 'tiktok'){
            document.getElementById('3').appendChildLink(img, 'https://' + social + '.com/@supplythetaste');
        }
    })

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let button = document.getElementById('front_register');
            button.textContent = 'account';
            button.href = '/account.html'
        }
    });

    if (isMobile()) {
        try{
            document.getElementById('table').style.padding = '10px';
            document.getElementById('title').style.padding = '10px';
            document.getElementById('table').style.fontSize = '14px';
            document.getElementById('title').style.fontSize = '24px';
            document.getElementById('a').style.top = '0';
            document.getElementById('purchase').style.bottom = '10%';
            document.getElementById('monthly pic').style.filter = 'blur(3px)';

            document.getElementById('front b').style.fontSize = '6vh';
            document.getElementById('front b').style.paddingTop = '10%';
            document.getElementById('tl').style.width = '100%';

        }
        catch(e){

        }

        document.getElementById('about us').style.padding = '20px';
        document.getElementById('about us').style.fontSize = '30px';

        let twitter = document.getElementById('twitter');
        let instagram = document.getElementById('instagram');
        let tiktok = document.getElementById('tiktok');

        document.getElementById('freebie').style.opacity = '0';
        instagram.style.transform = 'translateX(20px) scale(0.6,0.6)';
        twitter.style.transform = 'translateX(20px) scale(0.6,0.6)';
        tiktok.style.transform = 'translateX(20px) scale(0.6,0.6)';
        instagram.style.margin = 'unset';
        twitter.style.margin = 'unset';
        tiktok.style.margin = 'unset';
        document.getElementById('about us text').style.width = '75%';
        try{
            document.getElementById('a').style.top = '10%';
            document.getElementById('a').style.fontSize = '20px';
        }catch (e) {
            
        }
    } else {
        document.getElementById('instagram').style.transform = 'translateX(-20px)';
        document.getElementById('twitter').style.transform = 'translateX(-20px)';
        document.getElementById('tiktok').style.transform = 'translateX(-20px)';
    }

    try {
        ['box left', 'box right'].forEach(function (a) {
            sections.push(document.getElementById(a));
            reconfigure_sections();
        })
    } catch (e) {
    }

    try{
        document.getElementById('what click').onclick = function (){
            window.location.href = '/directions.html';
        };
        document.getElementById('sub click').onclick = function (){
            window.location.href = '/choose.html';
        };

        document.getElementById('box click').onclick = function (){
            document.getElementById('main').scrollTo({
                top: document.getElementById('2').offsetTop,
                behavior: 'smooth',
            });
            side_panel(false);
        }

        document.getElementById('about click').onclick = function (){
            document.getElementById('main').scrollTo({
                top: document.getElementById('3').offsetTop,
                behavior: 'smooth',
            });
        }
    }
    catch{

    }

    document.getElementById('logo').style.opacity = '0';
}

function on_scroll(){
    let main = document.getElementById('main');
    main.onscroll = function (){
        let logo = document.getElementById('front_logo');

        let viewportOffset = logo.getBoundingClientRect();
        let opacity = -viewportOffset.top/500;
        document.getElementById('logo').style.opacity = opacity.toString();

    }
}

function set_up_what_do_we_do(){
    if (isMobile()){
        try{

            let image = document.getElementById('wdwd_image');
            image.style.opacity = '0';
            let bottom = document.getElementById('wdwd2');
            bottom.style.opacity = '0';

            let top = document.getElementById('wdwd1');
            top.style.width = 'calc(100% - 60px)';
            top.style.height = 'calc(90% - 150px)';
            top.style.fontSize = '0.8em';

            let section = document.getElementById('1');

            let links = {'meals':'/choose.html','register':'/register.html'};
            ['meals','register'].forEach(function (a){
                let button = document.createElement('a');
                button.setAttribute('class','click_me');
                button.style.width = 'calc(50% - 100px)';
                button.style.marginBottom = '20px';
                button.style.bottom = '0';
                button.href = links[a];
                button.textContent = a;
                section.appendChild(button);
                if (a === 'register'){
                    button.style.left = '0';
                    button.style.right = 'unset';
                }
            })

        }
        catch (e) {
            
        }
    }
}

function set_up_box_month(){

    let standard = [];
    let vegetarian = [];

    function display_menu(std) {
        let menu = standard;
        if (!std) {
            menu = vegetarian;
        }
        for (let i = 0; i < 4; i++) {
            if (menu[i] !== undefined) {
                if (menu[i].length > 0){
                    let line = document.getElementById('line ' + (i + 1));
                    line.textContent = '• ' + menu[i];
                    line.style.paddingBottom = '20px';
                }
            }
        }
    }

    try{
        let month = get_month();

        ref.child('specials/name/' + month).once('value', snapshot => {
            try{
                document.getElementById('title').innerHTML = month + '\'s box:<br>' + snapshot.val();
            }
            catch (e) {
                
            }
        })
        document.getElementById('monthly pic').getImage('specials/' + month);
        document.getElementById('monthly pic').style.filter = 'blur(8px)';

        ref.child('specials/starter/' + month).once('value', a => {
            standard.push(a.child('1').val());
            vegetarian.push(a.child('2').val());

            ref.child('specials/mains/' + month).once('value', b => {
                standard.push(b.child('1').val());
                vegetarian.push(b.child('2').val());

                ref.child('specials/dessert/' + month).once('value', c => {
                    standard.push(c.child('1').val());
                    vegetarian.push(c.child('2').val());
                    if (vegetarian[2] == null) {
                        vegetarian[2] = standard[2]
                    }

                    ref.child('specials/extra/' + month).once('value', a => {
                        standard.push(a.val());
                        vegetarian.push(a.val());

                        display_menu(true);
                    })
                })
            })
        })

        let s = new SwitchButton('leaf');
        s.display.style.right = '20px';
        document.getElementById('box left').appendChild(s.display);

        if (isMobile()){
            document.getElementById('box right').appendChild(s.display);
            s.display.style.top = '20px';
            s.display.style.transform = 'scale(0.8,0.8)'
        }
        else{
            document.getElementById('box left').appendChild(s.display);
            s.display.style.bottom = '20px';
        }

        s.display.onclick = function () {
            s.toggle();
            display_menu(!s.active);
            if (s.active) {
                document.getElementById('2').style.backgroundImage = 'url("media/vegetarian.jpg")';
            } else {
                document.getElementById('2').style.backgroundImage = 'url("media/pattern.jpg")';
            }
        };
        s.display.style.zIndex = '9001';
        s.display.click();
        s.display.click();

        let p = document.getElementById('purchase');
        p.style.left = 'calc(50% - ' + p.offsetWidth / 2 + 'px)';

        p.onclick = function (){
            let extra = 'reg';
            if (s.active){
                extra = 'veg';
            }
            window.location.href = '/choose?basket=box_of_the_month_'+extra;
        }
    }catch (e) {

    }
    finally {
        try{
            if (!isMobile()){
                try{
                    document.getElementById('a').style.top = '20%';
                    document.getElementById('a').style.width = '100%';
                    document.getElementById('a').style.padding = 'unset';
                    document.getElementById('a').style.position = 'absolute';
                    document.getElementById('first').style.transform = 'scale(0.8,0.8) translateX(80px)';
                    document.getElementById('first').style.boxShadow = '0 20px 20px 20px rgba(0,0,0,0.2)';
                    document.getElementById('purchase').style.transform = 'scale(1.2,1.2)';
                    document.getElementById('a').style.transform = 'scale(1.2,1.2)';
                }
                catch (e) {

                }
            }
        }catch (e) {

        }
    }
}