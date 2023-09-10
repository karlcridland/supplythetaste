let section;
let scroll;

function botm(){
    section = document.getElementById('2');
    section.style.backgroundImage = 'unset';
    section.innerHTML = '';

    universal_styling();

    let main = document.getElementById('main');
    main.scrollTop = window.innerHeight-100;
    document.getElementById('body').onresize = function (){
        scroll_to_botm(current_screen,true);
    }

    let variance = window.innerHeight/3;
    function readjust_main(){
        if (main.scrollTop > section.offsetTop-variance && main.scrollTop < section.offsetTop+variance){
            main.scrollTop = section.offsetTop;
        }
    }

    main.onscrollstop(function (){
        readjust_main()
    })

    document.getElementById('body').onresize = function (){
        readjust_main();
    }
}

HTMLDivElement.prototype.onscrollstop = function (callback){
    let timer = null;
    this.addEventListener('scroll', function() {
        if(timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            callback();
        }, 150);
    }, false);
}

let current_screen = 0;
let nav_dots = [];

function universal_styling(){

    scroll = document.createElement('div');
    scroll.setAttribute('class','botm_scroll');
    section.appendChild(scroll);

    scroll.onscrollstop(function (){
        scroll_to_botm(current_screen,true);
    })

    let i = 0;
    [load_wdwd(),load_botm(),load_lsom()].forEach(function (screen){
        scroll.appendChild(screen);
        screen.style.left = 'calc('+(i++)*100+'%)';
    })

    let navigation = document.createElement('div');
    navigation.setAttribute('class','navigation');
    section.appendChild(navigation);

    for (let i = 0; i < 3; i++){
        let nav_dot = document.createElement('div');
        nav_dots.push(nav_dot);
        nav_dot.setAttribute('class','nav_dot');
        navigation.appendChild(nav_dot);

        nav_dot.onclick = function (){
            scroll_to_botm(i,true);
        }
    }

    let left = {0:'10px',1:'calc(100% - 50px)'};
    for (let i = 0; i < 2; i++){
        let arrow = document.createElement('img');
        arrow.setAttribute('class','botm_arrow');
        arrow.src = 'media/dropdown.png';
        section.appendChild(arrow);
        arrow.style.left = left[i];
        arrow.style.transform = 'rotate('+(270+(180*(i-1)))+'deg)';

        arrow.onmouseenter = function (){
            arrow.src = 'media/dropdown_blue.png';
        }

        arrow.onmouseleave = function (){
            arrow.src = 'media/dropdown.png';
        }

        arrow.onclick = function (){
            switch (i){
                case 0:
                    scroll_to_botm(current_screen-1,true);
                    break;
                case 1:
                    scroll_to_botm(current_screen+1,true);
                    break;
            }
        }
    }
    scroll_to_botm(0);
    scroll.onscroll = function (){
        if (scroll.scrollLeft < window.innerWidth/2){
            scroll_to_botm(0,false);
        }
        else if (scroll.scrollLeft < 3*window.innerWidth/2){
            scroll_to_botm(1,false);
        }
        else{
            scroll_to_botm(2,false);
        }
    }

}

function scroll_to_botm(screen,click){
    let go_to = screen;
    if (go_to < 0){
        go_to = 2;
    }
    if (go_to > 2){
        go_to = 0;
    }
    current_screen = go_to;
    let i = 0;
    nav_dots.forEach(function (nav_dot){
        if (i++ === current_screen){
            nav_dot.style.backgroundColor = 'black';
        }
        else{
            nav_dot.style.backgroundColor = 'white';
        }
    })
    if (click){
        scroll.scrollLeft = window.innerWidth*current_screen;
    }
}

function load_wdwd(){
    let view = document.createElement('div');
    view.setAttribute('class','scroll_screen');
    view.style.backgroundImage = 'linear-gradient(180deg, #000000, #000000)'
    view.style.backgroundSize = 'cover';

    let title = document.createElement('div');
    title.setAttribute('class','scroll_screen_title');
    title.textContent = 'What do we do?';
    view.appendChild(title);

    let floating = document.createElement('img');
    floating.setAttribute('class','scroll_screen_img');
    floating.src = 'media/floating_brownies.png'
    view.appendChild(floating);

    let body = document.createElement('div');
    body.setAttribute('class','scroll_screen_body');
    body.innerHTML = 'We’re a home meal kit service that preps the meals before sending them out, we don’t think ' +
        'our competitors can say the same.. <br><br>Choose from our ever expanding range of meals, or from our box of the ' +
        'month - an alternating box that offers a new exciting taste each month!<br><br>Our chefs bring the food to a ' +
        'restaurant standard before it arrives to you. Following simple instructions, you ' +
        'put in the least amount of effort and get fantastic results. They\'ve done most of the work, and we\'ve ' +
        'thought of everything ...we just can’t help with the dishes.';
    view.appendChild(body);


    return view;
}

function load_botm(){
    let view = document.createElement('div');
    view.setAttribute('class','scroll_screen');
    view.style.backgroundColor = 'blue';
    return view;
}

function load_lsom(){
    let view = document.createElement('div');
    view.setAttribute('class','scroll_screen');
    return view;
}