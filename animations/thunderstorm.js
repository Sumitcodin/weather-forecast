class ThunderstormAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drops = [];
        this.lightning = {
            active: false,
            alpha: 0,
            lastFlash: 0,
            nextFlash: 0,
            branches: []
        };
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Create raindrops
        for (let i = 0; i < 150; i++) {
            this.drops.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: 3 + Math.random() * 4,
                length: 15 + Math.random() * 20
            });
        }

        // Start animation
        this.animate();
    }

    createLightningBranches(startX, startY, angle, length, depth) {
        if (depth <= 0) return [];
        
        const branches = [];
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;
        
        branches.push({ startX, startY, endX, endY });
        
        // Create sub-branches
        if (depth > 1) {
            const numBranches = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numBranches; i++) {
                const branchAngle = angle + (Math.random() * 0.5 - 0.25);
                const branchLength = length * 0.7;
                branches.push(...this.createLightningBranches(endX, endY, branchAngle, branchLength, depth - 1));
            }
        }
        
        return branches;
    }

    drawLightning() {
        if (!this.lightning.active) return;

        this.ctx.strokeStyle = `rgba(255, 255, 255, ${this.lightning.alpha})`;
        this.ctx.lineWidth = 2;

        // Draw main lightning bolt
        this.ctx.beginPath();
        this.ctx.moveTo(this.lightning.branches[0].startX, this.lightning.branches[0].startY);
        
        this.lightning.branches.forEach(branch => {
            this.ctx.lineTo(branch.endX, branch.endY);
        });
        
        this.ctx.stroke();

        // Add glow effect
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Handle lightning
        const now = Date.now();
        if (now > this.lightning.nextFlash) {
            this.lightning.active = true;
            this.lightning.alpha = 1;
            this.lightning.lastFlash = now;
            this.lightning.nextFlash = now + 2000 + Math.random() * 3000;

            // Create new lightning branches
            const startX = Math.random() * this.canvas.width;
            const startY = 0;
            const angle = Math.PI / 2 + (Math.random() * 0.4 - 0.2); // Slightly randomized downward angle
            const length = this.canvas.height * 0.6;
            this.lightning.branches = this.createLightningBranches(startX, startY, angle, length, 3);
        }

        // Fade out lightning
        if (this.lightning.active) {
            this.lightning.alpha *= 0.9;
            if (this.lightning.alpha < 0.1) {
                this.lightning.active = false;
            }
        }

        // Draw lightning
        this.drawLightning();

        // Draw and update raindrops
        this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.7)';
        this.ctx.lineWidth = 1.5;

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

export default ThunderstormAnimation; 