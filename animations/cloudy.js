class CloudyAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.clouds = [];
        this.time = 0;
        this.init();

        // Add resize listener
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Define a few base cloud structures
        const cloudStructures = [
            // Standard fluffy cloud
            [
                { xOffset: 0, yOffset: 0, radiusFactor: 1.0 },
                { xOffset: -0.3, yOffset: 0.2, radiusFactor: 0.7 },
                { xOffset: 0.3, yOffset: 0.2, radiusFactor: 0.7 },
                { xOffset: -0.2, yOffset: -0.2, radiusFactor: 0.6 },
                { xOffset: 0.2, yOffset: -0.2, radiusFactor: 0.6 },
                { xOffset: 0, yOffset: 0.4, radiusFactor: 0.5 },
                { xOffset: -0.4, yOffset: 0, radiusFactor: 0.6 }, 
                { xOffset: 0.4, yOffset: 0, radiusFactor: 0.6 },  
                { xOffset: 0, yOffset: -0.4, radiusFactor: 0.5 } 
            ],
            // Wider, flatter cloud
            [
                { xOffset: 0, yOffset: 0, radiusFactor: 1.0 },
                { xOffset: -0.4, yOffset: 0.1, radiusFactor: 0.8 },
                { xOffset: 0.4, yOffset: 0.1, radiusFactor: 0.8 },
                { xOffset: -0.2, yOffset: -0.1, radiusFactor: 0.7 },
                { xOffset: 0.2, yOffset: -0.1, radiusFactor: 0.7 },
                { xOffset: -0.5, yOffset: 0.2, radiusFactor: 0.6 }, 
                { xOffset: 0.5, yOffset: 0.2, radiusFactor: 0.6 }  
            ],
            // Taller, thinner cloud
            [
                { xOffset: 0, yOffset: 0, radiusFactor: 1.0 },
                { xOffset: 0.1, yOffset: 0.3, radiusFactor: 0.7 },
                { xOffset: -0.1, yOffset: 0.3, radiusFactor: 0.7 },
                { xOffset: 0, yOffset: -0.3, radiusFactor: 0.6 },
                { xOffset: 0.2, yOffset: 0.5, radiusFactor: 0.5 }, 
                { xOffset: -0.2, yOffset: 0.5, radiusFactor: 0.5 } 
            ]
        ];

        // Create clouds with more varied properties
        for (let i = 0; i < 8; i++) {
            const structure = cloudStructures[Math.floor(Math.random() * cloudStructures.length)];
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height / 2),
                baseWidth: 120 + Math.random() * 180, 
                baseHeight: 40 + Math.random() * 30, 
                speed: 0.05 + Math.random() * 0.1,
                opacity: 0.6 + Math.random() * 0.3,
                verticalSpeed: 0.1 + Math.random() * 0.2,
                verticalRange: 10 + Math.random() * 20,
                puffs: structure.map(puff => ({
                    xOffset: puff.xOffset,
                    yOffset: puff.yOffset,
                    radiusFactor: puff.radiusFactor,
                    randomAngle: Math.random() * Math.PI * 2 
                }))
            });
        }

        // Start animation
        this.animate();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Re-initialize clouds to redraw them correctly on new canvas size
        this.clouds = []; // Clear existing clouds
        this.init(); // Re-create and re-draw clouds
    }

    drawCloudPuff(x, y, radius, opacity) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        this.ctx.fillStyle = gradient;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCloud(x, y, baseWidth, baseHeight, opacity, puffs) {
        // Set overall cloud shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 5;

        puffs.forEach(puff => {
            const puffX = x + puff.xOffset * baseWidth;
            const puffY = y + puff.yOffset * baseHeight;
            const puffRadius = (baseWidth + baseHeight) / 4 * puff.radiusFactor; 

            this.drawCloudPuff(puffX, puffY, puffRadius, opacity);
        });
        
        // Reset shadow after drawing the cloud
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
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
                cloud.baseWidth,
                cloud.baseHeight,
                cloud.opacity,
                cloud.puffs
            );

            // Update position with slight variation
            cloud.x += cloud.speed * (1 + Math.sin(this.time * 0.001) * 0.1);
            
            // Reset cloud when it goes off screen
            if (cloud.x > this.canvas.width + cloud.baseWidth) {
                cloud.x = -cloud.baseWidth;
                cloud.y = Math.random() * (this.canvas.height / 2);
                // Randomize some properties on reset
                cloud.opacity = 0.6 + Math.random() * 0.3;
                // Re-randomize structure for new cloud coming in
                const cloudStructures = [
                    // Standard fluffy cloud
                    [
                        { xOffset: 0, yOffset: 0, radiusFactor: 1.0 },
                        { xOffset: -0.3, yOffset: 0.2, radiusFactor: 0.7 },
                        { xOffset: 0.3, yOffset: 0.2, radiusFactor: 0.7 },
                        { xOffset: -0.2, yOffset: -0.2, radiusFactor: 0.6 },
                        { xOffset: 0.2, yOffset: -0.2, radiusFactor: 0.6 },
                        { xOffset: 0, yOffset: 0.4, radiusFactor: 0.5 } 
                    ],
                    // Wider, flatter cloud
                    [
                        { xOffset: 0, yOffset: 0, radiusFactor: 1.0 },
                        { xOffset: -0.4, yOffset: 0.1, radiusFactor: 0.8 },
                        { xOffset: 0.4, yOffset: 0.1, radiusFactor: 0.8 },
                        { xOffset: -0.2, yOffset: -0.1, radiusFactor: 0.7 },
                        { xOffset: 0.2, yOffset: -0.1, radiusFactor: 0.7 }
                    ],
                    // Taller, thinner cloud
                    [
                        { xOffset: 0, yOffset: 0, radiusFactor: 1.0 },
                        { xOffset: 0.1, yOffset: 0.3, radiusFactor: 0.7 },
                        { xOffset: -0.1, yOffset: 0.3, radiusFactor: 0.7 },
                        { xOffset: 0, yOffset: -0.3, radiusFactor: 0.6 }
                    ]
                ];
                const newStructure = cloudStructures[Math.floor(Math.random() * cloudStructures.length)];
                cloud.puffs = newStructure.map(puff => ({
                    xOffset: puff.xOffset,
                    yOffset: puff.yOffset,
                    radiusFactor: puff.radiusFactor,
                    randomAngle: Math.random() * Math.PI * 2
                }));
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default CloudyAnimation; 