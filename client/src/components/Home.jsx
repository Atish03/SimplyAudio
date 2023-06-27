import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div>
            Please <Link to="/login/" style={{ color: "blue", textDecoration: "underline" }}>login</Link>
        </div>
    )
}