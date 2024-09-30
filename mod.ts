import * as qrcode from '@kingsword09/ts-qrcode-terminal'
import html from './html.ts'

let port = 4000
let hostname = 'localhost'
Deno.networkInterfaces().forEach(e => {
  if (e.family === 'IPv4' && e.address.startsWith('192')) {
    hostname = e.address
  }
})

const run = (_port: number) => Deno.serve({ port: _port, hostname }, async (_req) => {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", '*');

  const pathname = new URL(_req.url).pathname;

  // get | post | put | delete
  const method = _req.method.toLowerCase();


  if (pathname == '/' && method == 'get') {
    headers.set('Content-Type', 'text/html')
    return new Response(html, { headers })
  };

  if (pathname == '/api/videos' && method == 'get') {
    const files: string[] = []

    for await (const dirEntry of Deno.readDirSync(".")) {
      if (!dirEntry.isFile || !/\.(m4a|mp4|webm|mkv|mov|avi)$/.test(dirEntry.name)) continue
      files.push(dirEntry.name)
    }

    return Response.json({ files }, { headers })
  };

  if (pathname.startsWith('/videos/') && method == 'get') {
    let title: string[] | string = pathname.split('/')
    title = decodeURI("./" + title[title.length - 1])

    return new Response(await Deno.readFile(title), { headers })
  };


  return new Response('404 not found', { headers })
});

let tryagain = true
while (tryagain) {
  try {
    run(port)
    tryagain = false
    qrcode.generate(`http://${hostname}:${port}`, { small: true, qrErrorCorrectLevel: 1 })
  } catch (_) {
    port += 1
  }
}