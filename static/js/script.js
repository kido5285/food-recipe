//key1=2599843882ce4d21848abbc998fa9448
//key2=652ec0b216d3491b80e5903ee4847e26
//key3=a7430e47cd8644ba8812ad8b088dae53
//key4=49935d5bb7d843969adbe99a6a4a0589
//key5=b9250bb72afa4cb78be63553a69d652b

function bodyclicks(e) {
    let mobnav = document.querySelector('.mobile-nav');
    if(mobnav.classList.contains('active-nav') && !e.target.classList.contains('mob-nav-elem')){
        mobnav.classList.remove('active-nav');
    }
}

document.querySelector('.mob-ham').onclick = (e) => {
    let mobnav = document.querySelector('.mobile-nav');
    if(mobnav.classList.contains('active-nav')){
        mobnav.classList.remove('active-nav');
    } else {
        mobnav.classList.add('active-nav');
    }
}

let cuisines = ['African', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese', 'Eastern European', 'European', 'French', 'German' ,'Greek' ,'Indian' ,'Irish' ,'Italian' ,'Japanese' ,'Jewish' ,'Korean' ,'Latin American', 'Mediterranean' ,'Mexican' ,'Middle Eastern' ,'Nordic' ,'Southern' ,'Spanish' ,'Thai' ,'Vietnamese']

async function getData(query, cuisine){   
    let fetchData = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=2599843882ce4d21848abbc998fa9448&query=${query}&cuisine=${cuisine}&fillIngredients=true&instructionsRequired=true&addRecipeInformation=true&addRecipeNutrition=true&number=10000`);
    let fetchedJSON = await fetchData.json();   
    return fetchedJSON
}

async function getData2(id){   
    let fetchData = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=2599843882ce4d21848abbc998fa9448&fillIngredients=true&instructionsRequired=true&addRecipeInformation=true&addRecipeNutrition=true&number=10000`);
    let fetchedJSON = await fetchData.json();   
    return fetchedJSON;
}

async function getNutrition(id){
    let fetchNutri = await fetch(`https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=2599843882ce4d21848abbc998fa9448`)
    let fetchedJSON = await fetchNutri.json();
    return fetchedJSON;
}

function waitforelem(selector, callback){
    let inter = setInterval(() => {
        if(document.querySelector(selector)){
            clearInterval(inter);
            callback();
        }
    }, 1000)
}

waitforelem('#outer-cuisines', async () => {
    document.getElementById('outer-cuisines').innerHTML = '';
    for(let i=0; i < cuisines.length; i++){
        let html = `
<div class="sig-outer-cuisine">
    <a href="/cuisine/${cuisines[i]}">
        <div class="img-holder">
            <img src="../static/images/cuisines/${cuisines[i].toLowerCase().split(' ').join('-')}-outer.jpg">
        </div>
        <h2>${cuisines[i]}</h2>
        <p>Classic Dish</p>
    </a>
</div>
<div class="item-break"></div>
`
        document.getElementById('outer-cuisines').innerHTML += html;
    }
})

waitforelem('#inner-cuisines', async () => {
    getData('', window.location.href.split('/')[window.location.href.split('/').length-2]).then(data => {
        let results = data.results;
        document.getElementById('inner-cuisines').innerHTML = '';
        console.log(results);
        for(let i=0; i < results.length; i++){
            let html = `
<div class="sig-inner-cuisine">
    <a href="/recipe/${results[i]['id']}">
        <div class="img-holder">
            <img src="${results[i]['image']}">
        </div>
        <h2>${results[i]['title']}</h2>
        <p><i class="fas fa-arrow-up"></i> delicious food</p>
    </a>
</div>
<div class="item-break"></div>
            `
            document.getElementById('inner-cuisines').innerHTML += html;
        }
    }).catch(e => {
        document.querySelector('#inner-cuisines').innerHTML = '<h1 class="error">Cuisine Not Found</h1>'; 
    })
})

function nutritions(data){
    let html = '';
    for(let i=0; i < data['bad'].length; i++){
        html += '<div class="col"><span>'+ data['bad'][i]['title'] + '</span><span>'+ data['bad'][i]['amount'] + '</span></div>';
        html += '<div class="col"><span>'+ data['good'][i]['title'] + '</span><span>'+ data['good'][i]['amount'] + '</span></div>';
    }
    return html;
}

function ingredients(data) {
    let html = '';
    for(let i=0; i < data.length; i++){
        html += '<div class="col"><span>' + data[i]['original'] + '</span></div>';
    }
    return html;
}

waitforelem('#recipe-dets', async () => {
    getData2(window.location.href.split('/')[window.location.href.split('/').length-2]).then(data => {
        console.log(data);
        document.querySelector('.foodrecipetitle').innerHTML = data['title'];
        document.querySelector('.cuisinetype').innerHTML = data['cuisines'][0];
        getNutrition(window.location.href.split('/')[window.location.href.split('/').length-2]).then(nutri => {
            console.log(nutri)
            let mainhtml = `
<div class="header">
    <h1>${data['title']}</h1> 
    <div class="col">
        <span class="ratings">${data['spoonacularScore']}% <i class="far fa-thumbs-up"></i></span>
        <span class="min-to-prep">${data['readyInMinutes']} minutes to prepare</span>
    </div>
</div>
<img src="${data['image']}" alt="food">       
<hr>
<p>${data['summary']}</p>
<div class="instruction">
    <h2>Instructions</h2>
    ${data['instructions']}
</div>
<div class="infos">
    <div class="info">
        <h2>Nutrition</h2>
        <div class="break"></div>
        ${nutritions(nutri)}
    </div>
    <div class="info">
        <h2>Ingredients</h2>
        <div class="break"></div>
        ${ingredients(data['extendedIngredients'])}
    </div>
</div>
`
            document.querySelector('#recipe-dets').innerHTML = mainhtml;
        })
    }).catch(e => {
        document.querySelector('#recipe-dets').innerHTML = '<h1 class="error">Recipe Not Found</h1>'; 
    })
})