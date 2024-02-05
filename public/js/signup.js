
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const main = document.getElementById('main');
const SignIn = document.getElementById('SignIn');
const SignUp = document.getElementById('SignUp');
SignIn.addEventListener('click', login);
SignUp.addEventListener('click', signup);

signUpButton.addEventListener('click', () => {
    main.classList.add('right-panel-active');
})
signInButton.addEventListener('click', () => {
    main.classList.remove('right-panel-active');
})

async function signup(e) {
    e.preventDefault();

    const name = document.getElementById('signupUsername');
    const email = document.getElementById('signupEmail');
    const password = document.getElementById('signupPassword');
    try {
        const user = {
            name: name.value,
            email: email.value,
            password: password.value
        }
        const response = await axios.post('user/signup', user);
        if (response.status === 201) {
            alert("user signup successfully.");
            // window.location.href =  "./login.html";
            main.classList.remove('right-panel-active');
        } else {
            throw new Error("failed to login");
        }
    } catch (err) {
        const form = document.getElementById('form');
        form.innerHTML += `<div style='color:red ;margin:5px'>${err} <div>`;
        console.log(err);
    }

    name.value = '';
    email.value = '';
    password.value = '';

}

async function login(e) {
    e.preventDefault();
    const email = document.getElementById('signinEmail');
    const password = document.getElementById('signinPassword');
    let response;
    try {
        const loginDetails = {
            email: email.value,
            password: password.value
        }
        response = await axios.post('user/login', loginDetails);

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isPremium', response.data.isPrimium);
        window.alert(response.data.message);
        // window.location.href = './test.html';
        window.location.href = 'user';
    } catch (err) {
        // const body = document.getElementById('body');
        // body.innerHTML += `<div style="color:red;font-weight:600">${err.response.data.message}</div>`;
        console.log(err);
    }
    email.value = '';
    password.value = '';
}

const forgot_password = document.getElementById("forgot_password");
forgot_password.addEventListener('click', resetPassword);

async function resetPassword(e) {
    e.preventDefault();
    const email = document.getElementById('signinEmail');
    
    if (email.value) {
        const emailObj = {
            email: email.value
        }
        const response = await axios.post('password/forgotpassword', emailObj);
        alert(`${response.data.message}`);
    } else {
        window.alert("please fill email input first before press reset password!");
    }
    email.value = '';
}


