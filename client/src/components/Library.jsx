import { useEffect, useState } from "react";
import style from "./style.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Library = ({ file, setAmps, setFileName, setFile }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetch("/api/getuserlib", {
            credentials: "include",
        }).then((data) => {
            return data.json();
        }).then((jsonData) => {
            setFiles([...jsonData.files]);
        })
    }, [file])

    const loadSong = async (e) => {
        await toast.promise(fetch("/api/getfile/?hash=" + e.target.getAttribute("hash")).then((resp) => {
            return resp.json();
        }).then((data) => {
            setAmps(data.amps);
            setFileName(data.file_name + ".ogg");
            setFile(1);
        }), {
            pending: "Loading file...",
            success: "File loaded successfully",
            error: "Some unexpected error occured"
        });
    }

    return (
        <>
        <ToastContainer></ToastContainer>
        {
        files.length != 0 ? <div className={ style.library }>
            <div style={{ width: "100%", display: "flex", justifyContent: "center", fontSize: "20px" }}>MY LIBRARY</div>
            { files.map((n) => <div onClick={ loadSong } hash={n.hash} key={n.hash} className={ style.audios }>{n.user_named}</div>) }    
        </div> : <div>Empty Library</div>
        }
        </>
    )
}

export default Library;