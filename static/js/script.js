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
    let fetchData = await fetch(`/getcuisine/${cuisine}`);
    let fetchedJSON = await fetchData.json();   
    return fetchedJSON
}

async function getData2(id, cuisine){   
    let fetchData = await fetch(`/getcuisinebyid/${id}/${cuisine}`);
    let fetchedJSON = await fetchData.json();   
    return fetchedJSON;
}

async function getNutrition(id, cuisine){
    console.log(id, cuisine)
    let fetchNutri = await fetch(`/getnutritionbyid/${id}/${cuisine}`)
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
    <a href="/cuisine/${cuisines[i].toLowerCase()}">
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
    getData('', window.location.href.split('/')[window.location.href.split('/').length-2].toLowerCase()).then(data => {
        let results = JSON.parse(data);
        document.getElementById('inner-cuisines').innerHTML = '';
        console.log(results.length, typeof results, results);
        let innerhtml = '';
        for(let i=0; i < results.length; i++){
            console.log(results[i]["id"], results[i]["image"], results[i]["title"]);
            innerhtml += `
<div class="sig-inner-cuisine">
    <a href="/recipe/${results[i]["id"]}/${window.location.href.split('/')[window.location.href.split('/').length-2]}">
        <div class="img-holder">
            <img src="${results[i]["image"]}">
        </div>
        <h2>${results[i]["title"]}</h2>
        <p><i class="fas fa-arrow-up"></i> delicious food</p>
    </a>
</div>
<div class="item-break"></div>
            `
        }
        document.getElementById('inner-cuisines').innerHTML = innerhtml;
    }).catch(e => {
        document.querySelector('#inner-cuisines').innerHTML = '<h1 class="error">Cuisine Not Found</h1>'; 
    })
})

function nutritions(data){
    let html = '';
    for(let i=0; i < data['bad'].length; i++){
        html += '<div class="col"><span data-dets="nutrition-bad-' + i + '-title">' + data['bad'][i]['title'] + '</span><span data-dets="nutrition-bad-' + i + '-amount">'+ data['bad'][i]['amount'] + '</span></div>';
        html += '<div class="col"><span data-dets="nutrition-good-' + i + '-title">' +  data['good'][i]['title'] + '</span><span data-dets="nutrition-good-' + i + '-amount">'+ data['good'][i]['amount'] + '</span></div>';
    }
    return html;
}

function ingredients(data) {
    let html = '';
    for(let i=0; i < data.length; i++){
        html += '<div class="col"><span data-dets="ingredients-'+ i +'">' + data[i]['original'] + '</span></div>';
    }
    return html;
}

function summary(data){
    let splited = data.split('<a href=');
    let atagslen = splited.length - 1;
    for(let i=0; i<atagslen; i++){
        splited[i] = `${splited[i]}<a data-dets="a-tag-${i+1}" onhover="editatag(event)" onclick="editatag(event)" oninput="changelistener(event); target="_blank" href=`;
    }
    return splited.join('')
}

function changelistener(event, cont){
    let targetelem = event.target;
    let recipeid = parseInt(window.location.href.split('/')[4]);
    let cuisine = window.location.href.split('/')[5];
    let datadets = targetelem.dataset['dets']
    let content;
    if(targetelem.dataset.dets.split('-')[0] === 'instruction'){
        content = targetelem.parentElement.outerHTML;
    } else {
        content = targetelem.innerHTML;
    }
    $.post("/updaterecipe", {
        'recipeid': recipeid,
        'data-dets': datadets,
        'content': content,
        'cuisine': cuisine
    }, (data, status) => {
        console.log(data, status)
    })
}


waitforelem('#recipe-dets', async () => {
    let ifyrcreator = false;
    if(document.querySelector('#recipe-dets .buttons')){
        ifyrcreator = true;
        document.querySelector('#recipe-dets .buttons').style.display = 'none';
    }
    getData2(window.location.href.split('/')[window.location.href.split('/').length-2], window.location.href.split('/')[window.location.href.split('/').length-1]).then(data => {
        data = JSON.parse(data)
        console.log(data)   
        document.querySelector('.foodrecipetitle').innerHTML = data['title'];
        document.querySelector('.cuisinetype').innerHTML = data['cuisines'][0];
        getNutrition(window.location.href.split('/')[window.location.href.split('/').length-2], window.location.href.split('/')[window.location.href.split('/').length-1]).then(nutri => {
            nutri = JSON.parse(nutri)
            console.log(nutri);
            console.log(summary(data['summary']), data['instructions'].split('\n').join(''));
            let mainhtml = `
<div class="header">
    <h1 data-dets="title">${data['title']}</h1> 
    <div class="col">
        <ins class="ratings"><span data-dets="spoonacularScore">${data['spoonacularScore']}</span>% <i class="far fa-thumbs-up"></i></ins>
        <span class="min-to-prep" data-dets="readyInMinutes">${data['readyInMinutes']} minutes to prepare</span>
    </div>
</div>
<img src="${data['image']}" alt="food">       
<hr>
<p class="summary" data-dets="summary" oninput="changelistener(event);">${summary(data['summary'])}</p>
<div class="instruction">
    <h2>Instructions</h2>
    ${data['instructions'].split('\n').join('')}
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
`;           
            if(ifyrcreator){
                document.querySelector('#recipe-dets').innerHTML = mainhtml + '<div class="buttons"><button onclick="editrecipe(event)" class="edit-recipe"><i class="far fa-edit"></i>  Edit - Click on text to edit</button><button class="cancel-edit" onclick="canceledit(event)">Cancel</button></div>';
            } else {
                document.querySelector('#recipe-dets').innerHTML = mainhtml;
            }
            [...document.querySelectorAll('#recipe-dets h1')].forEach(elem => {
                elem.contentEditable = false;
            });
            [...document.querySelectorAll('#recipe-dets li')].forEach((elem, i) => {
                elem.contentEditable = false;
            });
            [...document.querySelectorAll('#recipe-dets span')].forEach(elem => {
                elem.contentEditable = false;
            });
            [...document.querySelectorAll('#recipe-dets p')].forEach(elem => {
                elem.contentEditable = false;
            });
        })
    }).catch(e => {
        console.log(e)
        document.querySelector('#recipe-dets').innerHTML = '<h1 class="error">Recipe Not Found</h1>'; 
    })
})


function editrecipe(e){
    [...document.querySelectorAll('#recipe-dets h1')].forEach(elem => {
        elem.contentEditable = true;
        elem.oninput = (event) => {
            return changelistener(event);
        }
    });
    [...document.querySelectorAll('#recipe-dets li')].forEach((elem, i) => {
        elem.contentEditable = true;
        elem.oninput = (event) => {
            return changelistener(event);
        };
        elem.dataset.dets = `instruction-${i+1}`;
    });
    [...document.querySelectorAll('#recipe-dets span')].forEach(elem => {
        elem.contentEditable = true;
        elem.oninput = (event) => {
            return changelistener(event);
        }
    });
    [...document.querySelectorAll('#recipe-dets p')].forEach(elem => {
        elem.contentEditable = true;
        elem.oninput = (event) => {
            return changelistener(event);
        }
    });
    let summaryelem = document.querySelector('.summary');
    document.querySelector('#recipe-dets .summary').outerHTML = document.querySelector('#recipe-dets .summary').outerHTML + '<div class="edit-a-tags"></div>';
}

function canceledit(e) {
    [...document.querySelectorAll('#recipe-dets h1')].forEach(elem => {
        elem.contentEditable = false;
        elem.removeEventListener('input', (eve) => changelistener(eve))
    });
    [...document.querySelectorAll('#recipe-dets li')].forEach((elem, i) => {
        elem.contentEditable = false;
        elem.removeEventListener('input', (eve) => changelistener(eve));
        elem.dataset.dets = '';
    });
    [...document.querySelectorAll('#recipe-dets span')].forEach(elem => {
        elem.contentEditable = false;
        elem.removeEventListener('input', (eve) => changelistener(eve));
    });
    [...document.querySelectorAll('#recipe-dets p')].forEach(elem => {
        elem.contentEditable = false;
        elem.removeEventListener('input', (eve) => changelistener(eve));    
    });
    document.getElementById('recipe-dets').removeChild(document.querySelector('.edit-a-tags'));
}

function deleteedit(event){
    let atagedit = event.target.parentElement;
    let atagedits = event.target.parentElement.parentElement;
    atagedits.removeChild(atagedit);
}

function changeatag(elem, mode){
    let atag = elem.parentElement.classList[1];
    let ath = parseInt(atag.slice(atag.length - 1, atag.length));
    let summaryatags = [...document.querySelectorAll('.summary a')];
    for(let i=0; i < summaryatags.length; i++){
        if(mode === 'title' && i === (ath-1)){
            summaryatags[ath - 1].textContent = elem.value;
        }
        if(mode === 'url' && i === (ath-1)){
            summaryatags[ath - 1].href = elem.value;
            changelistener({'target': document.querySelector('.summary')});
        }
    }
}

function editatag(event) {
    if(!document.querySelector('#recipe-dets .header h1').contentEditable){
        return;
    }
    let atagtitle = event.target.dataset.dets;
    let atagcontent = event.target.textContent;
    let ataghref = event.target.href;
    let nodes = [...document.querySelector('.edit-a-tags').children];
    console.log(atagtitle, atagcontent, ataghref, nodes)
    let html = `
    <div class="edit-a-tag ${atagtitle}">
        <i class="fas fa-times" onclick="deleteedit(event)"></i>
        <h3>Edit ${atagtitle}</h3>
        <input type="text" id="url" name="url" placeholder="Url" onkeyup = "changeatag(this, 'url');" value="${ataghref}">
    </div>
    `
    if(nodes.length === 0){
        document.querySelector('.edit-a-tags').innerHTML += html;
    } else {
        let shouldiaddhtml = true;
        for(let i=0; i < nodes.length; i++){
            if(nodes[i].classList.contains(atagtitle)){
                shouldiaddhtml = false;
            } else if(i === nodes.length - 1 && shouldiaddhtml){
                document.querySelector('.edit-a-tags').innerHTML += html;
            }
        }
    }
}

function submitrecipered() {
    window.location.href = '/submitrecipe'
}

document.querySelector('#submitrecipe .instruction button').onclick = (e) => {
    let list = e.target.parentElement.querySelector('ol');
    let lielem = document.createElement('li')
    lielem.contentEditable = true;
    let listlen = [...list.querySelectorAll('li')].length;
    lielem.textContent = `${listlen + 1}th Step`;
    list.appendChild(lielem);
    console.log(list)
}

document.querySelector('#submitrecipe .nutrition .good button').onclick = (e) => {
    let list = e.target.parentElement.querySelector('ul');
    let lielem = document.createElement('li')
    let listlen = [...list.querySelectorAll('li')].length;
    lielem.innerHTML = `<span class="title" contenteditable="true">${listlen + 1}th title</span><span class="amount" contenteditable="true">${listlen + 1}th amount</span>`;
    list.appendChild(lielem);
    console.log(list)
}

document.querySelector('#submitrecipe .nutrition .bad button').onclick = (e) => {
    let list = e.target.parentElement.querySelector('ul');
    let lielem = document.createElement('li')
    let listlen = [...list.querySelectorAll('li')].length;
    lielem.innerHTML = `<span class="title" contenteditable="true">${listlen + 1}th title</span><span class="amount" contenteditable="true">${listlen + 1}th amount</span>`;
    list.appendChild(lielem);
    console.log(list)
}

document.querySelector('#submitrecipe .ingredients button').onclick = (e) => {
    let list = e.target.parentElement.querySelector('ul');
    let lielem = document.createElement('li')
    lielem.contentEditable = true;
    let listlen = [...list.querySelectorAll('li')].length;
    lielem.textContent = `${listlen + 1}th ingredient`;
    list.appendChild(lielem);
    console.log(list)
}

function good(data){
    let arr = [];
    for(let i=0; i < data.length; i++){
        let obj = {}
        obj['title'] = data[i].querySelector('.title').textContent;
        obj['amount'] = data[i].querySelector('.amount').textContent;
        arr.push(obj);
    }
    return arr;
}

function bad(data){
    let arr = [];
    for(let i=0; i < data.length; i++){
        let obj = {}
        obj['title'] = data[i].querySelector('.title').textContent;
        obj['amount'] = data[i].querySelector('.amount').textContent;
        arr.push(obj);
    }
    return arr;
}

function extendedIngredient(data){
    let arr = [];
    for(let i=0; i < data.length; i++){
        let obj = {};
        obj['original'] = data[i].textContent;
        arr.push(obj);
    }
    return arr;
}

function randomid(){
    let id = '';
    for(let i=0; i < 7; i++){
        id += Math.floor(Math.random() * 9);
    }
    return id;
}

document.querySelector('#submitrecipe form').onsubmit = (e) => {
    e.preventDefault();
    let form = e.target;
    let title = form.querySelector('#title').value;
    let spoonacularScore = parseInt(form.querySelector('#ratings').value);
    let readyInMinutes = parseInt(form.querySelector('#readyInMinutes').value);
    let cuisines = [form.querySelector('#cuisine').value];
    let image = form.querySelector('#url').value;
    let summary = form.querySelector('textarea').value;
    let instructions = form.querySelector('.instruction ol').outerHTML;
    let goodNutrition = good([...form.querySelectorAll('.nutrition .good .good-list li')]);
    let badNutrition = bad([...form.querySelectorAll('.nutrition .bad .bad-list li')]);
    let extendedIngredients = extendedIngredient([...form.querySelectorAll('.ingredients ul li')]);
    let nutrition = {
        "good": goodNutrition,
        "bad": badNutrition
    }
    $.post('/submitpostrecipe', {
        "title": title,
        "spoonacularScore": spoonacularScore,
        "readyInMinutes": readyInMinutes,
        "cuisines": cuisines,
        "image": image,
        "summary": summary,
        "instructions": instructions,
        "extendedIngredients": JSON.stringify(extendedIngredients),
        "nutrition": JSON.stringify(nutrition),
        "id": parseInt(randomid()),
    }, () => {
        document.querySelector('#submitrecipe form').innerHTML = '<div class="success">Submited Successfully</div>' + document.querySelector('#submitrecipe form').innerHTML;
        window.scrollTo(100, 0);
    })
}

function signup(event){
    event.preventDefault();
    let username = event.target.querySelector('#username').value;
    let email = event.target.querySelector('#email').value;
    let password = event.target.querySelector('#password').value;
    let query = `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    $.post('/users/signup/', query, (data, status) => {
        document.querySelector('.signup-form').innerHTML = `<div class="success">Sign up success you may now <a href="/login">login</a></div>` + document.querySelector('.signup-form').innerHTML;
    }).fail((data) => {
        document.querySelector('.signup-form').innerHTML = `<div class="error">${data.responseJSON}</div>` + document.querySelector('.signup-form').innerHTML;
    })
}

function login(e){
    e.preventDefault();
    let username = e.target.querySelector('#username').value;
    let password = e.target.querySelector('#password').value;
    let query = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    $.post('/users/login/', query, (data) => {
        window.location.href = '/'
    }).fail((data) => {
        document.querySelector('.login-form').innerHTML = `<div class="error">${data.responseJSON}</div>` + document.querySelector('.login-form').innerHTML;
    })
}

function signout(){
    window.location.href = '/user/signout/';
}