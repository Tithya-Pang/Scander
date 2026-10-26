import { writeFile } from 'node:fs/promises';
import { adminSupabase } from '../src/config/supabase.js';
const { data, error } = await adminSupabase.from('restaurant_table')
  .select('table_id,table_number,qr_token').eq('restaurant_id', process.env.RESTAURANT_ID).eq('is_active', true).order('table_id');
if (error) throw new Error(`Could not load tables (${error.code}).`);
const destination = process.argv[2];
if (!destination) throw new Error('Supply a private output JSON filename.');
await writeFile(destination, JSON.stringify(data.map(table => ({ id: table.table_id, number: table.table_number, token: table.qr_token }))), { mode: 0o600 });
console.log(`Exported ${data.length} active database tables. Generate fresh QR cards using this file.`);
