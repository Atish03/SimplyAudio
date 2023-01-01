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
    const [allWaves, setAllWaves] = useState(0);
    const [time, setTime] = useState(0);
    const [currTime, setCurrTime] = useState(audio.current.currentTime);
    let currEle = useRef(null);
    var lastFrame = +new Date;

    const handleClick = async(e) => {
        setToggle("paused");
        audio.current.pause();
        var ind = [...allWaves].indexOf(e.target);
        if (ind == -1) {
            ind = [...allWaves].indexOf(e.target.parentElement);
        }
        setTime(ind * 0.5);
    }

    useEffect(() => {
        console.log(time);
    }, [time])

    useEffect(() => {
        setAllWaves(document.querySelectorAll(`.${style.waveCont}`));
    }, [])

    useEffect(() => {
        setLimit(-(currEle.current.getBoundingClientRect().width - 505));

        currEle.current.addEventListener("wheel", (e) => {
            if (toggle == "playing") {
                setToggle("paused");
                audio.current.pause();
            }
            if (left <= 500 && left >= limit) {
                setLeft(left - Math.sign(e.deltaX) * 10);
            }
        })

        if (left <= limit) {
            audio.current.pause();
            setToggle("paused");
            setLeft(limit);
        }
        if (left >= 500) {
            audio.current.pause();
            setToggle("paused");
            setLeft(500);
        }

    }, [currEle, left, audio])

    useEffect(() => {
        if (toggle == "playing") {
            audio.current.currentTime = (-left + 500) / 20;
        }
    }, [toggle]);
    
    useEffect(() => {
        if (toggle == "playing") {
            timer = setInterval(() => {
                setLeft(-audio.current.currentTime * 20 + 500);
            }, 10);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [toggle, left])

    return (
        <div id="custom-slider" className={ style.slider } style={{ transform: `translateX(${left}px)` }} ref={ el => { currEle.current = el }} onClick={ handleClick }>
            { amps.map((i, ind) =>
                <div key={ind} className={ style.waveCont } style={{ padding: "0px 5px 0px 0px" }}><div className={ style.wave } style={{ height: `${i}px` }}></div></div>
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

    return (
        <div className={ style.player }>
            { file ? <CustomAudio toggle={ toggle } setToggle = { setToggle } amps={ amps } file={ file } /> : <Dropzone setAmps={ setAmps } setFileName={ setFileName } setFile={ setFile } sendFile={ sendFile } accept={ "uploads/*" } /> }
        </div>
        )
}