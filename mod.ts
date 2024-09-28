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
    nav{
      position: fixed;      
      top: 0;
      display: flex;      
      justify-content: center;
      width: 100%;      
      background-color: black;      
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
      text-wrap: nowrap;
    }
    ol{
    margin: 3em 0;
    }
    input{
      background-color: black;
      border: 1px solid white;
      padding: 1em 2em;
      border-radius: 60px;
      color: white;
      width: 90%;
      margin-top: 1em;
    }
    input:focus, input:active, input:focus-visible{
      border: none;      
    }
    
    @media only screen and (max-width: 768px) {
      /* For mobile phones: */
      body {
        margin: 1em;
      }
      ol{
        
        padding: .5em;
        margin-left: 1em;        
      }
      input{
        width: 70%;
      }
    }
  </style>
</head>
<body>
  <nav>
    <input type="text" id="input" placeholder="Search">
  </nav>

  <ol id="listvideo">
  </ol>
  
  <footer>
    <div style="padding: 5px;">
      <a href="#" id="title"></a>      
      <audio id="audio" src="#" controls></audio>
    </div>
  </footer>

  <script>
    const listvideo = document.getElementById('listvideo')
    let tempListvideo = []
    const audio = document.getElementById('audio')
    const title = document.getElementById('title')
    const input = document.getElementById('input')

    function set(_title, _link){
      if(!title || !audio) return
      document.title = _title + ' | Media Player' 
      title.innerText = _title
      title.setAttribute('href',_link)
      audio.setAttribute('src', _link)
      audio.play()
    }

    function createLi(e){
        const li = document.createElement('li')
        const btn = document.createElement('button')
        const link = "/videos/"+e
        btn.setAttribute('href',link)
        btn.setAttribute('onclick', \`set("\${e}","\${link}")\`)
        btn.innerText = e
        li.appendChild(btn)
        listvideo.appendChild(li)
    }

    input.addEventListener('input', e=>{
      const value = e.target.value      
      listvideo.innerHTML=''
      
      if(value == '') {
        tempListvideo.forEach(e=>createLi(e))
      }
      
      
      tempListvideo.filter(e=>e.toLowerCase().includes(value)).forEach(e=>{
        createLi(e)
      })
      // console.log(tempListvideo)
      
    })    

    async function loadVideo(){
      const res = await fetch("/api/videos")
      const data = await res.json()

      Object.entries(data)[0][1].forEach(e=>{        
        createLi(e)
      }) 
      tempListvideo = Object.values(listvideo.children).map(e=>e.children[0].innerText)
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