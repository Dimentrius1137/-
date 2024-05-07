'use strict'
const url = "https://5ebbb8e5f2cfeb001697d05c.mockapi.io/users";
const table__container = document.querySelector('.table__container')
const table = document.querySelector('.table');
const table__headers = "<caption><th>Имя пользователя</th><th>E-mail</th><th>Дата регистрации</th><th>Рейтинг</th></caption>"

const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

const searchField = document.getElementById('search');

const ratingSortBtn = document.querySelector('.rating__sort');
const regDateSortBtn = document.querySelector('.registationDate__sort');
const clearSortBtn = document.querySelector('.clear__sort');

const removeBtn = document.querySelectorAll('.remove');
const popup = document.getElementById('popup');
const confirmRemove = document.querySelector('.confirm');
const rejectRemove = document.querySelector('.reject');
//получение данных 
async function GetData(){

        const data = await fetch(url);
        const usersList = await data.json()
        return usersList;
    

}

//Создание таблицы
function CreateCells(args){

    const row = document.createElement('tr');
    row.classList.add('data_row')
    for(let arg in args)
    {
        const cell = document.createElement('td');
        if(arg !== 'id')
        {
            cell.innerHTML = args[arg];
            row.appendChild(cell);  
        }
        if(arg === 'username'){
            cell.style.color = "rgba(12, 180, 241, 1)"
            cell.style.fontWeight = "700"
        }
        if(arg === 'registration_date')
        {
            cell.innerHTML = new Date(args[arg]).toLocaleDateString('ru-RU', {day: 'numeric', month: 'numeric', year: '2-digit'});
        }

    }
    const removeField= document.createElement('td');
    removeField.classList.add('remove')
    const removeBtn = document.createElement('img');
    removeBtn.classList.add('removeBtn')
    removeBtn.src = "icons/cancel.svg";
    removeField.appendChild(removeBtn);
    row.appendChild(removeField);
    table.appendChild(row);     
}

let table__rows = GetData();

//отрисовка таблицы
async function Render(counter){
    const visible__rows = await table__rows;
    for(let i = 0; i < visible__rows.length; i++)
    {
        CreateCells(visible__rows[i]);
    }

    const rows = table.querySelectorAll('.data_row');
    for(let i = 0; i < rows.length; i++)
    {
        rows[i].style.display = "none";
    }

    for(let i = counter; i < counter + 5; i++)
    {
        if(rows[i] === undefined)
        {
            break;
        }
        rows[i].style.display = 'table-row'
    }
}
//альтернативный вариант без создания всех элементов стразу:

// async function Render(counter){
//     const visible__rows = await table__rows;
//     let number = 0;

//     for(let i = counter; i < counter + 5; i++)
//     {
//         CreateCells(visible__rows[i], number++)

//     }
// } 

let count = 0;
Render(count)


//пагинация (переключение страниц)
nextBtn.addEventListener('click', function() {
    prevBtn.disabled = false;
    count+=5;
    if(count > 15)
    {
        this.disabled = true
    }
    table.innerHTML = table__headers
    Render(count)
})

prevBtn.addEventListener('click', function() {
    nextBtn.disabled = false
    count-=5;

    if(count <= 0)
    {
        prevBtn.disabled = true;
    }
    table.innerHTML = table__headers
    Render(count)

})

//поиск
searchField.addEventListener('input', async function() {
    const res = await Search(this.value)
    for(let i = 0; i < res.length; i++)
    {
        CreateCells(res[i]);
    }
    if(this.value == "")
    {
        table.innerHTML = table__headers;
        Render(count)
    }
 
})
async function Search(value){
    const search__rows = await table__rows;
    table.innerHTML = table__headers;

    const searchResult = search__rows.filter((field) => {
        return field.email.toLowerCase().startsWith(value.toLowerCase()) || field.username.toLowerCase().startsWith(value.toLowerCase())    
        
    })

    return searchResult;
}

//Сортировки
//Для сортировки я использовал алгоритм сортировки выборкой
async function Sort(arr, property){
    for(let i = 0; i < arr.length; i++)
    {
        let min = i;
        for(let j = i; j < arr.length; j++)
        {
            if(arr[min][property] > arr[j][property])
            {
                min = j;
            }
        }
        let prev = arr[i];
        arr[i] = arr[min];
        arr[min] = prev;
    }
    return arr;
}
//форматирование дат
function DateSorting(userDate){
    let currentFormatDates = userDate.map((el) => {
        el.registration_date = Number(new Date(el.registration_date).toLocaleDateString().split('.').reverse().join(''));
    return el;     
})

Sort(currentFormatDates, "registration_date")

let sortedByDate = currentFormatDates.map((el) => {
    let sortedEl = el.registration_date.toString().split('');
    const year = sortedEl.toSpliced(4, 4);
    const month = sortedEl.toSpliced(0, 4).toSpliced(2, 2);
    const day = sortedEl.toSpliced(0, 6);

    el.registration_date = year.join('') + "." + month.join('') + "." + day.join('');  
        return el
    })
    return sortedByDate
}

//сортировки по дате 
async function SortDate(){
table.innerHTML = table__headers;
table__rows = DateSorting(await table__rows)
Render(count)
}
async function SortDateReverse(){
table.innerHTML = table__headers;
table__rows = DateSorting(await table__rows).reverse();
Render(count)
}

//сортировки по рейтинг
async function RatingSort() {
let sort__rows = await table__rows;
table.innerHTML = table__headers;
Sort(sort__rows, "rating");
Render(count);
}
async function ReverseRatingSort() {
let sort__rows = await table__rows;
table.innerHTML = table__headers;
const rev = await Sort(sort__rows, "rating");
rev.reverse()
Render(count)
}

//состояние сортировки от меньшего к большему и наоборот
let sortState = false;
function ChangeRatingSort(state1, state2) {
if (!sortState) {
    state1();
} else {
    state2();
}
sortState = !sortState;
}

//переключатели сортировок
ratingSortBtn.addEventListener('click', function() {
regDateSortBtn.style.color = "rgb(158, 170, 180)";
regDateSortBtn.style.borderBottomColor = "rgb(158, 170, 180)";

this.style.color = "rgb(51, 51, 51)"
this.style.borderBottomColor = "rgb(51, 51, 51)"

ChangeRatingSort(RatingSort, ReverseRatingSort);

}) 

regDateSortBtn.addEventListener('click', function() {
ratingSortBtn.style.color = "rgb(158, 170, 180)";
ratingSortBtn.style.borderBottomColor = "rgb(158, 170, 180)";

this.style.color = "rgb(51, 51, 51)";
this.style.borderBottomColor = "rgb(51, 51, 51)"

ChangeRatingSort(SortDate, SortDateReverse)
})

//очистка фильтров
let listWithRemoves;
clearSortBtn.addEventListener('click', async (el) => {
//проверка на наличие удалённых пользователей
if(listWithRemoves != undefined)
{
    table__rows = Sort(await listWithRemoves, "id")
}
else{
    table__rows = GetData();
}
regDateSortBtn.style.color = "rgb(158, 170, 180)";
regDateSortBtn.style.borderBottomColor = "rgb(158, 170, 180)";
ratingSortBtn.style.color = "rgb(158, 170, 180)";
ratingSortBtn.style.borderBottomColor = "rgb(158, 170, 180)";
table.innerHTML = table__headers;
searchField.value = "";
Render(count)
}) 

//удаление пользователя
async function RemoveUser(name){
const newUserList = await table__rows;
for(let i = 0; i < newUserList.length; i++)
{
    if(newUserList[i].username == name)
    {   
        newUserList.splice(i, 1);
    }
}
return newUserList;
}

table.addEventListener('click', (btn) => {
const targetUser = btn.target;
if(targetUser.classList.contains('removeBtn'))
{
    window.popup.showModal();
    confirmRemove.addEventListener('click', () => {
        window.popup.close();
        listWithRemoves = RemoveUser(targetUser.parentElement.parentElement.children[0].innerHTML)
        table.innerHTML = table__headers;
        Render(count)
    })
    rejectRemove.addEventListener('click', () => {
        window.popup.close();
    })


}

})