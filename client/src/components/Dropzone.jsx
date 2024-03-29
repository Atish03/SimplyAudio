import { useDropzone } from "react-dropzone";
import style from "./style.module.css";
import thisOrThat from "../assets/this-or-that.png";
import Cookies from "universal-cookie";
import Library from "./Library";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cookies = new Cookies();

export default function Dropzone({ file, onDrop, accept, open, setFile, setAmps, setFileName, sendFile }) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ accept, onDrop });

  const handleSubmit = () => {
    const reader = new FileReader();
    let resp;

    reader.onload = async(e) => {
        resp = await toast.promise(sendFile(e.target.result, acceptedFiles[acceptedFiles.length - 1].path, cookies.get("session_")), {
          "success": "File uploaded successfully",
          "error": "Some error occured, please try again!",
          "pending": "Uploading your file, please wait..."
        });
        setAmps(resp.amps);
        setFileName(resp.fileName);
        setFile(1);
    }

    reader.readAsDataURL(acceptedFiles[acceptedFiles.length - 1]);
  }

  return (
    <>
    <ToastContainer></ToastContainer>
    <Library file={ file } setAmps={ setAmps } setFileName={ setFileName } setFile={ setFile }></Library>
    <div className={ style.inpZone }>
      <input placeholder="Enter URL to video" className={ style.urlBox }></input>
      <img src={ thisOrThat } height="70px" style={{ margin: "20px" }}></img>
      <div {...getRootProps({ className: `dropzone ${style.dropBox}` })}>
        <input className="input-zone" {...getInputProps()} />
        <div className={ `text-center` }>
          { acceptedFiles[0] == undefined ? (<>{isDragActive ? (
            <p className={ `dropzone-content ${ style.dropBoxText }` }>
              Release to drop the files here
            </p>
          ) : (
            <p className={ `dropzone-content ${ style.dropBoxText }` }>
              Drop some files here, or click to select files
            </p>
          )}</>) : <p className={ `dropzone-content ${ style.dropBoxText }` }>{ acceptedFiles[acceptedFiles.length - 1].path }</p> }
        </div>
      </div>
      <button onClick={ handleSubmit } className={ style.subBtn }>Dive in</button>
    </div>
    </>
  );
}