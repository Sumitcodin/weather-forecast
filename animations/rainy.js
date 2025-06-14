class RainyAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drops = [];
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Create raindrops
        for (let i = 0; i < 100; i++) {
            this.drops.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: 2 + Math.random() * 3,
                length: 10 + Math.random() * 20
            });
        }

        // Start animation
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw and update raindrops
        this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        this.ctx.lineWidth = 1;

        this.drops.forEach(drop => {
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y + drop.length);
            this.ctx.stroke();

            // Update position
            drop.y += drop.speed;

            // Reset drop when it goes off screen
            if (drop.y > this.canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.canvas.width;
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default RainyAnimation; 