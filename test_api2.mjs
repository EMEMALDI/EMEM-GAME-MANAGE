const res = await fetch('http://localhost:3000/api/missingroute', { method: 'POST' });
console.log(await res.text());
