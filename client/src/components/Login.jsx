import Cookies from "universal-cookie";
import style from "./style.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cookies = new Cookies();

const loginUser = () => {
    const body = { username: document.getElementsByName("username")[0].value, password: document.getElementsByName("password")[0].value };

    return new Promise(async(resolve, reject) => {
        const resp = await fetch("http://localhost:8000/api/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': cookies.get("csrftoken"),
            },
            credentials: "same-origin",
            body: JSON.stringify(body),
        })
        const jsonData = await resp.json();
        if (jsonData.msg == "success") {
            cookies.set("session_", jsonData.token);
            window.location.href = "/player";
            resolve();
        } else {
            reject();
        }
    })
}

const handleSubmit = async() => {
    toast.promise(
        loginUser,
        {
            pending: 'Logging you in',
            success: 'Welcome',
            error: 'Wrong credentials'
        }
    )
}

const LoginForm = () => {
    return (
        <>
        <div className={ style.logo }></div>
        <div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center", "width": "minContent" }}>
            <div className={ style.loginBack }></div>
            <div className={ style.customForm }>
                <p className={ style.formTitle }>Login</p>
                <div className={ style.formContent }>
                    <input className={ style.formInput } name="username" type="text" placeholder="Username" autoComplete="off"></input>
                    <input className={ style.formInput } name="password" type="password" placeholder="Password"></input>
                    <div style={{ "display": "flex" ,"gap": "10px", "alignItems": "center", "marginTop": "15px" }}>
                    <button className={ style.formButton } onClick={ handleSubmit }>Let's go</button>
                    <a href="/register">I don't have an account</a>
                    </div>
                </div>
            </div>
        </div>
        <ToastContainer />
        </>
    )
}

export default LoginForm;