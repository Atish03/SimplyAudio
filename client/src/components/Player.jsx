import { useEffect, useState, useRef, useCallback } from "react";
import style from "./style.module.css";
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import Dropzone from "./Dropzone";


var timer = null;

const sendFile = (file) => {
    return new Promise(async(resolve, reject) => {
        const resp = await fetch("http://localhost:8000/convert/", {
            method: "POST",
            body: JSON.stringify(file),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        const data = await resp.json();
        resolve(data);
    })
}


const Waveform = ({ amps, toggle, audio, setToggle }) => {
    const [left, setLeft] = useState(500);
    const [limit, setLimit] = useState(0);
    let currEle = useRef(null);
    var lastFrame = +new Date;

    useEffect(() => {
        setLimit(-(currEle.current.getBoundingClientRect().width - 500));

        currEle.current.addEventListener("wheel", (e) => {
            e.preventDefault();

            if (toggle == "playing") {
                setToggle("paused");
                audio.current.pause();
            }
            if (left <= 500 && left >= limit) {
                setLeft(left - Math.sign(e.deltaX) * 10);
            }
        })

        if (left <= limit) {
            setLeft(limit);
        }
        if (left >= 500) {
            setLeft(500);
        }

    }, [currEle, left, audio])

    useEffect(() => {
        if (toggle == "playing") {
            audio.current.currentTime = (-left + 505) / 20;
        }
    }, [toggle]);
    
    useEffect(() => {
        if (toggle == "playing") {
            timer = setInterval(() => {
                if (left >= limit) {
                    var now = +new Date, deltaT = now - lastFrame;
                    lastFrame = now;
                    return setLeft(left - 0.2 * deltaT / 10);
                }else {
                    clearInterval(timer);
                }
            }, 10);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [toggle, limit, left])

    return (
        <div id="custom-slider" className={ style.slider } style={{ transform: `translateX(${left}px)` }} ref={ el => { currEle.current = el } }>
            { amps.map((i, ind) =>
                <div key={ind} className={ style.wave } style={{ height: `${i}px` }}></div>
            )}
        </div>
    )
}

const Scroller = ({ amps, toggle, audio, setToggle}) => {
    return (
        <div className={ style.container }>
            <span className={ style.marker }></span>
            <Waveform amps={ amps } toggle={ toggle } audio={ audio } setToggle={ setToggle } />
        </div>
    )
}

const CustomAudio = ({ file, toggle, setToggle, amps }) => {
    var audio = useRef(new Audio(require("../uploads/current.wav")));

    useEffect(() => {
        audio.current = new Audio(require("../uploads/current.wav"));
    }, [file]);

    useEffect(() => {
        audio.current.load();
    }, [audio])

    const updateState = () => {
        if (toggle == "paused") {
            audio.current.play();
            setToggle("playing");
        }else if (toggle == "playing") {
            audio.current.pause();
            setToggle("paused");
        }
    };

    return (
        <>
            <div className={ style.container }>
                { file ? <Scroller amps={ amps } toggle={ toggle } audio={ audio } setToggle={ setToggle } /> : <></> }
            </div>
            {file ? <div className={ style.toggle } onClick={ updateState }>
                { toggle == "playing" ? <PauseRoundedIcon sx={{ fontSize: "40px", color: "rgb(90, 90, 90)" }} /> : <PlayArrowRoundedIcon sx={{ fontSize: "40px", color: "rgb(90, 90, 90)" }} /> }
            </div> : <></> }
        </>
    )
}

export default function Player() {
    const [toggle, setToggle] = useState("paused");
    const [file, setFile] = useState(0);
    const [amps, setAmps] = useState([0]);
    const [fileName, setFileName] = useState(file);

    const onDrop = useCallback(async(acceptedFiles) => {
        const reader = new FileReader();
        let resp;

        reader.onload = async(e) => {
            resp = await sendFile(e.target.result);
            setAmps(resp.amps);
            setFileName(resp.fileName);
            setFile(1);
        }

        reader.readAsDataURL(acceptedFiles[0]);
    }, []);

    return (
        <div className={ style.player }>
            { file ? <CustomAudio toggle={ toggle } setToggle = { setToggle } amps={ amps } file={ file } /> : <Dropzone onDrop={ onDrop } accept={ "uploads/*" } /> }
        </div>
        )
}