import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'סקירה', end: true },
  { to: '/compare', label: 'השוואה', end: false },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b-4 border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h1 className="text-2xl font-black sm:text-3xl">
          <span className="text-brand">דאשבורד ייצור</span> — מכונות המפעל
        </h1>
        <nav className="grid grid-cols-2 gap-3 sm:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'btn btn-active sm:px-8' : 'btn btn-ghost sm:px-8')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
