import fs from 'fs';
import path from 'path';

const iconPath = path.resolve('public/icons/icon-144x144.png');

try {
    if (fs.existsSync(iconPath)) {
        const stats = fs.statSync(iconPath);
        console.log(`File exists: ${iconPath}`);
        console.log(`Size: ${stats.size} bytes`);

        // Read first few bytes to check PNG header
        const buffer = fs.readFileSync(iconPath);
        const header = buffer.toString('hex', 0, 8);
        console.log(`Header: ${header}`);

        if (header === '89504e470d0a1a0a') {
            console.log('Valid PNG header found.');
        } else {
            console.log('INVALID PNG header.');
        }
    } else {
        console.log(`File NOT found: ${iconPath}`);
    }
} catch (err) {
    console.error('Error checking file:', err);
}
