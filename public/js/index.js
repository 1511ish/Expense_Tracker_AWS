
const tbody = document.getElementById('tbody');
var expensefile_ul = document.getElementById('expensefile_list');
var premiumContainer = document.getElementById('premiumContainer');
var addExpense_btn = document.getElementById('add');
let errDiv = document.getElementById('err_div');
let expence_amount = document.getElementById('amount');
let description = document.getElementById('description');
const buyPremium_btn = document.getElementById('rzp-button1');
const logOut_btn = document.getElementById('log_out');
const show_leaderboard_btn = document.getElementById('show_leaderboard');
const download_btn = document.getElementById('download_btn')
let pagination = document.getElementById('pagination');
const report = document.getElementById('report');
const token = localStorage.getItem('token');

addExpense_btn.addEventListener('click', addExpense);
buyPremium_btn.addEventListener('click', buyPremium);
show_leaderboard_btn.addEventListener('click', showLeaderBoard)
if (download_btn) {
    download_btn.addEventListener('click', download);
}
logOut_btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.replace("home");
    localStorage.removeItem('token');
})

function showPremiumUserMessage() {
    const buyPremium_btn = document.getElementById('rzp-button1');
    buyPremium_btn.innerHTML = "You are a Premium user.<span class='fa-solid fa-crown crown_icon'></span>";

    buyPremium_btn.classList.add('URP');
    buyPremium_btn.removeAttribute('id');
}


function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token')
    if (token) {
        const decodeToken = parseJwt(token);
        const isPremiumUser = decodeToken.isPremium;
        if (isPremiumUser) {
            showPremiumUserMessage();
        }
        getExpenses(1);
    } else {
        window.alert("You have to login first to get this page.");
        window.location.href = "../home";
    }

    // axios.get('http://localhost:3000/user/get-downlodedFileUrls', { headers: { 'Authorization': token } })
    //     .then(response => {
    //         console.log(response.data.fileURL);
    //         for (var i = 0; i < response.data.fileURL.length; i++) {
    //             showDownloadedFile(response.data.fileURL[i], i + 1)
    //         }
    //     })
    //     .catch(err => console.log(err));
})


function showPagination({ currentPage, hasNextPage, nextPage, hasPreviousPage, previousPage, lastPage }) {
    pagination.innerHTML = '';

    if (hasPreviousPage) {
        const btn2 = document.createElement('button');
        btn2.innerHTML = previousPage;
        btn2.addEventListener('click', () => getExpenses(previousPage));
        pagination.appendChild(btn2);
    }
    const btn1 = document.createElement('button');

    btn1.innerHTML = `${currentPage}`
    btn1.style.fontSize = '120%';
    btn1.style.cursor = 'not-allowed';

    pagination.appendChild(btn1);

    if (hasNextPage) {
        console.log(hasNextPage);
        const btn3 = document.createElement('button');
        btn3.innerHTML = nextPage;
        btn3.addEventListener('click', () => getExpenses(nextPage))
        pagination.appendChild(btn3);
    }
}


function listExpenses(allExpense) {
    for (var i = 0; i < allExpense.length; i++) {
        showDataOnScreen(allExpense[i])
    }
}


function reverseString(str) {
    // Step 1. Use the split() method to return a new array
    var splitString = str.split("-"); // var splitString = "hello".split("");
    // ["h", "e", "l", "l", "o"]

    // Step 2. Use the reverse() method to reverse the new created array
    var reverseArray = splitString.reverse(); // var reverseArray = ["h", "e", "l", "l", "o"].reverse();
    // ["o", "l", "l", "e", "h"]

    // Step 3. Use the join() method to join all elements of the array into a string
    var joinArray = reverseArray.join("-"); // var joinArray = ["o", "l", "l", "e", "h"].join("");
    // "olleh"

    //Step 4. Return the reversed string
    return joinArray; // "olleh"
}


function showDataOnScreen(expense) {
    var row = tbody.insertRow();
    row.id = `${expense.id}`;
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    if (expense.date === undefined) {
        let string = `${expense.updatedAt}`;
        string = string.substring(0, 10);
        let reverse_str = reverseString(string);
        cell1.innerHTML = `${reverse_str}`;
    } else {
        cell1.innerHTML = `${expense.date}`;
    }
    cell2.innerHTML = `${expense.expense_amount}`;
    cell3.innerHTML = `${expense.description}`;
    cell4.innerHTML = `${expense.category}`;

    var deleteButton = document.createElement("button");
    var editButton = document.createElement("button");

    deleteButton.className = 'delete_btn';
    editButton.className = 'edit_btn';
    deleteButton.innerHTML = "Delete<li class='fa-solid fa-trash-can'></li>";
    editButton.innerHTML = "Edit<li class='fa-solid fa-pen'></li>";
    editButton.onclick = () => {
        editExpense(`${expense.id}`, `${expense.expense_amount}`, `${expense.description}`, `${expense.category}`)
        tbody.removeChild(document.getElementById(`${expense.id}`));
    }
    deleteButton.onclick = () => {
        deleteExpense(`${expense.id}`);
        tbody.removeChild(document.getElementById(`${expense.id}`));
    }

    cell5.appendChild(editButton);
    cell5.appendChild(deleteButton);
}


function addExpense(e) {
    e.preventDefault();
    const ind = document.getElementById('options').selectedIndex;
    let category = document.getElementsByClassName("category")[ind];

    const newExpense = {
        amount: expence_amount.value,
        description: description.value,
        category: category.value,
    }

    axios.post('expense/add-expense', newExpense, { headers: { 'Authorization': token } })
        .then(response => {
            showDataOnScreen(response.data.newExpenseDetail);
            expence_amount.value = '';
            description.value = '';
        })
        .catch(err => {
            errDiv.innerHTML = errDiv.innerHTML + `<h4 color:'red'>PLEASE FILL ALL FEILDS</h4>`
            console.log(err)
        });

}


function getExpenses(page) {
    let itemsPerPage = 1;
    if (localStorage.getItem('rowPerPage')) {
        itemsPerPage = localStorage.getItem('rowPerPage');
    }
    // ul.innerHTML = '';
    tbody.innerHTML = '';
    axios.get(`expense/get-expenses?page=${page}&pageSize=${itemsPerPage}`, { headers: { 'Authorization': token } })
        .then(({ data: { allExpenses, ...pageData } }) => {
            listExpenses(allExpenses);
            showPagination(pageData);
        })
}


function deleteExpense(expenseId) {
    axios.delete(`expense/delete-expense/${expenseId}`, { headers: { 'Authorization': token } })
        .then((response) => {
            removeExpensefromScreen(expenseId);
        })
        .catch((err) => {
            console.log(err);
        })

    event.preventDefault();
}


function editExpense(expenseId, amount, desc, cate) {
    expence_amount.value = amount;
    description.value = desc;
    deleteExpense(expenseId);
}


function removeExpensefromScreen(expenseId) {
    const childNodeToBeDeleted = document.getElementById(expenseId);
    if (childNodeToBeDeleted)
        ul.removeChild(childNodeToBeDeleted);
}


async function buyPremium(e) {
    e.preventDefault();
    const response = await axios.get('purchase/premiummembership', { headers: { "Authorization": token } })
    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response) {
            const res = await axios.post('purchase/updatetransactionstatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id
            }, { headers: { "Authorization": token } })

            alert('you are a Premimum user now.');
            localStorage.setItem('token', res.data.token);
            showPremiumUserMessage();
        }
    };

    const rzpl = new Razorpay(options);
    rzpl.open();
    rzpl.on('payment.failed', function (response) {
        console.log(response);
        axios.post('purchase/updatefailedtransactionstatus', {
            order_id: options.order_id,
            //payment_id: response.razorpay_payment_id,
        }, { headers: { "Authorization": token } })
        alert('Something went wrong');
    })
}


async function showLeaderBoard() {
    const token = localStorage.getItem('token')
    const decodeToken = parseJwt(token);
    console.log(decodeToken);
    const isPremiumUser = decodeToken.isPremium;
    if (isPremiumUser)
        window.location.href = "premium/leaderboard";
    else {
        window.alert("You have to buy premiumship to unlock this feature.");
    }
    // document.getElementById('leaderboard').style.visibility = 'visible';

    // premiumContainer.innerHTML = '';
    // const token = localStorage.getItem('token');
    // const response = await axios.get('http://localhost:3000/premium/showLeaderBoard', { headers: { "Authorization": token } })
    // const arr = response.data;
    // arr.forEach(element => {
    //     const li = document.createElement('li');
    //     li.innerHTML = `Name- ${element.name} - Totalexpense - ${element.totalExpense}`;
    //     premiumContainer.appendChild(li);
    //     console.log(element)
    // });
}


function updateRowsPerPage() {
    const index = document.getElementById('rowsPerPage').selectedIndex;
    const rowsPerPage = document.getElementsByClassName('rows')[index].value;
    localStorage.setItem('rowPerPage', rowsPerPage);
    getExpenses(1);
}






// test.html wseuper bhi h kafi khuch

report.addEventListener('click', () => {
    const token = localStorage.getItem('token')

    const decodeToken = parseJwt(token);
    console.log(decodeToken);
    const isPremiumUser = decodeToken.isPremium;
    if (isPremiumUser)
        window.location.href = "premium/report";
    else {
        window.alert("You have to buy premiumship to unlock this feature.");
    }
})
