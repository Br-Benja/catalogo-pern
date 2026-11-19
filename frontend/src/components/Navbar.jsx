import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar bg-base-100 shadow-sm px-6">
      <Link to="/" className="text-xl font-bold text-primary">
        Catálogo PERN
      </Link>
    </header>
  );
}
