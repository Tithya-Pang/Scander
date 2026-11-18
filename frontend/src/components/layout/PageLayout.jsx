import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
export default function PageLayout({ title, links }) {
  const { search } = useLocation();
  return <div className="app-shell"><aside className="sidebar"><Link to="/" className="brand"><BrandLogo className="page-logo"/></Link><div className="sidebar-label">{title} workspace</div><nav aria-label={`${title} navigation`}>{links.map(([to,label])=><NavLink key={to} end to={{ pathname: to, search: title === "Customer" ? search : "" }} className={({isActive})=>`nav-link${isActive?' active':''}`}>{label}</NavLink>)}</nav><div className="sidebar-footer">Frontend preview · sample data</div></aside><div className="app-main"><header className="topbar"><span>{title}</span><Link to="/">Switch workspace ↗</Link></header><div className="page-content"><Outlet/></div></div></div>;
}
