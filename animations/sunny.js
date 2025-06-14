class SunnyAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rays = [];
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Create sun rays
        for (let i = 0; i < 12; i++) {
            this.rays.push({
                angle: (i * 30) * Math.PI / 180,
                length: 50 + Math.random() * 20,
                speed: 0.5 + Math.random() * 0.5
            });
        }

        // Start animation
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sun
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 3;
        const sunRadius = 60;

        // Draw sun glow
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, sunRadius * 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, sunRadius * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw sun
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw and update rays
        this.ctx.strokeStyle = 'rgba(255, 255, 200, 0.6)';
        this.ctx.lineWidth = 2;

        this.rays.forEach(ray => {
            const endX = centerX + Math.cos(ray.angle) * ray.length;
            const endY = centerY + Math.sin(ray.angle) * ray.length;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();

            // Update ray length
            ray.length += Math.sin(Date.now() * 0.001 * ray.speed) * 0.5;
        });

        requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default SunnyAnimation; 