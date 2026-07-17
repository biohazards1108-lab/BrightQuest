const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
resize();window.addEventListener("resize",resize);

let ship={x:canvas.width/2,y:canvas.height-80,w:40,h:20};
let bullets=[];
let enemies=[];
let lastSpawn=0;

function spawnEnemy(){
    enemies.push({x:Math.random()*canvas.width,y:-30,w:30,h:20,vy:2+Math.random()*2});
}

canvas.addEventListener("click",()=>{
    bullets.push({x:ship.x,y:ship.y-10,vy:-8});
});

function update(timestamp){
    if(timestamp-lastSpawn>800){spawnEnemy();lastSpawn=timestamp;}

    bullets.forEach(b=>b.y+=b.vy);
    bullets=bullets.filter(b=>b.y>-20);

    enemies.forEach(e=>e.y+=e.vy);
    enemies=enemies.filter(e=>e.y<canvas.height+40);

    bullets.forEach(b=>{
        enemies.forEach((e,i)=>{
            if(b.x>e.x && b.x<e.x+e.w && b.y>e.y && b.y<e.y+e.h){
                enemies.splice(i,1);
            }
        });
    });
}

function draw(){
    ctx.fillStyle="#020617";ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#38bdf8";
    ctx.fillRect(ship.x-ship.w/2,ship.y-ship.h/2,ship.w,ship.h);
    ctx.fillStyle="#f97316";
    bullets.forEach(b=>ctx.fillRect(b.x-3,b.y-8,6,16));
    ctx.fillStyle="#ef4444";
    enemies.forEach(e=>ctx.fillRect(e.x,e.y,e.w,e.h));
}

function loop(ts){
    update(ts);
    draw();
    requestAnimationFrame(loop);
}
loop();
