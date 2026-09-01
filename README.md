<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>ZST CDN Proxy - Deployment Guide</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Inter,Segoe UI,Arial,sans-serif;
}


body{

background:#050505;
color:#fff;
line-height:1.7;

}


.container{

max-width:1100px;
margin:auto;
padding:30px;

}


.hero{

padding:80px 20px;
text-align:center;
background:
linear-gradient(135deg,#111,#000);

border-bottom:1px solid #222;

}



.hero h1{

font-size:45px;
background:linear-gradient(
90deg,
#00e5ff,
#8b5cf6
);

-webkit-background-clip:text;
color:transparent;

}



.hero p{

color:#aaa;
font-size:18px;
margin-top:15px;

}



.badge{

display:inline-block;
background:#00e5ff;
color:#000;
padding:8px 18px;
border-radius:50px;
font-weight:bold;
margin-bottom:20px;

}




.card{

background:#111;
border:1px solid #222;
padding:30px;
border-radius:20px;
margin:30px 0;

box-shadow:
0 0 30px rgba(0,0,0,.5);

}



h2{

color:#00e5ff;
margin-bottom:15px;

}



h3{

margin-top:20px;

}



ul,ol{

margin-left:25px;

}



li{

margin:8px 0;

}




.step{

background:#161616;
padding:20px;
border-radius:15px;
margin:15px 0;
border-left:4px solid #00e5ff;

}




.code{

background:#000;
border:1px solid #333;
padding:20px;
border-radius:15px;
overflow:auto;

color:#00ff9d;

font-size:14px;

margin-top:15px;

}



.highlight{

color:#00ff9d;
font-weight:bold;

}




.footer{

text-align:center;
padding:40px;
color:#888;

}



a{

color:#00e5ff;
text-decoration:none;

}


</style>


</head>


<body>



<section class="hero">


<div class="container">


<div class="badge">
ZST CDN Proxy
</div>


<h1>
MovieBox CDN Proxy Deployment Guide
</h1>


<p>
Deploy your own MovieBox CDN proxy API on Vercel and convert CDN stream/download URLs into your own proxy endpoint.
</p>


</div>


</section>





<div class="container">





<div class="card">


<h2>
🚀 About ZST CDN Proxy
</h2>


<p>

ZST CDN Proxy is a standalone Next.js API project that allows developers to proxy MovieBox CDN media URLs through their own Vercel deployment.

</p>


<ul>

<li>Framework: Next.js</li>

<li>Hosting: Vercel</li>

<li>Deployment: GitHub + Vercel</li>

<li>Directory: Root folder</li>

<li>No code modification required</li>

</ul>


</div>






<div class="card">


<h2>
⭐ Support The Project Before Deployment
</h2>


<p>
Before deploying, please support the open-source project by starring, forking, and following the developer account.
</p>



<div class="step">

<strong>
1. Open the official GitHub repository:
</strong>


<div class="code">

https://github.com/Godszeal/proxy-cdn

</div>


</div>




<div class="step">

<strong>
2. Click ⭐ Star Repository
</strong>

<br>

Star the repository to support the project and help more developers discover it.

</div>




<div class="step">

<strong>
3. Click Fork Repository
</strong>

<br>

Fork the project into your own GitHub account so you can deploy your own version.

</div>




<div class="step">

<strong>
4. Follow God's Zeal GitHub Account
</strong>


<div class="code">

https://github.com/Godszeal

</div>


</div>


</div>








<div class="card">


<h2>
📁 Project Structure
</h2>


<p>
The project must remain in the root directory.
Do not move files into another folder.
</p>


<div class="code">


proxy-cdn/

<br>
├── app/

<br>
│ └── api/

<br>
│ &nbsp;&nbsp;&nbsp;└── proxy/

<br>
│ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── route.js

<br><br>

├── package.json

<br>
├── next.config.js

<br>
└── README.md


</div>


</div>









<div class="card">


<h2>
Step 1: Clone Or Fork Repository
</h2>



<div class="code">


git clone https://github.com/Godszeal/proxy-cdn.git


<br><br>


cd proxy-cdn


</div>



<p>
After downloading the project, push it to your own GitHub repository if required.
</p>


</div>








<div class="card">


<h2>
Step 2: Deploy On Vercel
</h2>


<ol>


<li>
Login to Vercel.
</li>


<li>
Click <b>Add New Project</b>.
</li>


<li>
Import your forked GitHub repository.
</li>


<li>
Select the proxy-cdn repository.
</li>


<li>
Keep all default settings.
</li>


<li>
Make sure the Root Directory is selected.
</li>


<li>
Click Deploy.
</li>


</ol>


<br>


<p>
Vercel automatically detects Next.js and builds the API.
</p>


</div>









<div class="card">


<h2>
Step 3: Get Your Deployment URL
</h2>


<p>

After successful deployment Vercel provides a URL like:

</p>


<div class="code">

https://zst-cdn-proxy.vercel.app

</div>


<p>

Your API endpoint becomes:

</p>


<div class="code">

https://your-domain.vercel.app/api/proxy?url=MEDIA_URL

</div>


</div>









<div class="card">


<h2>
🎬 MovieBox Stream Example
</h2>


<p>
Original MovieBox CDN URL:
</p>


<div class="code">

https://bcdnxw.hakunaymatata.com/convert-h264/2ce73b06244660985969ff79de074b7d.mp4?sign=5e92e7b93f4ab61325884256d95b1a31&t=1787288675

</div>



<p>
Proxy version:
</p>


<div class="code">


https://zst-proxy-cdn.vercel.app/api/proxy?url=https%3A%2F%2Fbcdnxw.hakunaymatata.com%2Fconvert-h264%2F2ce73b06244660985969ff79de074b7d.mp4%3Fsign%3D5e92e7b93f4ab61325884256d95b1a31%26t%3D1787288675


</div>


</div>









<div class="card">


<h2>
📺 Using Proxy URL In Video Player
</h2>


<div class="code">


&lt;video controls width="100%"&gt;

<br>

&nbsp;&nbsp;&lt;source src="YOUR_PROXY_URL" type="video/mp4"&gt;

<br>

&lt;/video&gt;


</div>


</div>









<div class="card">


<h2>
API Documentation
</h2>


<div class="code">

GET /api/proxy?url=TARGET_URL

</div>


<ul>

<li>
Receives CDN media URL
</li>


<li>
Applies optimized CDN headers
</li>


<li>
Fetches original media
</li>


<li>
Returns proxied response
</li>


</ul>


</div>









<div class="card">


<h2>
✅ Deployment Checklist
</h2>


<ul>


<li>
✔ Repository starred
</li>


<li>
✔ Repository forked
</li>


<li>
✔ GitHub account followed
</li>


<li>
✔ Project uploaded
</li>


<li>
✔ Imported into Vercel
</li>


<li>
✔ Deployment completed
</li>


<li>
✔ Proxy endpoint tested
</li>


<li>
✔ MovieBox stream working
</li>


</ul>


</div>






</div>





<div class="footer">

Powered By God's Zeal Tech © 2026

<br>

Build. Deploy. Stream.

</div>



</body>

</html>
