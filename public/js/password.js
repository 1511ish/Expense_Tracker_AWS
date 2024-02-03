const submit_btn = document.getElementById("signup_btn");
submit_btn.addEventListener('click', resetPassword);

async function resetPassword(e) {
    e.preventDefault();
    const emailObj = {
        email: document.getElementById('email').value
    }
    const response = await axios.post('password/forgotpassword', emailObj);

    alert('rest password link successfully send on your email id.');
}