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


const Waveform = ({ amps, toggle, audio, setToggle, timestamps, setTimestamps }) => {
    const [left, setLeft] = useState(500);
    const [limit, setLimit] = useState(0);
    const [allWaves, setAllWaves] = useState(0);
    const [time, setTime] = useState(0);
    let currEle = useRef(null);

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
        setTimestamps({ ...timestamps, [time]: {} });
    }, [time])

    useEffect(() => {
        setAllWaves(document.querySelectorAll(`.${style.waveCont}`));
    }, [])

    const customScroller = (e) => {
        e.preventDefault();
        if (toggle == "playing") {
            setToggle("paused");
            audio.current.pause();
        }
        if (left <= 500 && left >= limit) {
            setLeft(left - Math.sign(e.deltaX) * 10);
        }
    }

    useEffect(() => {
        setLimit(-(currEle.current.getBoundingClientRect().width - 505));
        currEle.current.onwheel = customScroller;
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
    }, [currEle, left])

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

const Scroller = ({ amps, toggle, audio, setToggle, timestamps, setTimestamps }) => {
    return (
        <div className={ style.container }>
            <span className={ style.marker }></span>
            <Waveform amps={ amps } toggle={ toggle } audio={ audio } setToggle={ setToggle } timestamps={ timestamps } setTimestamps={ setTimestamps } />
        </div>
    )
}

const CustomAudio = ({ file, toggle, setToggle, amps, timestamps, setTimestamps }) => {
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

    const handleDelete = (e) => {
        let allStamp = { ...timestamps }
        delete allStamp[e.target.parentElement.parentElement.getAttribute("value")];
        setTimestamps(allStamp);
    }

    return (
        <>
            <div className={ style.container }>
                <Scroller amps={ amps } toggle={ toggle } audio={ audio } setToggle={ setToggle } timestamps={ timestamps } setTimestamps={ setTimestamps } />
            </div>
            <div className={ style.toggle } onClick={ updateState }>
                { toggle == "playing" ? <PauseRoundedIcon sx={{ fontSize: "40px", color: "rgb(90, 90, 90)", cursor: "pointer" }} /> : <PlayArrowRoundedIcon sx={{ fontSize: "40px", color: "rgb(90, 90, 90)", cursor: "pointer" }} /> }
            </div>
            <div id="annotations" className={ style.annotations }>
                <div id="tags-box" className={ style.tagsBox }>
                    <p>TAGS</p>
                    <hr style={{ width: "100%" }}></hr>
                    <div id="tags-container" className={ style.cont }>
                        { Object.keys(timestamps).map((key, ind) => 
                            <div key={ ind } value={ key } className={ style.tag }>
                                <div className={ style.timestamp }>{ new Date(key * 1000).toISOString().slice(11, 19) }</div>
                                <input placeholder="Enter tag" className={ style.tagInp }></input>
                                <button className={ style.delBtn }><img onClick={ handleDelete } src="https://cdn-icons-png.flaticon.com/512/3699/3699522.png" width="25px"></img></button>
                            </div>
                        ) }
                    </div>
                </div>
                <div id="annotation-box" className={ style.annotationBox }>
                    <p>ANNOTATIONS</p>
                    <hr style={{ width: "100%" }}></hr>
                    <div id="annotation-container" className={ style.cont } style={{ padding: "10px" }}>
                        <textarea className={ style.annotationArea }></textarea>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function Player() {
    const [toggle, setToggle] = useState("paused");
    const [file, setFile] = useState(0);
    const [amps, setAmps] = useState([0]);
    const [fileName, setFileName] = useState(file);
    const [timestamps, setTimestamps] = useState({});

    useEffect(() => {
        console.log(timestamps);
    }, [timestamps]);

    return (
        <div className={ style.player }>
            { file ? <CustomAudio toggle={ toggle } setToggle = { setToggle } amps={ amps } file={ file } timestamps={ timestamps } setTimestamps={ setTimestamps } /> : <Dropzone setAmps={ setAmps } setFileName={ setFileName } setFile={ setFile } sendFile={ sendFile } accept={ "uploads/*" } /> }
        </div>
        )
}