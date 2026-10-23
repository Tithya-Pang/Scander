const paths = {
  coffee: <><path d="M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path d="M17 9h2a3 3 0 0 1 0 6h-2M7 3v2m4-2v2m4-2v2"/></>,
  menu: <><path d="m4 3 17 18M3 4l4 4m-1-6 4 4M3 7l4 4 4-4M16 3c-4 4-4 6-2 8l7-7M3 21l7-7"/></>,
  bag: <><rect x="4" y="5" width="16" height="17" rx="3"/><path d="M8 9a4 4 0 0 0 8 0M8 5V3h8v2"/></>,
  cart: <><path d="M3 3h2l3 13h11l3-10H6"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
  search: <><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></>,
  note: <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></>,
  leaf: <><path d="M20 3C8 2 2 9 6 16s15 4 14-13ZM4 21 16 9"/></>,
};
export default function Icon({ name, size = 22, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
