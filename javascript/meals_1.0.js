function initMeals(){
    menus = [];

    downloadMenus(function (){
        displayMenus();
    });

    if (!isMobile()){
        document.getElementById('header').style.backgroundColor = 'white';
        document.getElementById('body').style.backgroundImage = 'url("media/platter.jpg")';
        document.getElementById('body').style.backgroundSize = 'cover';
        document.getElementById('main').style.borderRadius = '8px';
        document.getElementById('main').style.margin = '50px';
        document.getElementById('main').style.width = 'calc(100% - 100px)';
        document.getElementById('main').style.height = 'calc(100% - 200px)';
    }
    document.getElementById('main').style.backgroundColor = 'white';

}

function displayMenus(){
    let emojis = {'beef':'🥩','chicken':'🍗','pork':'🍖','fish':'🐟','vegetarian':'🥗','dessert':'🧁'}
    let main = document.getElementById('main');
    categories.forEach(function (category){
        let meals = [];
        try{
            menus.forEach(function (m){
                if (m.category === category && !m.isEmpty()){
                    meals.push(m)
                }
            })
        }
        catch (e) {

        }
        if (meals.length > 0){
            let title = document.createElement('div');
            title.setAttribute('class','title');
            title.textContent = category + ' ' + emojis[category];
            main.appendChild(title);

            const category_color = {
                'beef':'#8c4d2a',
                'chicken': '#e3c505',
                'pork': '#f8a9ec',
                'fish': '#099ce0',
                'vegetarian': '#46ee20',
                'dessert': '#000000',
            };

            let line = document.createElement('div');
            line.setAttribute('class','cat_height');
            line.style.top = title.offsetTop-10+'px';
            line.style.backgroundColor = category_color[category];
            main.appendChild(line);

            let table = document.createElement('table');
            table.setAttribute('class','meal_table');
            main.appendChild(table);

            if (isMobile()){
                table.style.paddingLeft = 'calc(2% + 9px)';
                title.style.paddingLeft = '5px';
                title.style.marginLeft = 'calc(2% + 9px)';
                table.style.fontFamily = 'sans-serif';
            }

            meals.forEach(function (m){
                let row = document.createElement('tr');
                row.setAttribute('class','meal_table');
                table.appendChild(row);

                let a = document.createElement('td');
                a.setAttribute('class','meal_table');
                a.innerHTML = m.name;
                row.appendChild(a);

                let b = document.createElement('td');
                b.setAttribute('class','meal_table');
                b.style.width = '65%';
                b.innerHTML = m.description;
                row.appendChild(b);

                if (isMobile()){
                    a.style.width = '35%';
                    if (m.allergens.length > 0){
                        b.innerHTML = m.description + ' (allergens: ' + m.allergens + ')';
                    }
                    b.style.fontWeight = '200';
                }
                else{
                    a.style.width = '25%';
                    let c = document.createElement('td');
                    c.setAttribute('class','meal_table');
                    c.innerHTML = m.allergens;
                    row.appendChild(c);
                }

            })

            line.style.height = title.offsetHeight+table.offsetHeight+'px';
        }
    })
}