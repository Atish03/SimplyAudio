import Cookies from "universal-cookie";
import style from "./style.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from "react";

const cookies = new Cookies();

const registerUser = () => {
    const body = { username: document.getElementsByName("username")[0].value, password: document.getElementsByName("password")[0].value };

    return new Promise(async(resolve, reject) => {
        const resp = await fetch("/api/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': cookies.get("csrftoken"),
            },
            credentials: "same-origin",
            body: JSON.stringify(body),
        })
        const jsonData = await resp.json();
        if (jsonData.msg === "success") {
            cookies.set("session_", jsonData.token)
            window.location.href = "/player";
            resolve();
        } else {
            reject();
        }
    })
}

const handleSubmit = () => {
    toast.promise(
        registerUser,
        {
            pending: 'Adding you to our database!',
            success: 'Welcome',
            error: 'User already exists'
        }
    )
}

const RegisterForm = () => {
    const [passwd, setPasswd] = useState("");
    const [conPasswd, setConPasswd] = useState("");
    const [allowSubmit, setAllowSubmit] = useState(false)

    const handleUpdatePass = () => {
        let password = document.getElementsByName("password")[0].value;
        setPasswd(password);
    }

    const handleUpdateConPass = () => {
        let password = document.getElementsByName("confirmPassword")[0].value;
        setConPasswd(password);
    }

    useEffect(() => {
        if (passwd === "" || passwd !== conPasswd) {
            setAllowSubmit(false);
        } else {
            setAllowSubmit(true);
        }
    }, [passwd, conPasswd])

    return (
        <>
        <div className={ style.logo }></div>
        <div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center", "width": "minContent" }}>
            <div className={ style.registerBack }></div>
            <div className={ style.customForm }>
                <p className={ style.formTitle }>Register</p>
                <div className={ style.formContent }>
                    <input className={ style.formInput } name="username" type="text" placeholder="Username" autoComplete="off"></input>
                    <input className={ style.formInput } name="password" type="password" placeholder="Password" onChange={ handleUpdatePass }></input>
                    <input className={ style.formInput } name="confirmPassword" type="password" placeholder="Confirm Password" onChange={ handleUpdateConPass }></input>
                    <div style={{ "display": "flex" ,"gap": "10px", "alignItems": "center", "marginTop": "15px" }}>
                    <button className={ style.formButton } style={ allowSubmit ? { 'backgroundImage': '' } : { 'backgroundImage': 'linear-gradient(45deg, #d1d1d1, #9c9a9a)' } } onClick={ allowSubmit ? handleSubmit : null }>Get in</button>
                    <a href="/login">I already have an account</a>
                    </div>
                </div>
            </div>
        </div>
        <ToastContainer />
        </>
    )
}

export default RegisterForm;