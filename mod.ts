// run with deno
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Media Player</title>
  <link rel="shortcut icon" href="#" type="image/x-icon">
  <style>
    body{
      background-color: black;
      color: white;
      display:flex;
      justify-content:center;
      margin:2em;
    }      
    button{
      padding: 0;
      background-color: black;
      color: white;
      border:none;
      text-align: start;
      margin-bottom: 8px;
    }
    button:hover{
      cursor: pointer;
      color: rgba(255, 255, 255, 0.801);
    }
    a{
      color: white;
      text-decoration: none;
    }
    a:hover{
      color: rgba(255, 255, 255, 0.801);
    }
    footer{
      border-top: 1px solid white;
      position: fixed;
      text-align:center;
      bottom: 0;
      left:0;
      width: 100%;
      background-color: black;
    }
    audio{
      position: relative;
      background-color: black;
      width: 100%;
      margin-top: 5px;
    }
    #title{
      font-size: 14px;
    }
    
    @media only screen and (max-width: 768px) {
      /* For mobile phones: */
      body {
        margin: 1em;
      }
    }
  </style>
</head>
<body>
  <ol id="listvideo">
  </ol>
  <div style="height: 100px;" />
  <footer>
    <div style="padding: 5px;">
      <a href="#" id="title"></a>      
      <audio id="audio" src="#" controls></audio>
    </div>
  </footer>

  <script>
    const listvideo = document.getElementById('listvideo')
    const audio = document.getElementById('audio')
    const title = document.getElementById('title')

    function set(_title, _link){
      if(!title || !audio) return
      document.title = _title + ' | Media Player' 
      title.innerText = _title
      title.setAttribute('href',_link)
      audio.setAttribute('src', _link)
      audio.play()
    }

    async function loadVideo(){
      const res = await fetch("/api/videos")
      const data = await res.json()

      Object.entries(data)[0][1].forEach(e=>{
        const li = document.createElement('li')
        const btn = document.createElement('button')
        const link = "/videos/"+e
        btn.setAttribute('href',link)
        btn.setAttribute('onclick', \`set("\${e}","\${link}")\`)
        btn.innerText = e
        li.appendChild(btn)
        listvideo.appendChild(li)
      })      
    }
    loadVideo()
  </script>
</body>
</html>
`

const port = 4000
let hostname = 'localhost'
Deno.networkInterfaces().forEach(e => {
  if (e.family === 'IPv4' && e.address.startsWith('192')) {
    hostname = e.address
  }
})

Deno.serve({ port, hostname }, async (_req) => {
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