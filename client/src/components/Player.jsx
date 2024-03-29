import { useEffect, useState, useRef } from "react";
import style from "./style.module.css";
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import Dropzone from "./Dropzone";
import Cookies from "universal-cookie";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cookies = new Cookies();

var timer = null;

const sendFile = (file, name, token) => {
    return new Promise(async(resolve, reject) => {
        const resp = await fetch("/api/convert/", {
            method: "POST",
            body: JSON.stringify({ "content": file, "fileName": name, "token": token }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        const data = await resp.json();
        resolve(data);
    })
}


const Waveform = ({ amps, toggle, audio, setToggle, timestamps, setTimestamps, left, setLeft }) => {
    const [limit, setLimit] = useState(0);
    const [allWaves, setAllWaves] = useState(0);
    const [time, setTime] = useState(0);
    let currEle = useRef(null);

    const handleClick = async(e) => {
        setToggle("paused");
        audio.current.pause();
        var ind = [...allWaves].indexOf(e.target);
        var amp = e.target.childNodes[0];
        if (ind === -1) {
            ind = [...allWaves].indexOf(e.target.parentElement);
            amp = e.target;
        }
        if (ind !== -1) {
            setTime(ind * 0.5);
            amp.style.backgroundColor = "#b578fa";
        }
    }

    useEffect(() => {
        setTimestamps({ ...timestamps, [time]: {} });
    }, [time])

    useEffect(() => {
        setAllWaves(document.querySelectorAll(`.${style.waveCont}`));
    }, [])

    const customScroller = (e) => {
        e.preventDefault();
        if (toggle === "playing") {
            setToggle("paused");
            audio.current.pause();
        }
        if (left <= 500 && left >= limit) {
            setLeft(left - Math.sign(e.deltaY) * 10);
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
        if (toggle === "playing") {
            audio.current.currentTime = (-left + 500) / 20;
        }
    }, [toggle]);
    
    useEffect(() => {
        if (toggle === "playing") {
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
                <div key={ind} className={ style.waveCont } style={{ padding: "0px 5px 0px 0px" }}><div className={ style.wave } style={{ height: `${i}px`, backgroundColor: timestamps[ind / 2] ? "#b578fa" : "" }}></div></div>
            )}
        </div>
    )
}

const Scroller = ({ amps, toggle, audio, setToggle, timestamps, setTimestamps, left, setLeft }) => {
    return (
        <div className={ style.container }>
            <span className={ style.marker }></span>
            <Waveform amps={ amps } toggle={ toggle } audio={ audio } setToggle={ setToggle } timestamps={ timestamps } setTimestamps={ setTimestamps } left={ left } setLeft={ setLeft } />
        </div>
    )
}

const CustomAudio = ({ file, toggle, setToggle, amps, timestamps, setTimestamps, setFile, fileName }) => {
    const [audio, setAudio] = useState(useRef(new Audio(`/media/${fileName}`)));
    const [left, setLeft] = useState(500);
    const [selectedTime, setSelectedTime] = useState(false);

    useEffect(() => {
        audio.current.load();
        setTimestamps({});
    }, [])

    const updateState = () => {
        if (toggle === "paused") {
            audio.current.play();
            setToggle("playing");
        }else if (toggle === "playing") {
            audio.current.pause();
            setToggle("paused");
        }
    };

    const handleDelete = (e) => {
        let allStamp = { ...timestamps }
        var ts = e.target.parentElement.parentElement.getAttribute("value");
        if (ts === selectedTime) {
            setSelectedTime(false);
        }
        document.getElementById("custom-slider").childNodes[ts * 2].childNodes[0].style.backgroundColor = "";
        delete allStamp[ts];
        setTimestamps(allStamp);
    }

    const handleUpload = () => {
        setFile(0);
        audio.current.pause();
    }

    const slideToCurrent = (e) => {
        let allStamp = { ...timestamps };
        var val = e.target.parentElement.parentElement.getAttribute("value");
        setToggle("paused");
        audio.current.pause();
        setLeft(-e.target.parentElement.getAttribute("value") * 20 + 500);
        document.getElementById("annotationPlace").value = allStamp[val]["annotation"]
    }

    const handleAddAnnotation = (e) => {
        let allStamp = { ...timestamps }
        var val = e.target.parentElement.parentElement.getAttribute("value");
        document.getElementById("annotationPlace").value = allStamp[val]["annotation"];
        setSelectedTime(val)
    }

    const addTag = (e) => {
        let allStamp = { ...timestamps }
        allStamp[e.target.parentElement.getAttribute("value")]["tag"] = e.target.value;
        allStamp[e.target.parentElement.getAttribute("value")]["annotation"] = "";
        setTimestamps(allStamp)
    }

    const addAnnotation = (e) => {
        let allStamp = { ...timestamps }
        let key = e.target.parentElement.getAttribute("value")
        if (allStamp[key] != undefined) {
            allStamp[key]["annotation"] = document.getElementById("annotationPlace").innerHTML;
            setTimestamps(allStamp);
            toast.success("Done!");
        } else {
            toast.error("Please select the time first!")
        }
    }

    const handleExport = () => {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(timestamps));
        const anchor = document.createElement('a');
        anchor.href = dataStr;
        anchor.download = "timestamps_"+ fileName +".json";
        document.body.appendChild(anchor);
        anchor.click();
    }

    const handleImport = (e) => {
        const f = e.target.files[0];

        if (f) {
            var reader = new FileReader();
            reader.readAsText(f, "UTF-8");
            reader.onload = (evt) => {
                try {
                    setTimestamps(JSON.parse(evt.target.result));
                } catch (e) {
                    toast.error("Not a valid JSON file");
                }
            }
            reader.onerror = () => {
                toast.error("Unable to open file");
            }
        }
    }

    return (
        <>
            <div>{new Date((500 - left) * 50).toISOString().slice(11, 19)}</div>
            <div className={ style.container }>
                <Scroller amps={ amps } toggle={ toggle } audio={ audio } setToggle={ setToggle } timestamps={ timestamps } setTimestamps={ setTimestamps } left={ left } setLeft= { setLeft } />
            </div>
            <div className={ style.toggle } onClick={ updateState }>
                { toggle === "playing" ? <PauseRoundedIcon sx={{ fontSize: "40px", color: "rgb(90, 90, 90)", cursor: "pointer" }} /> : <PlayArrowRoundedIcon sx={{ fontSize: "40px", color: "rgb(90, 90, 90)", cursor: "pointer" }} /> }
            </div>
            <div id="annotations" className={ style.annotations }>
                <div id="tags-box" className={ style.tagsBox }>
                    <p>TAGS</p>
                    <hr style={{ width: "95%" }}></hr>
                    <div id="tags-container" className={ style.cont }>
                        { Object.keys(timestamps).map((key, ind) => 
                            <div key={ ind } value={ key } className={ style.tag }>
                                <div onClick={ slideToCurrent } className={ style.timestamp }>{ new Date(key * 1000).toISOString().slice(11, 19) }</div>
                                <input value={ timestamps[key].tag } placeholder="Enter tag" className={ style.tagInp } onChange={ addTag }></input>
                                <button className={ style.delBtn }><img onClick={ handleDelete } src="https://cdn-icons-png.flaticon.com/128/1632/1632602.png" width="25px"></img></button>
                                <button className={ style.delBtn }><img onClick={ handleAddAnnotation } src="https://cdn-icons-png.flaticon.com/512/752/752326.png" width="25px"></img></button>
                            </div>
                        ) }
                    </div>
                </div>
                <div id="annotation-box" className={ style.annotationBox }>
                    <p>ANNOTATIONS</p>
                    <hr style={{ width: "95%" }}></hr>
                    <div id="annotation-container" value={ selectedTime } className={ style.cont } style={{ padding: "10px 10px 10px 10px" }}>
                        <p className={ style.annoTime }>{ selectedTime ? new Date(selectedTime * 1000).toISOString().slice(11, 19) : "No time selected" }</p>
                        <div id="annotationPlace" className={ style.annotationArea } contentEditable>{timestamps[selectedTime] ? timestamps[selectedTime].annotation : ""}</div>
                        <button className={ style.putAnnotation } onClick={ addAnnotation }>Save Tag & Annotation</button>
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
                <button onClick={ handleExport } id="exportBtn" className={ style.navBtn }>Export JSON</button>
                <button onClick={ handleUpload } className={ style.navBtn }>Load another</button>
                <input onChange={ handleImport } type="file" id="selectedFile" style={{ display: "none" }}></input>
                <button onClick={ () => { document.getElementById("selectedFile").click(); } } className={ style.navBtn }>Import JSON</button>
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
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        fetch("/api/verify/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "omit",
            body: JSON.stringify({ token: cookies.get("session_") })
        }).then((resp) => {
            return resp.json()
        }).then((jsonResp) => {
            setIsAuthorized(jsonResp.msg)
        })
    }, [])

    return (
        <>
        <ToastContainer></ToastContainer>
        { isAuthorized ?
        <div className={ style.player }>
            { file ? <CustomAudio toggle={ toggle } setToggle={ setToggle } amps={ amps } file={ file } timestamps={ timestamps } setTimestamps={ setTimestamps } setFile={ setFile } fileName={ fileName } /> : <Dropzone file={ file } setAmps={ setAmps } setFileName={ setFileName } setFile={ setFile } sendFile={ sendFile } accept={ "uploads/*" } /> }
        </div> : <div> Not Authorized </div> }
        </>
        )
}