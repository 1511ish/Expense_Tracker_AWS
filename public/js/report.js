const daily_show = document.getElementById('daily_btn');
const daily_tbody = document.getElementById('daily_tbody');

const daily_date = document.getElementById('daily_date');
const monthly_date = document.getElementById('monthly_date');

const monthly_show = document.getElementById('monthly_btn');
const monthly_tbody = document.getElementById('monthly_tbody');

const show_leaderboard = document.getElementById('show_leaderboard');
const home = document.getElementById('home');
const token = localStorage.getItem('token');
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function listExpenses(allExpenses, tbody) {
    tbody.innerHTML = '';
    allExpenses.forEach(expense => {
        var row = tbody.insertRow();

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);

        cell1.innerHTML = `${expense.date}`;
        cell2.innerHTML = `${expense.category}`;
        cell3.innerHTML = `${expense.description}`;
        cell4.innerHTML = `${expense.expense_amount}`;
    });
}
const RDRC = document.getElementById('RDRC');
const RDR_ul = document.getElementById('RDR');

function showDownloadedFile(obj, file_no) {
    let li = document.createElement('li');
    li.className = 'li';
    li.innerHTML = `<li><a href= ${obj.fileUrl}>Expense file ${file_no}</a></li>`;;
    RDR_ul.appendChild(li);
    // expensefile_ul.innerHTML = expensefile_ul.innerHTML + `<li><a href= ${obj.fileUrl}>Expense file ${file_no}</a></li>`;
}

function listTotal(total, tbody, date) {
    var row = tbody.insertRow();
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    cell1.innerHTML = `<button class='download_btn' id=${date}>Recently downloaded report</button>`;
    const RD_btn = document.getElementById(`${date}`);
    RD_btn.addEventListener('click', () => {
        axios.get('get-downlodedFileUrls', { headers: { 'Authorization': token } })
            .then(response => {
                RDR_ul.innerHTML = ``;
                RDR_ul.innerHTML = '<i class="fa-solid fa-xmark" id="close"></i>';
                RDRC.style.zIndex = "2";
                document.getElementById('close').addEventListener('click', () => { RDRC.style.zIndex = "-1"; })
                for (var i = 0; i < response.data.fileURL.length; i++) {
                    showDownloadedFile(response.data.fileURL[i], i + 1)
                }
            })
            .catch(err => console.log(err));
    })
    let download_btn;
    if (date.length == 10) {
        cell2.innerHTML = '<button class="download_btn" id="DD_btn"><i class="fa-solid fa-download"></i>Download report</button>'
        download_btn = document.getElementById('DD_btn');
    } else {
        cell2.innerHTML = '<button class="download_btn" id="MD_btn"><i class="fa-solid fa-download"></i> Download report</button>'
        download_btn = document.getElementById('MD_btn');
    }

    cell3.innerHTML = `<b>Total:</b>`;
    cell4.innerHTML = `<b>${total}</b>`;

    download_btn.addEventListener('click', function (e) { download(e, date) });
}

daily_show.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);
    const date = daily_date.value;
    axios.get(`dailyReport/${date}`, { headers: { 'Authorization': token } })
        .then(({ data: { allExpenses, total } }) => {
            listExpenses(allExpenses, daily_tbody);
            listTotal(total, daily_tbody, date);
        })
})

monthly_show.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    const date = monthly_date.value;
    axios.get(`monthlyReport/${date}`, { headers: { 'Authorization': token } })
        .then(({ data: { allExpenses, total } }) => {
            listExpenses(allExpenses, monthly_tbody);
            listTotal(total, monthly_tbody, date);
        })
})

show_leaderboard.addEventListener('click', () => {
    // window.location.replace("leaderboard.html");
    window.location.href("leaderboard");
    console.log("cahl toh raha..hjgujg");
})

home.addEventListener('click', () => {
    window.location.href('../user');
})

document.getElementById('rzp-button1').style.background = '#fff';
document.getElementById('rzp-button1').style.color = 'rgb(39, 47, 62)';
document.getElementById('rzp-button1').innerHTML = "You are a Premium user.<span class='fa-solid fa-crown crown_icon'></span>"

document.getElementById('log_out').addEventListener('click', () => {
    window.location.href("../home");
    localStorage.removeItem('token');
})


function download(e, date) {
    e.preventDefault();
    axios.get(`download/${date}`, { headers: { "Authorization": token } })
        .then((res) => {
            if (res.status) {
                var a = document.createElement('a');
                a.href = res.data.fileUrl;
                // a.download = 'myexpense.cvs';
                a.click();
                // showDownloadedFile(res.data)
            } else {
                throw new Error(res.data.message);
            }
        })
        .catch((err) => {
            console.log(err);
        })
}