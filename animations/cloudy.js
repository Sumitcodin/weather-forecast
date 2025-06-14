class CloudyAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.clouds = [];
        this.time = 0;
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Create clouds with more varied properties
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height / 2),
                width: 120 + Math.random() * 180,
                height: 40 + Math.random() * 30,
                speed: 0.1 + Math.random() * 0.2,
                opacity: 0.6 + Math.random() * 0.3,
                puffCount: 5 + Math.floor(Math.random() * 4),
                verticalSpeed: 0.1 + Math.random() * 0.2,
                verticalRange: 10 + Math.random() * 20,
                puffSizes: Array(5 + Math.floor(Math.random() * 4)).fill(0).map(() => 0.5 + Math.random() * 0.5),
                puffShapes: Array(5 + Math.floor(Math.random() * 4)).fill(0).map(() => Math.random())
            });
        }

        // Start animation
        this.animate();
    }

    drawCloudPuff(x, y, size, shapeType, time) {
        const wobble = Math.sin(time * 0.001) * 2;
        
        // Enable shadow blur for softer edges
        this.ctx.shadowBlur = size * 0.5;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        
        switch(Math.floor(shapeType * 4)) {
            case 0: // Full circle with multiple layers
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(x, y + wobble, size * (1 - i * 0.2), 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
                
            case 1: // Semi-circle with gradient
                const gradient = this.ctx.createRadialGradient(
                    x, y + wobble, 0,
                    x, y + wobble, size
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = gradient;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y + wobble, size, 0, Math.PI);
                this.ctx.fill();
                break;
                
            case 2: // Curved puff with multiple curves
                for (let i = 0; i < 2; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - size, y + wobble);
                    this.ctx.quadraticCurveTo(
                        x, y + wobble - size * (1.5 - i * 0.3),
                        x + size, y + wobble
                    );
                    this.ctx.quadraticCurveTo(
                        x, y + wobble + size * (0.5 + i * 0.2),
                        x - size, y + wobble
                    );
                    this.ctx.fill();
                }
                break;
                
            case 3: // Wavy puff with layered waves
                for (let i = 0; i < 2; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - size, y + wobble);
                    for (let j = -size; j <= size; j += size/4) {
                        this.ctx.quadraticCurveTo(
                            x + j, y + wobble + Math.sin(j * 0.5 + i) * size * (0.5 - i * 0.1),
                            x + j + size/4, y + wobble
                        );
                    }
                    this.ctx.fill();
                }
                break;
        }
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }

    drawCloud(x, y, width, height, opacity, puffSizes, puffShapes) {
        // Create gradient for softer look
        const gradient = this.ctx.createRadialGradient(
            x + width/2, y + height/2, 0,
            x + width/2, y + height/2, width/2
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        this.ctx.fillStyle = gradient;
        
        // Draw cloud puffs with varying shapes and sizes
        puffSizes.forEach((size, index) => {
            const puffX = x + (width * index / (puffSizes.length - 1));
            const puffY = y + Math.sin(this.time * 0.001 + index) * 5;
            const puffSize = height * size;
            
            this.drawCloudPuff(puffX, puffY, puffSize, puffShapes[index], this.time + index);
        });

        // Add subtle shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 5;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time++;
        
        // Draw and update clouds
        this.clouds.forEach(cloud => {
            // Calculate vertical movement
            const verticalOffset = Math.sin(this.time * cloud.verticalSpeed * 0.01) * cloud.verticalRange;
            
            this.drawCloud(
                cloud.x,
                cloud.y + verticalOffset,
                cloud.width,
                cloud.height,
                cloud.opacity,
                cloud.puffSizes,
                cloud.puffShapes
            );

            // Update position with slight variation
            cloud.x += cloud.speed * (1 + Math.sin(this.time * 0.001) * 0.1);
            
            // Reset cloud when it goes off screen
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
                cloud.y = Math.random() * (this.canvas.height / 2);
                // Randomize some properties on reset
                cloud.opacity = 0.6 + Math.random() * 0.3;
                cloud.puffSizes = Array(cloud.puffCount).fill(0).map(() => 0.5 + Math.random() * 0.5);
                cloud.puffShapes = Array(cloud.puffCount).fill(0).map(() => Math.random());
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default CloudyAnimation; 