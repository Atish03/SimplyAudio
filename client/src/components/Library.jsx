import { useEffect, useState } from "react";
import style from "./style.module.css";

const Library = ({ isSet }) => {
    const [file, setFiles] = useState([]);

    useEffect(() => {
        fetch("/api/getuserlib", {
            credentials: "include",
        }).then((data) => {
            return data.json();
        }).then((jsonData) => {
            setFiles(jsonData.files);
        })
    }, [isSet])

    return (
        file.length != 0 ? <div className={ style.library }>
            <div style={{ width: "100%", display: "flex", justifyContent: "center", fontSize: "20px" }}>MY LIBRARY</div>
            { file.map((n) => <div key={n.id} className={ style.audios }>{n.user_named}</div>) }    
        </div> : <div>Empty Library</div>
    )
}

export default Library;