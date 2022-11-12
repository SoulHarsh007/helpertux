import {QuickDB} from 'quick.db';
import {join} from 'path';

const db = new QuickDB({
  filePath: join(process.cwd(), 'pacmon.db'),
});

export default db;
