import { useDropzone } from "react-dropzone";
import style from "./style.module.css";

export default function Dropzone({ onDrop, accept, open }) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ accept, onDrop });
  return (
    <div>
      <div {...getRootProps({ className: "dropzone" })}>
        <input className="input-zone" {...getInputProps()} />
        <div className={ `text-center ${style.mainBox}` }>
          {isDragActive ? (
            <p className={ `dropzone-content` }>
              Release to drop the files here
            </p>
          ) : (
            <p className="dropzone-content">
              Drop some files here, or click to select files
            </p>
          )}
          <button type="button" onClick={ open } className="btn">
            Select files
          </button>
        </div>
      </div>
    </div>
  );
}