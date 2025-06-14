class SnowyAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.snowflakes = [];
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Create snowflakes with different sizes and speeds
        for (let i = 0; i < 100; i++) {
            this.snowflakes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 3, // Different sizes for snowflakes
                speed: 0.5 + Math.random() * 1.5, // Slower than rain
                wobble: Math.random() * 0.5, // Random wobble factor
                wobbleSpeed: 0.01 + Math.random() * 0.02, // Random wobble speed
                wobbleOffset: Math.random() * Math.PI * 2 // Random starting phase
            });
        }

        // Start animation
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw and update snowflakes
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        this.snowflakes.forEach(snowflake => {
            // Draw snowflake
            this.ctx.beginPath();
            this.ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Update position with wobble effect
            snowflake.wobbleOffset += snowflake.wobbleSpeed;
            snowflake.x += Math.sin(snowflake.wobbleOffset) * snowflake.wobble;
            snowflake.y += snowflake.speed;

            // Reset snowflake when it goes off screen
            if (snowflake.y > this.canvas.height) {
                snowflake.y = -snowflake.size;
                snowflake.x = Math.random() * this.canvas.width;
            }
            // Reset if it goes too far left or right
            if (snowflake.x < -snowflake.size) {
                snowflake.x = this.canvas.width + snowflake.size;
            } else if (snowflake.x > this.canvas.width + snowflake.size) {
                snowflake.x = -snowflake.size;
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default SnowyAnimation; 