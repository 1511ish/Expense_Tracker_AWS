var premiumContainer = document.getElementById('premiumContainer');
const show_leaderboard_btn = document.getElementById('show_leaderboard');
const tbody = document.getElementById('tbody');

const report = document.getElementById('report');
const home = document.getElementById('home');
const logOut_btn = document.getElementById('log_out');

showLeaderBoard();
async function showLeaderBoard() {
    const token = localStorage.getItem('token');
    if(token==null){
        window.alert("you have to login first to get the functionality.");
        window.location.href = "../home";
    }
    const response = await axios.get('showLeaderBoard', { headers: { "Authorization": token } })
    const arr = response.data;
    let i = 0
    arr.forEach(element => {
        var row = tbody.insertRow();

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        i++;

        if (i == 1) {
            cell1.innerHTML = '<img src="/images/golden.png" alt="golden madel" class="png">';
        }
        if (i == 2) {
            cell1.innerHTML = '<img src="/images/silver.png" alt="golden madel" class="png">';
        }
        if (i == 3) {
            cell1.innerHTML = '<img src="/images/bronz.png" alt="golden madel" class="png">';
        }
        cell1.innerHTML += `${i}`;
        cell2.innerHTML += `${element.name}`;
        cell3.innerHTML += `${element.totalExpense}`;
    });

}

report.addEventListener('click', () => {
    window.location.href = "report";
})

home.addEventListener('click', () => {
    window.location.href = '../user';
})

logOut_btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = "../home";
    localStorage.removeItem('token');
})
document.getElementById('rzp-button1').style.background = '#fff';
document.getElementById('rzp-button1').style.color = 'rgb(39, 47, 62)';
document.getElementById('rzp-button1').innerHTML = "You are a Premium user.<span class='fa-solid fa-crown crown_icon'></span>"
