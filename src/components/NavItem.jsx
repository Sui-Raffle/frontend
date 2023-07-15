import Link from 'next/link';

import './NavItem.css';
const NavItem = ({ text, href, active }) => {
  return (
    <Link href={href}>
      <span className={`nav__item ${active ? 'active' : ''}`}>{text}</span>
    </Link>
  );
};

export default NavItem;
