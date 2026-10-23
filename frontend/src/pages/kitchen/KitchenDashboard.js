import { useState } from 'react';
import KanbanColumn from '../../components/kitchen/KanbanColumn';
const initialOrders = [
  {id:'#1024',table:'04',time:'2 min ago',status:'Received',items:['1 × Iced Latte','2 × Fried Rice']},
  {id:'#1025',table:'02',time:'5 min ago',status:'Preparing',items:['1 × Chicken Sandwich','1 × Lemon Tea']},
  {id:'#1026',table:'07',time:'7 min ago',status:'Ready',items:['2 × Cappuccino']},
];
const stages = ['Received','Preparing','Ready','Served'];
export default function KitchenDashboard() {
 const [orders,setOrders]=useState(initialOrders);
 const move = id=>setOrders(prev=>prev.map(o=>o.id===id?{...o,status:stages[stages.indexOf(o.status)+1]}:o));
 return <section><span className="eyebrow">LIVE QUEUE PREVIEW</span><h1>Kitchen Queue</h1><p className="muted">Manage incoming orders. Changes are local demo state only.</p><div className="kanban">{stages.slice(0,3).map(stage=><KanbanColumn key={stage} title={stage} orders={orders.filter(o=>o.status===stage)} onNext={move}/>)}</div><p className="muted note">Served orders disappear from this demo queue. Real history requires a backend.</p></section>;
}
