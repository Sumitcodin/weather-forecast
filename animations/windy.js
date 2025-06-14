class WindyAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Create wind particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 3,
                speed: 5 + Math.random() * 10,
                opacity: 0.1 + Math.random() * 0.5
            });
        }

        // Start animation
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw and update particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();

            // Update position
            particle.x += particle.speed;
            
            // Reset particle when it goes off screen
            if (particle.x > this.canvas.width) {
                particle.x = -particle.size;
                particle.y = Math.random() * this.canvas.height;
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default WindyAnimation; 