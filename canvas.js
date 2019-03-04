const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth - 3.5
canvas.height = innerHeight - 3.5

const factsDiv = document.getElementById('factsDiv');

factsDiv.style.height = canvas.height / 6 + 'px'
factsDiv.style.width = canvas.width / 3 + 'px'

let rectangle = factsDiv.getBoundingClientRect()
console.log(rectangle)


const facts = ["There is a volcano on mars that is three times the size of Mount Everest.", 
                "Venus is the hottest planet even though Mercury is closer to the sun.", 
                "Water floats like bubbles in the International Space Station and will cling to a surface until dislodged.", 
                "Voyager 1, the furthest man made object from earth, entered interstellar space in 2012."]


addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight
    rectangle = factsDiv.getBoundingClientRect()
    console.log(rectangle)
    init()
})

let count = 3;
const factsContainer = document.getElementById('text');

factsContainer.innerHTML = facts[1]
    setInterval(function(){
        for(var i = 0; i<3; i++){
          factsContainer.innerHTML = facts[count];
          count++;
          if(count == facts.length){
            count = 0;
          };
        }
      }, 4000);

//helper functions
function findDistance(x1, y1, x2, y2) {
let distance1 = x2-x1
let distance2 = y2-y1
    return Math.sqrt((Math.pow(distance1, 2)) + (Math.pow(distance2, 2)))
}

//rotate on the angle between the two center points of particles so you can use the two deminsions
function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function collision(particle, otherParticle) {

    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
        //Diff in velocity and distance of the two particles that are being passed through will only react when this is = 0
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        //ONE-DIMENSIONAL NEWTONIAN EQUATION: 
          //velocity after collision = (mass1 - mass 2) / (mass1 + mass2) * velocity1 before collision + (2 * mass2) / (mass1 + mass2) * velocity2 before collision
        
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

// Objects
function Circle(x, y, radius, color) {
    this.x = x;
    this.y = y; 
    this.velocity = {
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5
    };
    this.radius = radius;
    this.color = color;
    this.mass = 1;
    this.opacity = 0;
}

Circle.prototype.draw = function() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.shadowColor = '#e3eaef'
    c.shadowBlur = 20;
    c.fill()
    c.closePath()
    
}

Circle.prototype.update = function() {
    this.draw()
    //equation to detect when two particles collide and then use collision
        //equation to make them bounce off of each other

    for(let i = 0; i < circles.length; i++) {
        //if this circle is equal to itself then don't include and continue
        if(this === circles[i]) continue

        if(findDistance(this.x, this.y, circles[i].x, circles[i].y) - this.radius * 2 < 0) {
            collision(this, circles[i])
        }

        if(findDistance(this.x, this.y, circles[i].x, circles[i].y) - this.radius * 2 < 50) {
            c.beginPath();
            c.strokeStyle = "white"
            c.lineWidth = 0.5
            c.moveTo(this.x, this.y);
            c.lineTo(circles[i].x, circles[i].y);
            c.stroke()
        }
    }

    if(this.x -this.radius <= 0 || this.x + this.radius >= innerWidth) {
        this.velocity.x = -this.velocity.x
    }

    if(this.y - this.radius <= 0 || this.y + this.radius >= innerHeight) {
        this.velocity.y = -this.velocity.y
    }

    if(this.x + this.radius * 2 >= rectangle.left && this.x - this.radius * 2 <= rectangle.right 
        && this.y - this.radius * 2 <= rectangle.bottom && this.y + this.radius * 2 >= rectangle.top) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = -this.velocity.y
        }

    this.x += this.velocity.x
    this.y += this.velocity.y
}

// Implementation
let circles
function init() {
    circles = []

    function makeStars(starsAmount) {
            for (let i = 0; i < starsAmount; i++) {
            const radius = 5;
            let x = Math.floor(Math.random() * (canvas.width - radius - radius + 1) + radius)
            let y = Math.floor(Math.random() * (canvas.height - radius - radius + 1) + radius)
            let color = "white"

            //make sure there is more than one particle on the screen
            if (i !== 0) {
            //then check if any of the particles are overlapping, if they are skip that one and generate another
            for(let j=0; j < circles.length; j++) {
                if(findDistance(x, y, circles[j].x, circles[j].y) - radius * 2 < 0){
                    x = Math.floor(Math.random() * (canvas.width - radius - radius + 1) + radius)
                    y = Math.floor(Math.random() * (canvas.height - radius - radius + 1) + radius)
                    
                    j = -1
                }
            }

            for(let k=0; k < circles.length; k++) {
                if(circles[k].x + circles[k].radius * 2 >= rectangle.left && circles[k].x - circles[k].radius * 2 <= rectangle.right 
                    && circles[k].y - circles[k].radius * 2 <= rectangle.bottom && circles[k].y + circles[k].radius * 2 >= rectangle.top){
                    circles[k].x = Math.floor(Math.random() * (canvas.width - radius - radius + 1) + radius)
                    circles[k].y = Math.floor(Math.random() * (canvas.height - radius - radius + 1) + radius)
                    
                    k = -1
                }
            }
            }
            circles.push(new Circle(x, y, radius, color))
        }
    }

    if (canvas.height < 500 || canvas.width < 700) {
        makeStars(65)
    } else if (canvas.height < 800 || canvas.width < 900) {
        makeStars(100)
    } else if (canvas.height > 1100 || canvas.width > 1200) {
        makeStars(200)
    } else {
        makeStars(150)
    }

}

// Animation Loop
function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)

    circles.forEach(circle => {
     circle.update(circles)
    })
}

init()
animate()