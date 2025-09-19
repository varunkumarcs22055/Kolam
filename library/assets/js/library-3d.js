/**
 * KolamLibrary3D - Futuristic 3D bookshelf library for Kolam collections
 * Uses Three.js for 3D rendering, GSAP for animations, and StPageFlip for book interactions
 */
class KolamLibrary3D {
    constructor() {
        console.log('🚀 KolamLibrary3D constructor called');
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.books = [];
        this.selectedBook = null;
        this.kolamData = null;
        this.pageFlip = null;
        this.isBookOpen = false;
        this.bookAnimationInProgress = false;
        
        // Animation and interaction settings
        this.hoveredBook = null;
        this.originalPositions = new Map();
        this.bookColors = {
            'Festival Kolams': { primary: 0xff6b9d, glow: 0xff9dbf },
            'Regional Kolams': { primary: 0x00f3ff, glow: 0x80f9ff },
            'AI-Generated Kolams': { primary: 0xb347d9, glow: 0xd98beb }
        };
        
        // Safe initialization - wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.safeInit());
        } else {
            this.safeInit();
        }
    }
    
    safeInit() {
        console.log('🔧 Starting safe initialization...');
        
        // Add small delay to ensure all scripts are loaded
        setTimeout(() => {
            this.init().catch(error => {
                console.error('❌ Initialization failed:', error);
                this.showError(error.message);
            });
        }, 100);
    }

    async init() {
        try {
            console.log('Starting 3D Library initialization...');
            
            // Update loading message
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = '<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto"></div><p class="mt-4">Loading Kolam data...</p>';
            }
            
            await this.loadKolamData();
            
            if (loading) {
                loading.innerHTML = '<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto"></div><p class="mt-4">Setting up 3D scene...</p>';
            }
            
            this.setupThreeJS();
            this.addTestCube(); // Add test cube to verify rendering
            this.setupLighting();
            this.setupControls();
            this.createBookshelf();
            this.setupEventListeners();
            this.setupBookInteractions();
            
            if (loading) {
                loading.innerHTML = '<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto"></div><p class="mt-4">Starting animation...</p>';
            }
            
            this.animate();
            
            // Hide loading indicator with delay
            setTimeout(() => {
                if (loading) {
                    loading.style.display = 'none';
                }
            }, 1000);
            
            console.log('✅ 3D Kolam Library initialized successfully');
            
            // Show success notification if available
            if (window.kolamGenApp) {
                window.kolamGenApp.showNotification('📚 3D Library loaded successfully!', 'success');
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize 3D Library:', error);
            
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = `
                    <div style="color: #ff6b9d; text-align: center;">
                        <p>❌ Library Loading Failed</p>
                        <p style="font-size: 0.9rem; margin-top: 10px;">Error: ${error.message}</p>
                        <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #ff6b9d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            🔄 Retry
                        </button>
                    </div>
                `;
            }
            
            this.showError('Failed to load 3D Library: ' + error.message);
        }
    }

    addTestCube() {
        console.log('Test cube creation skipped for clean library view');
        // Removed test cube to eliminate green wireframe lines
    }

    async loadKolamData() {
        try {
            console.log('Loading Kolam data from assets/data/kolams.json...');
            const response = await fetch('assets/data/kolams.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.kolamData = await response.json();
            console.log('Kolam data loaded successfully:', Object.keys(this.kolamData));
            
            // Validate data structure
            if (!this.kolamData || typeof this.kolamData !== 'object') {
                throw new Error('Invalid data format');
            }
            
        } catch (error) {
            console.error('Error loading Kolam data:', error);
            console.log('Using fallback demo data...');
            
            // Enhanced fallback data
            this.kolamData = {
                "Festival Kolams": { 
                    description: "Sacred patterns drawn during festivals and celebrations", 
                    color: "#ff6b9d", 
                    icon: "🎉", 
                    kolams: [
                        {
                            id: "demo1",
                            title: "Demo Festival Kolam",
                            image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAw",
                            description: "A beautiful festival Kolam pattern.",
                            category: "Traditional",
                            region: "Tamil Nadu",
                            festival: "Pongal",
                            symmetry: "4-fold",
                            complexity: "Intermediate",
                            cultural_significance: "Demo pattern for festival celebrations.",
                            tags: ["demo", "festival"]
                        }
                    ]
                },
                "Regional Kolams": { 
                    description: "Distinctive patterns reflecting regional traditions", 
                    color: "#00f3ff", 
                    icon: "🏛️", 
                    kolams: [
                        {
                            id: "demo2",
                            title: "Demo Regional Kolam",
                            image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAw",
                            description: "A traditional regional pattern.",
                            category: "Regional",
                            region: "Kerala",
                            festival: "Daily",
                            symmetry: "Radial",
                            complexity: "Beginner",
                            cultural_significance: "Demo regional pattern.",
                            tags: ["demo", "regional"]
                        }
                    ]
                },
                "AI-Generated Kolams": { 
                    description: "Innovative patterns created using AI", 
                    color: "#b347d9", 
                    icon: "🤖", 
                    kolams: [
                        {
                            id: "demo3",
                            title: "Demo AI Kolam",
                            image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAw",
                            description: "An AI-generated pattern.",
                            category: "AI-Generated",
                            region: "Digital",
                            festival: "Modern",
                            symmetry: "Complex",
                            complexity: "Expert",
                            cultural_significance: "Demo AI pattern.",
                            tags: ["demo", "ai"]
                        }
                    ]
                }
            };
        }
    }

    setupThreeJS() {
        console.log('Setting up Three.js scene...');
        
        // Check WebGL support
        if (!window.WebGLRenderingContext) {
            throw new Error('WebGL is not supported in this browser');
        }
        
        const canvas = document.getElementById('three-canvas');
        const container = canvas.parentElement;
        
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        // Test WebGL context
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            throw new Error('WebGL context could not be created');
        }
        console.log('WebGL context available');
        
        console.log('Canvas found, container size:', container.clientWidth, 'x', container.clientHeight);
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2F4F4F); // Dark slate gray for traditional library feel
        console.log('Scene created');
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 2, 8);
        console.log('Camera created and positioned');
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        console.log('Renderer created with size:', container.clientWidth, 'x', container.clientHeight);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        console.log('Three.js setup completed successfully');
    }

    createBookshelf() {
        console.log('🚀 Creating futuristic Gen Z bookshelf...');
        
        // Create traditional wooden bookshelf base
        this.createWoodenBookshelf();
        
        // Create traditional library environment
        this.createLibraryEnvironment();
        
        // Create books for each category - original spacing
        const categories = Object.keys(this.kolamData);
        const bookSpacing = 3.2; // Back to original spacing
        const startX = -(categories.length - 1) * bookSpacing / 2;
        
        categories.forEach((category, index) => {
            const book = this.createRealisticBook(category, index);
            book.position.x = startX + (index * bookSpacing);
            
            // Fix book positioning: shelf is at y=0.15, book height is 3.0
            // So book center should be at 0.15 + (3.0/2) = 1.65
            book.position.y = 1.65; // Properly position books on shelf
            book.position.z = 0;
            
            // Ensure books are standing upright (no rotation)
            book.rotation.set(0, 0, 0);
            
            // Store original position AFTER setting correct position
            this.originalPositions.set(book, book.position.clone());
            
            // Store original position in userData for reference
            book.userData.originalPosition = book.position.clone();
            
            // IMPORTANT: Ensure the book can be detected by raycaster
            book.userData.category = category;
            book.userData.index = index;
            
            // Make sure all children are part of the book for raycasting
            book.traverse((child) => {
                if (child.isMesh) {
                    // Make sure each mesh can be used for raycasting
                    child.userData.parentBook = book;
                    child.userData.category = category;
                }
            });
            
            // Add invisible bounding box for better click detection
            const boundingBox = new THREE.Box3().setFromObject(book);
            const size = boundingBox.getSize(new THREE.Vector3());
            const center = boundingBox.getCenter(new THREE.Vector3());
            
            const clickZoneGeometry = new THREE.BoxGeometry(size.x + 0.2, size.y + 0.2, size.z + 0.2);
            const clickZoneMaterial = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0, // Invisible but still detectable by raycaster
                visible: false // Don't render but still detect
            });
            
            const clickZone = new THREE.Mesh(clickZoneGeometry, clickZoneMaterial);
            clickZone.position.copy(center);
            clickZone.userData.parentBook = book;
            clickZone.userData.category = category;
            clickZone.userData.isClickZone = true;
            book.add(clickZone);
            
            // Remove the floating animation that was causing issues
            // this.animateRealisticBook(book, index);
            
            this.books.push(book);
            this.scene.add(book);
            
            console.log(`📖 Created book ${index}: ${category} at position (${book.position.x}, ${book.position.y}, ${book.position.z})`);
        });
        
        // Debug log
        console.log(`✨ Created ${categories.length} futuristic books!`);
        console.log('📚 Books array:', this.books.map(b => ({ category: b.userData.category, position: b.position })));
        
        // Update UI stats
        this.updateUIStats();
    }

    createWoodenBookshelf() {
        // Create traditional wooden bookshelf
        const woodTexture = this.createWoodTexture();
        
        // Main shelf platform - original size
        const shelfGeometry = new THREE.BoxGeometry(12, 0.3, 3); // Back to original size
        const woodMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513, // Rich saddle brown
            shininess: 40,
            bumpScale: 0.03,
            reflectivity: 0.2
        });
        
        const mainShelf = new THREE.Mesh(shelfGeometry, woodMaterial);
        mainShelf.position.y = 0.15; // Raised shelf position to align with book bottom
        mainShelf.receiveShadow = true;
        mainShelf.castShadow = true;
        this.scene.add(mainShelf);

        // Back panel with traditional pattern - original size
        const backGeometry = new THREE.BoxGeometry(12.5, 6, 0.2); // Back to original size
        const backMaterial = new THREE.MeshPhongMaterial({
            color: 0x654321, // Rich dark brown
            shininess: 25,
            bumpScale: 0.02
        });
        
        const backPanel = new THREE.Mesh(backGeometry, backMaterial);
        backPanel.position.y = 2.8;
        backPanel.position.z = -1.4;
        backPanel.receiveShadow = true;
        backPanel.castShadow = true;
        this.scene.add(backPanel);

        // Side supports - original size
        const sideGeometry = new THREE.BoxGeometry(0.3, 6, 3); // Back to original size
        const leftSide = new THREE.Mesh(sideGeometry, woodMaterial);
        leftSide.position.x = -6.1;
        leftSide.position.y = 2.8;
        leftSide.castShadow = true;
        leftSide.receiveShadow = true;
        this.scene.add(leftSide);
        
        const rightSide = new THREE.Mesh(sideGeometry, woodMaterial);
        rightSide.position.x = 6.1;
        rightSide.position.y = 2.8;
        rightSide.castShadow = true;
        rightSide.receiveShadow = true;
        this.scene.add(rightSide);

        // Add decorative carved elements
        this.addShelfDecorations();

        // Add traditional Indian carpet/rug under the shelf
        this.createTraditionalRug();
    }

    createWoodTexture() {
        // Simple procedural wood texture (you could replace with actual texture loading)
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // Create wood grain pattern
        context.fillStyle = '#8B4513';
        context.fillRect(0, 0, 512, 512);
        
        // Add grain lines
        context.strokeStyle = '#654321';
        context.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
            context.beginPath();
            context.moveTo(0, i * 25 + Math.random() * 10);
            context.lineTo(512, i * 25 + Math.random() * 10);
            context.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }

    addShelfDecorations() {
        // Add carved Indian motifs on the sides
        const motifGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 6);
        const motifMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700, // Gold
            shininess: 100
        });
        
        // Left side decoration
        const leftMotif = new THREE.Mesh(motifGeometry, motifMaterial);
        leftMotif.position.set(-5.8, 4.5, -1.2);
        leftMotif.rotation.y = Math.PI / 6;
        this.scene.add(leftMotif);
        
        // Right side decoration
        const rightMotif = new THREE.Mesh(motifGeometry, motifMaterial);
        rightMotif.position.set(5.8, 4.5, -1.2);
        rightMotif.rotation.y = -Math.PI / 6;
        this.scene.add(rightMotif);

        // Add small oil lamps on shelf corners
        this.createOilLamps();
    }

    createOilLamps() {
        const lampGeometry = new THREE.ConeGeometry(0.08, 0.15, 8);
        const lampMaterial = new THREE.MeshPhongMaterial({
            color: 0xCD853F, // Peru color for brass
            shininess: 80
        });
        
        // Left lamp
        const leftLamp = new THREE.Mesh(lampGeometry, lampMaterial);
        leftLamp.position.set(-5.5, -0.5, 1.3); // Moved down from 0.5 to -0.5
        this.scene.add(leftLamp);
        
        // Right lamp
        const rightLamp = new THREE.Mesh(lampGeometry, lampMaterial);
        rightLamp.position.set(5.5, -0.5, 1.3); // Moved down from 0.5 to -0.5
        this.scene.add(rightLamp);

        // Add gentle flame glow
        const flameLight1 = new THREE.PointLight(0xFFA500, 0.3, 3);
        flameLight1.position.set(-5.5, -0.35, 1.3); // Adjusted for new lamp height
        this.scene.add(flameLight1);
        
        const flameLight2 = new THREE.PointLight(0xFFA500, 0.3, 3);
        flameLight2.position.set(5.5, -0.35, 1.3); // Adjusted for new lamp height
        this.scene.add(flameLight2);

        // Animate flame flicker
        if (typeof gsap !== 'undefined') {
            gsap.to(flameLight1, {
                intensity: 0.1,
                duration: 1.5,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
            
            gsap.to(flameLight2, {
                intensity: 0.1,
                duration: 1.8,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                delay: 0.3
            });
        }
    }

    createTraditionalRug() {
        // Create a traditional Indian carpet/rug
        const rugGeometry = new THREE.PlaneGeometry(15, 10);
        const rugMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B0000, // Dark red
            shininess: 10,
            transparent: true,
            opacity: 0.8
        });
        
        const rug = new THREE.Mesh(rugGeometry, rugMaterial);
        rug.rotation.x = -Math.PI / 2;
        rug.position.y = -1.5;
        rug.receiveShadow = true;
        this.scene.add(rug);

        // Add pattern border
        const borderGeometry = new THREE.RingGeometry(7, 7.5, 64);
        const borderMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFD700, // Gold border
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.rotation.x = -Math.PI / 2;
        border.position.y = -1.48;
        this.scene.add(border);
    }

    createLibraryEnvironment() {
        // Create library wall with traditional pattern
        const wallGeometry = new THREE.PlaneGeometry(20, 12);
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x8FBC8F, // Dark sea green for traditional wall
            shininess: 10
        });
        
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.z = -10;
        wall.position.y = 3;
        wall.receiveShadow = true;
        this.scene.add(wall);

        // Add "WELCOME TO LIBRARY" text on the wall
        this.createWelcomeText();

        // Add traditional Indian window with lattice work
        this.createTraditionalWindow();

        // Add hanging traditional lamps
        this.createHangingLamps();

        // Create subtle dust particles floating in the air
        this.createDustParticles();
    }

    createTraditionalWindow() {
        // Window frame
        const windowFrameGeometry = new THREE.BoxGeometry(3, 4, 0.1);
        const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x654321, // Dark brown wood
            shininess: 30
        });
        
        const windowFrame = new THREE.Mesh(windowFrameGeometry, frameMaterial);
        windowFrame.position.set(0, 4, -9.5);
        this.scene.add(windowFrame);

        // Window glass with warm light coming through
        const glassGeometry = new THREE.PlaneGeometry(2.8, 3.8);
        const glassMaterial = new THREE.MeshPhongMaterial({
            color: 0xfffaf0, // Warm white
            transparent: true,
            opacity: 0.3,
            emissive: 0xffd700,
            emissiveIntensity: 0.1
        });
        
        const windowGlass = new THREE.Mesh(glassGeometry, glassMaterial);
        windowGlass.position.set(0, 4, -9.4);
        this.scene.add(windowGlass);

        // Lattice pattern
        this.createWindowLattice();
    }

    createWindowLattice() {
        const latticeMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513 // Saddle brown
        });

        // Vertical bars
        for (let i = -1; i <= 1; i++) {
            const barGeometry = new THREE.CylinderGeometry(0.02, 0.02, 3.6, 8);
            const bar = new THREE.Mesh(barGeometry, latticeMaterial);
            bar.position.set(i * 0.7, 4, -9.3);
            this.scene.add(bar);
        }

        // Horizontal bars
        for (let i = -1; i <= 1; i++) {
            const barGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2.6, 8);
            const bar = new THREE.Mesh(barGeometry, latticeMaterial);
            bar.position.set(0, 4 + i * 0.9, -9.3);
            bar.rotation.z = Math.PI / 2;
            this.scene.add(bar);
        }
    }

    createWelcomeText() {
        console.log('🎨 Creating welcome text...');
        
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 256;
        
        // Clear canvas with transparent background
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set text style
        context.fillStyle = '#FFD700'; // Bright gold color
        context.font = 'bold 64px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Add text outline for better visibility
        context.strokeStyle = '#8B4513'; // Dark brown outline
        context.lineWidth = 4;
        context.strokeText('WELCOME TO LIBRARY', canvas.width / 2, canvas.height / 2);
        
        // Fill the text
        context.fillText('WELCOME TO LIBRARY', canvas.width / 2, canvas.height / 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Create material with the text texture
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide
        });
        
        // Create plane geometry for the text
        const textGeometry = new THREE.PlaneGeometry(12, 3);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        // Position the text higher and more visible on the wall
        textMesh.position.set(0, 7, -9.5); // Higher position, closer to camera
        
        this.scene.add(textMesh);
        console.log('✅ Welcome text added to scene');
        
        // Add subtle glow animation
        if (typeof gsap !== 'undefined') {
            gsap.to(textMaterial, {
                opacity: 0.8,
                duration: 3,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
        }
    }

    createHangingLamps() {
        const lampPositions = [
            [-3, 3, -2],    // Moved down from 5 to 3
            [3, 3, -2],     // Moved down from 5 to 3  
            [0, 4, 1]       // Moved down from 6 to 4 (main central lamp)
        ];

        lampPositions.forEach((pos, index) => {
            const isCentralLamp = index === 2;
            
            // Lamp shade with different materials for central lamp
            const lampGeometry = new THREE.ConeGeometry(isCentralLamp ? 0.5 : 0.3, isCentralLamp ? 1.0 : 0.6, 8);
            const lampMaterial = new THREE.MeshPhongMaterial({
                color: isCentralLamp ? 0xFFD700 : 0xCD853F, // Gold for central, brass for others
                shininess: 100,
                emissive: isCentralLamp ? 0xFFD700 : 0x000000,
                emissiveIntensity: isCentralLamp ? 0.2 : 0
            });
            
            const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
            lamp.position.set(...pos);
            this.scene.add(lamp);

            // Glowing orb inside the central lamp
            if (isCentralLamp) {
                const orbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
                const orbMaterial = new THREE.MeshLambertMaterial({
                    color: 0xFFFFFFF,
                    emissive: 0xFFD700,
                    emissiveIntensity: 1.0,
                    transparent: true,
                    opacity: 0.8
                });
                
                const lightOrb = new THREE.Mesh(orbGeometry, orbMaterial);
                lightOrb.position.set(pos[0], pos[1] - 0.2, pos[2]);
                this.scene.add(lightOrb);

                // Animate the orb glow
                if (typeof gsap !== 'undefined') {
                    gsap.to(orbMaterial, {
                        emissiveIntensity: 0.3,
                        duration: 1.5,
                        yoyo: true,
                        repeat: -1,
                        ease: "sine.inOut"
                    });
                }
            }

            // Chain or rope
            const chainGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1.5, 4);
            const chainMaterial = new THREE.MeshPhongMaterial({
                color: 0x654321
            });
            
            const chain = new THREE.Mesh(chainGeometry, chainMaterial);
            chain.position.set(pos[0], pos[1] + 1, pos[2]);
            this.scene.add(chain);

            // Enhanced bright light for central lamp, normal for others
            const lampLight = new THREE.PointLight(
                0xffd700, 
                isCentralLamp ? 2.0 : 0.4, // Much brighter central light
                isCentralLamp ? 15 : 5      // Wider reach for central light
            );
            lampLight.position.set(pos[0], pos[1] - 0.2, pos[2]);
            lampLight.castShadow = true;
            
            if (isCentralLamp) {
                lampLight.shadow.mapSize.width = 2048;
                lampLight.shadow.mapSize.height = 2048;
                lampLight.shadow.camera.near = 0.1;
                lampLight.shadow.camera.far = 20;
            }
            
            this.scene.add(lampLight);

            // Add glowing particle effect around central lamp
            if (isCentralLamp) {
                this.createLampGlowEffect(pos[0], pos[1] - 0.2, pos[2]);
            }

            // Gentle swaying animation
            if (typeof gsap !== 'undefined') {
                gsap.to(lamp.rotation, {
                    z: (Math.random() - 0.5) * 0.1,
                    duration: 3 + index,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });
                
                gsap.to(chain.rotation, {
                    z: (Math.random() - 0.5) * 0.1,
                    duration: 3 + index,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });

                // Animate central lamp light intensity
                if (isCentralLamp) {
                    gsap.to(lampLight, {
                        intensity: 1.2,
                        duration: 2,
                        yoyo: true,
                        repeat: -1,
                        ease: "sine.inOut"
                    });
                }
            }
        });
    }

    createLampGlowEffect(x, y, z) {
        // Create glowing particles around the lamp
        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = x + (Math.random() - 0.5) * 2;     // x
            positions[i + 1] = y + (Math.random() - 0.5) * 2; // y  
            positions[i + 2] = z + (Math.random() - 0.5) * 2; // z
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xFFD700,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const glowParticles = new THREE.Points(particles, particleMaterial);
        this.scene.add(glowParticles);

        // Animate the glow particles
        if (typeof gsap !== 'undefined') {
            gsap.to(glowParticles.rotation, {
                y: Math.PI * 2,
                duration: 10,
                repeat: -1,
                ease: "none"
            });
            
            gsap.to(particleMaterial, {
                opacity: 0.2,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
        }
    }

    createDustParticles() {
        // Create floating dust particles for atmosphere
        const dustGeometry = new THREE.BufferGeometry();
        const dustCount = 200;
        const positions = new Float32Array(dustCount * 3);
        
        for (let i = 0; i < dustCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;     // x
            positions[i + 1] = Math.random() * 10;         // y
            positions[i + 2] = (Math.random() - 0.5) * 15; // z
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const dustMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
        this.scene.add(dustParticles);

        // Animate dust particles floating
        if (typeof gsap !== 'undefined') {
            gsap.to(dustParticles.rotation, {
                y: Math.PI * 2,
                duration: 60,
                repeat: -1,
                ease: "none"
            });
        }
    }

    createRealisticBook(category, index) {
        const bookGroup = new THREE.Group();
        const categoryData = this.kolamData[category];
        
        // Enhanced book dimensions - proportional width and height
        const width = 1.6;  // Increased width to be proportional to height
        const height = 3.0; // Increased height significantly
        const depth = 0.18; // Slightly increased from original 0.15
        const pageThickness = 0.15; // Slightly increased from original 0.12
        
        // Create book cover with rounded edges
        const coverGeometry = new THREE.BoxGeometry(width, height, depth);
        
        // Apply bevel to make it look more realistic
        const coverEdges = new THREE.EdgesGeometry(coverGeometry);
        
        // Choose book cover material based on category
        const bookMaterials = this.getBookMaterials(category);
        
        // Main book cover
        const bookCover = new THREE.Mesh(coverGeometry, bookMaterials.cover);
        bookCover.castShadow = true;
        bookCover.receiveShadow = true;
        bookGroup.add(bookCover);

        // Create enhanced book pages with better materials
        const pagesGeometry = new THREE.BoxGeometry(width - 0.04, height - 0.04, pageThickness);
        const pagesMaterial = new THREE.MeshPhongMaterial({
            color: 0xfaf0e6, // Warm linen color for pages
            shininess: 5,
            transparent: true,
            opacity: 0.95,
            // Add subtle paper texture
            bumpScale: 0.001
        });
        
        const pages = new THREE.Mesh(pagesGeometry, pagesMaterial);
        pages.position.z = -0.02; // Slightly behind the cover
        pages.castShadow = true;
        pages.receiveShadow = true;
        bookGroup.add(pages);

        // Add individual page details for more realism
        this.addPageDetails(bookGroup, width, height, pageThickness);

        // Add book spine details
        this.createBookSpine(bookGroup, category, width, height, depth);

        // Add subtle book binding
        this.createBookBinding(bookGroup, width, height, depth);

        // Add decorative corner elements
        this.createBookCorners(bookGroup, category, width, height);

        // Create embossed title on cover
        this.createBookTitle(bookGroup, category, width, height);

        // Add text to spine
        this.createSpineText(bookGroup, category, width, height, depth);

        // Add aging effects based on category
        this.addBookAging(bookGroup, category, index);

        // Store metadata
        bookGroup.userData = {
            category: category,
            index: index,
            originalPosition: new THREE.Vector3(),
            isSelected: false,
            bookType: this.getBookType(category),
            edges: null // Will be set later
        };

        return bookGroup;
    }

    getBookMaterials(category) {
        const materials = {
            'Festival Kolams': {
                cover: new THREE.MeshPhysicalMaterial({
                    color: 0x8B4513, // Rich saddle brown for traditional look
                    roughness: 0.4,
                    metalness: 0.1,
                    clearcoat: 0.8,
                    clearcoatRoughness: 0.2,
                    reflectivity: 0.5,
                    // Enhanced leather-like texture
                    bumpScale: 0.03,
                    // Add subtle iridescence for premium look
                    iridescence: 0.3,
                    iridescenceIOR: 1.3,
                    // Add subtle emission for warmth
                    emissive: 0x2a1810,
                    emissiveIntensity: 0.05
                }),
                accent: 0xFFD700, // Bright gold
                spine: 0xB8860B, // Dark goldenrod
                binding: 0x8B4513 // Matching brown
            },
            'Regional Kolams': {
                cover: new THREE.MeshPhysicalMaterial({
                    color: 0x2E8B57, // Deep sea green for regional diversity
                    roughness: 0.3,
                    metalness: 0.2,
                    clearcoat: 0.9,
                    clearcoatRoughness: 0.1,
                    reflectivity: 0.6,
                    // Enhanced fabric-like texture
                    bumpScale: 0.02,
                    // Add subtle shimmer
                    iridescence: 0.2,
                    iridescenceIOR: 1.2,
                    // Subtle green glow
                    emissive: 0x1a4d35,
                    emissiveIntensity: 0.03
                }),
                accent: 0xC0C0C0, // Bright silver
                spine: 0x708090, // Slate gray
                binding: 0x2F4F4F // Dark slate gray
            },
            'AI-Generated Kolams': {
                cover: new THREE.MeshPhysicalMaterial({
                    color: 0x483D8B, // Rich dark slate blue for modern tech
                    roughness: 0.15,
                    metalness: 0.4,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.05,
                    emissive: 0x2a2a5a,
                    emissiveIntensity: 0.2,
                    reflectivity: 0.8,
                    // Smooth modern texture with holographic effect
                    bumpScale: 0.01,
                    iridescence: 0.5,
                    iridescenceIOR: 1.5,
                    // Enhanced futuristic glow
                    transmission: 0.1,
                    thickness: 0.5
                }),
                accent: 0x00FFFF, // Bright cyan
                spine: 0x4169E1, // Royal blue
                binding: 0x191970 // Midnight blue
            }
        };

        return materials[category] || materials['Regional Kolams'];
    }

    createEnhancedBookSpine(bookGroup, category, width, height, depth, materials) {
        // Main spine with enhanced material
        const spineWidth = 0.1;
        const spineGeometry = new THREE.BoxGeometry(spineWidth, height * 0.98, depth + 0.02);
        
        const spineMaterial = new THREE.MeshPhysicalMaterial({
            color: materials.spine,
            roughness: 0.2,
            metalness: 0.7,
            emissive: materials.accent,
            emissiveIntensity: 0.1,
            clearcoat: 0.9,
            reflectivity: 0.8
        });
        
        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        spine.position.x = -width/2 + spineWidth/2;
        spine.castShadow = true;
        spine.receiveShadow = true;
        bookGroup.add(spine);

        // Decorative spine ridges with better materials
        for (let i = 0; i < 7; i++) {
            const ridgeGeometry = new THREE.BoxGeometry(spineWidth + 0.015, 0.015, depth + 0.04);
            const ridgeMaterial = new THREE.MeshPhysicalMaterial({
                color: materials.accent,
                roughness: 0.1,
                metalness: 0.9,
                emissiveIntensity: 0.3,
                emissive: materials.accent
            });
            
            const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
            ridge.position.set(-width/2 + spineWidth/2, -height/2 + 0.3 + i * (height - 0.6)/6, 0);
            bookGroup.add(ridge);
        }
    }

    createBookPages(bookGroup, width, height, depth) {
        // Create main book pages with enhanced realistic appearance
        const pageGeometry = new THREE.BoxGeometry(width * 0.92, height * 0.94, depth * 0.75);
        const pageMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xfff8f0, // Warm off-white cream color
            roughness: 0.8,
            metalness: 0.0,
            clearcoat: 0.1,
            clearcoatRoughness: 0.9,
            transparent: true,
            opacity: 0.95,
            // Add subtle paper texture
            bumpScale: 0.002,
            // Subtle transmission for paper-like quality
            transmission: 0.05,
            thickness: 0.1,
            // Very subtle paper glow
            emissive: 0xfff8f0,
            emissiveIntensity: 0.02
        });
        
        const pages = new THREE.Mesh(pageGeometry, pageMaterial);
        pages.position.set(-0.03, 0, 0); // Slightly offset from cover
        pages.castShadow = true;
        pages.receiveShadow = true;
        bookGroup.add(pages);

        // Create layered page effect for depth
        for (let layer = 0; layer < 3; layer++) {
            const layerGeometry = new THREE.BoxGeometry(
                width * (0.92 - layer * 0.01), 
                height * (0.94 - layer * 0.01), 
                depth * 0.1
            );
            const layerMaterial = new THREE.MeshLambertMaterial({
                color: 0xfff5ee, // Slightly different shade for each layer
                transparent: true,
                opacity: 0.7 - layer * 0.1
            });
            
            const pageLayer = new THREE.Mesh(layerGeometry, layerMaterial);
            pageLayer.position.set(-0.05 - layer * 0.02, layer * 0.005, depth * 0.15 * layer);
            pageLayer.castShadow = true;
            bookGroup.add(pageLayer);
        }

        // Enhanced page edge details with golden edges
        const edgeCount = 8;
        for (let i = 0; i < edgeCount; i++) {
            const edgeGeometry = new THREE.BoxGeometry(0.003, height * 0.94, depth * 0.08);
            const edgeMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffd700, // Golden page edges
                roughness: 0.3,
                metalness: 0.6,
                emissive: 0xffd700,
                emissiveIntensity: 0.1,
                transparent: true,
                opacity: 0.8
            });
            
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.position.set(
                width/2 - 0.08 + i * 0.015, 
                (Math.random() - 0.5) * 0.02, 
                depth/2 - i * 0.025
            );
            edge.castShadow = true;
            bookGroup.add(edge);
        }

        // Add bookmark ribbon
        const bookmarkGeometry = new THREE.BoxGeometry(0.15, height * 0.6, 0.01);
        const bookmarkMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8b0000, // Deep red bookmark
            roughness: 0.6,
            metalness: 0.1,
            clearcoat: 0.7,
            emissive: 0x4a0000,
            emissiveIntensity: 0.1
        });
        
        const bookmark = new THREE.Mesh(bookmarkGeometry, bookmarkMaterial);
        bookmark.position.set(width * 0.3, height * 0.1, depth/2 + 0.005);
        bookmark.castShadow = true;
        bookGroup.add(bookmark);

        // Add subtle page text simulation (small dark rectangles)
        for (let i = 0; i < 6; i++) {
            const textGeometry = new THREE.PlaneGeometry(width * 0.6, 0.08);
            const textMaterial = new THREE.MeshBasicMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.4
            });
            
            const textLine = new THREE.Mesh(textGeometry, textMaterial);
            textLine.position.set(
                -0.1, 
                height * 0.2 - i * 0.12, 
                depth/2 + 0.001
            );
            textLine.rotation.x = -Math.PI / 2;
            bookGroup.add(textLine);
        }
    }

    createBookCornerDecorations(bookGroup, category, width, height, depth, materials) {
        // Enhanced corner protectors
        const cornerSize = 0.12;
        const cornerGeometry = new THREE.BoxGeometry(cornerSize, cornerSize, 0.03);
        
        const cornerMaterial = new THREE.MeshPhysicalMaterial({
            color: materials.accent,
            roughness: 0.1,
            metalness: 0.9,
            emissive: materials.accent,
            emissiveIntensity: 0.2,
            clearcoat: 1.0
        });
        
        // Add corners at all four edges
        const positions = [
            [-width/2 + cornerSize/2, height/2 - cornerSize/2],
            [-width/2 + cornerSize/2, -height/2 + cornerSize/2],
            [width/2 - cornerSize/2, height/2 - cornerSize/2],
            [width/2 - cornerSize/2, -height/2 + cornerSize/2]
        ];
        
        positions.forEach(([x, y]) => {
            const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
            corner.position.set(x, y, depth/2 + 0.01);
            bookGroup.add(corner);
        });
    }

    createBookTitleEmbossing(bookGroup, category, width, height, materials) {
        // Create embossed title area
        const titleGeometry = new THREE.BoxGeometry(width * 0.6, height * 0.2, 0.01);
        const titleMaterial = new THREE.MeshPhysicalMaterial({
            color: materials.accent,
            roughness: 0.3,
            metalness: 0.6,
            emissive: materials.accent,
            emissiveIntensity: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const titleEmboss = new THREE.Mesh(titleGeometry, titleMaterial);
        titleEmboss.position.set(0, height * 0.3, depth/2 + 0.005);
        bookGroup.add(titleEmboss);

        // Add decorative border around title
        const borderGeometry = new THREE.RingGeometry(width * 0.32, width * 0.35, 16);
        const borderMaterial = new THREE.MeshPhysicalMaterial({
            color: materials.accent,
            roughness: 0.2,
            metalness: 0.8,
            emissive: materials.accent,
            emissiveIntensity: 0.15
        });
        
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(0, height * 0.3, depth/2 + 0.008);
        bookGroup.add(border);
    }

    createBookSpine(bookGroup, category, width, height, depth) {
        // Create enhanced spine decoration with multiple elements
        const spineWidth = 0.08; // Increased width
        const spineGeometry = new THREE.BoxGeometry(spineWidth, height * 0.95, depth + 0.02);
        
        const materials = this.getBookMaterials(category);
        const spineMaterial = new THREE.MeshPhysicalMaterial({
            color: materials.accent,
            roughness: 0.1,
            metalness: 0.9,
            emissive: materials.accent,
            emissiveIntensity: 0.2,
            clearcoat: 0.8,
            reflectivity: 0.7
        });
        
        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        spine.position.x = -width/2 + spineWidth/2;
        spine.castShadow = true;
        spine.receiveShadow = true;
        bookGroup.add(spine);

        // Store null edges in userData (removed visible edges)
        bookGroup.userData.edges = null;

        // Add decorative spine ridges
        for (let i = 0; i < 5; i++) {
            const ridgeGeometry = new THREE.BoxGeometry(spineWidth + 0.01, 0.02, depth + 0.03);
            const ridgeMaterial = new THREE.MeshPhongMaterial({
                color: materials.accent,
                shininess: 100
            });
            
            const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
            ridge.position.set(-width/2 + spineWidth/2, -height/3 + i * height/6, 0);
            bookGroup.add(ridge);
        }
    }

    createBookBinding(bookGroup, width, height, depth) {
        // Create binding stitches or metal rings
        const bindingGeometry = new THREE.CylinderGeometry(0.02, 0.02, width * 0.8, 8);
        const bindingMaterial = new THREE.MeshPhongMaterial({
            color: 0x654321,
            shininess: 30
        });
        
        // Add multiple binding elements
        for (let i = 0; i < 3; i++) {
            const binding = new THREE.Mesh(bindingGeometry, bindingMaterial);
            binding.rotation.z = Math.PI / 2;
            binding.position.y = -height/3 + i * height/3;
            binding.position.z = depth/2 + 0.01;
            bookGroup.add(binding);
        }
    }

    createBookCorners(bookGroup, category, width, height) {
        // Add metallic corner protectors
        const cornerSize = 0.08;
        const cornerGeometry = new THREE.BoxGeometry(cornerSize, cornerSize, 0.02);
        
        const materials = this.getBookMaterials(category);
        const cornerMaterial = new THREE.MeshPhongMaterial({
            color: materials.accent,
            shininess: 100
        });
        
        // Add corners at all four corners of the front cover
        const positions = [
            [-width/2 + cornerSize/2, height/2 - cornerSize/2],
            [width/2 - cornerSize/2, height/2 - cornerSize/2],
            [-width/2 + cornerSize/2, -height/2 + cornerSize/2],
            [width/2 - cornerSize/2, -height/2 + cornerSize/2]
        ];
        
        positions.forEach(([x, y]) => {
            const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
            corner.position.set(x, y, 0.08);
            bookGroup.add(corner);
        });
    }

    createBookTitle(bookGroup, category, width, height) {
        // Create simple embossed title area without text
        const titleGeometry = new THREE.BoxGeometry(width * 0.8, height * 0.3, 0.01);
        
        const materials = this.getBookMaterials(category);
        const titleMaterial = new THREE.MeshPhongMaterial({
            color: materials.accent,
            transparent: true,
            opacity: 0.8,
            emissive: materials.accent,
            emissiveIntensity: 0.2
        });
        
        const titlePlate = new THREE.Mesh(titleGeometry, titleMaterial);
        titlePlate.position.y = height * 0.1;
        titlePlate.position.z = 0.08;
        bookGroup.add(titlePlate);

        // Add category icon as a geometric shape
        const iconGeometry = this.getCategoryIconGeometry(category);
        if (iconGeometry) {
            const iconMaterial = new THREE.MeshPhongMaterial({
                color: materials.accent,
                emissive: materials.accent,
                emissiveIntensity: 0.3
            });
            
            const icon = new THREE.Mesh(iconGeometry, iconMaterial);
            icon.position.y = height * 0.2;
            icon.position.z = 0.09;
            bookGroup.add(icon);
        }
    }

    getCategoryIconGeometry(category) {
        switch(category) {
            case 'Festival Kolams':
                // Star shape for festivals
                return new THREE.SphereGeometry(0.08, 8, 6);
            case 'Regional Kolams':
                // Octagon for regional diversity
                return new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8);
            case 'AI-Generated Kolams':
                // Cube for digital/tech
                return new THREE.BoxGeometry(0.1, 0.1, 0.02);
            default:
                return null;
        }
    }

    addPageDetails(bookGroup, width, height, pageThickness) {
        // Add subtle page edge details
        const pageEdgeGeometry = new THREE.BoxGeometry(width - 0.03, height - 0.03, 0.005);
        const pageEdgeMaterial = new THREE.MeshPhongMaterial({
            color: 0xf0e68c, // Khaki for page edges
            shininess: 2
        });

        // Create multiple page layers for depth
        for (let i = 0; i < 3; i++) {
            const pageEdge = new THREE.Mesh(pageEdgeGeometry, pageEdgeMaterial);
            pageEdge.position.set(0.01 + i * 0.005, 0, -0.05 - i * 0.01);
            bookGroup.add(pageEdge);
        }

        // Add page separators/bookmarks
        const separatorGeometry = new THREE.PlaneGeometry(0.02, height - 0.1);
        const separatorMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6347, // Tomato red bookmark
            shininess: 20,
            transparent: true,
            opacity: 0.8
        });

        const separator = new THREE.Mesh(separatorGeometry, separatorMaterial);
        separator.position.set(width/2 - 0.05, 0.3, 0.01);
        separator.rotation.y = Math.PI / 2;
        bookGroup.add(separator);
    }

    createSpineText(bookGroup, category, width, height, depth) {
        // Create canvas for text rendering
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        // Set text properties
        context.fillStyle = '#FFD700'; // Gold text
        context.font = 'bold 24px serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Add background
        const materials = this.getBookMaterials(category);
        context.fillStyle = this.colorToRgb(materials.accent);
        context.fillRect(0, 0, 512, 128);
        
        // Add text
        context.fillStyle = '#FFFFFF';
        context.fillText(category.toUpperCase(), 256, 40);
        
        // Add subtitle
        context.font = '16px serif';
        const subtitles = {
            'Festival Kolams': 'Sacred Celebrations',
            'Regional Kolams': 'Cultural Heritage', 
            'AI-Generated Kolams': 'Digital Innovation'
        };
        context.fillText(subtitles[category] || 'Traditional Arts', 256, 80);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create spine text geometry
        const textGeometry = new THREE.PlaneGeometry(height * 0.8, 0.3);
        const textMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        
        const spineText = new THREE.Mesh(textGeometry, textMaterial);
        spineText.rotation.z = Math.PI / 2; // Rotate to be vertical on spine
        spineText.rotation.y = Math.PI / 2; // Face outward
        spineText.position.x = -width/2 - 0.01;
        spineText.position.y = 0;
        spineText.position.z = 0;
        
        bookGroup.add(spineText);
    }

    addBookAging(bookGroup, category, index) {
        // Different aging effects based on category and book type
        const agingLevel = {
            'Festival Kolams': 0.8, // Very aged, ancient look
            'Regional Kolams': 0.5,  // Moderately aged
            'AI-Generated Kolams': 0.1 // Minimal aging, modern look
        };
        
        const aging = agingLevel[category] || 0.3;
        
        // Find the main book cover
        const bookCover = bookGroup.children.find(child => 
            child.geometry && child.geometry.type === 'BoxGeometry' && child.material
        );
        
        if (bookCover && aging > 0.2) {
            // Add wear and tear for older books
            const originalColor = bookCover.material.color.getHex();
            
            // Darken the color slightly for aging
            bookCover.material.color.multiplyScalar(1 - aging * 0.3);
            
            // Add slight rotation for worn books
            bookGroup.rotation.z += (Math.random() - 0.5) * aging * 0.05;
            
            // Slightly adjust height for wear
            if (aging > 0.6) {
                bookGroup.scale.y *= (1 - aging * 0.05);
            }
        }

        // Add variation in book thickness
        const thicknessVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        bookGroup.scale.z *= thicknessVariation;

        // Add slight height variation
        const heightVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        bookGroup.scale.y *= heightVariation;

        // Add bookmarks or ribbons for some books
        if (Math.random() > 0.7) {
            this.addBookmark(bookGroup, category);
        }
    }

    addBookmark(bookGroup, category) {
        // Create a small bookmark ribbon
        const ribbonGeometry = new THREE.PlaneGeometry(0.05, 0.8);
        
        const ribbonColors = {
            'Festival Kolams': 0xFF6347, // Tomato red
            'Regional Kolams': 0x32CD32,  // Lime green
            'AI-Generated Kolams': 0x1E90FF // Dodger blue
        };
        
        const ribbonMaterial = new THREE.MeshPhongMaterial({
            color: ribbonColors[category] || 0xFF6347,
            shininess: 50,
            transparent: true,
            opacity: 0.9
        });
        
        const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
        ribbon.position.set(0.3, 0.5, 0.08); // Sticking out from top
        ribbon.rotation.z = 0.1; // Slight angle
        
        bookGroup.add(ribbon);

        // Add gentle flutter animation
        if (typeof gsap !== 'undefined') {
            gsap.to(ribbon.rotation, {
                z: ribbon.rotation.z + 0.05,
                duration: 2 + Math.random(),
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
        }
    }

    colorToRgb(hex) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgb(${r},${g},${b})`;
    }

    getBookType(category) {
        const types = {
            'Festival Kolams': 'ancient_manuscript',
            'Regional Kolams': 'traditional_book',
            'AI-Generated Kolams': 'modern_digital'
        };
        return types[category] || 'traditional_book';
    }

    getCategoryColor(category) {
        const colors = {
            'Festival Kolams': 0xf472b6,      // Hot Pink 💗
            'Regional Kolams': 0x00f5ff,      // Electric Cyan 💠
            'AI-Generated Kolams': 0x8b5cf6,  // Violet 💜
            'all': 0x84cc16                   // Lime Green 💚
        };
        return colors[category] || 0x84cc16;
    }

    animateRealisticBook(book, index) {
        if (typeof gsap === 'undefined') return;
        
        // Very subtle breathing animation - like a book is alive
        gsap.to(book.position, {
            y: book.position.y + 0.02, // Much smaller movement
            duration: 4 + (index * 0.5),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });

        // Gentle sway like books on a shelf might naturally move
        gsap.to(book.rotation, {
            z: (Math.random() - 0.5) * 0.02, // Very subtle tilt
            duration: 6 + (index * 0.3),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });

        // Add random micro-movements for liveliness
        gsap.to(book.rotation, {
            y: (Math.random() - 0.5) * 0.01,
            duration: 8 + (index * 0.2),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: Math.random() * 2
        });
    }

    updateUIStats() {
        try {
            const totalKolams = Object.values(this.kolamData).reduce((total, category) => {
                return total + (category.kolams ? category.kolams.length : 0);
            }, 0);

            const totalKolamsEl = document.getElementById('totalKolams');
            const totalCategoriesEl = document.getElementById('totalCategories');
            const currentViewEl = document.getElementById('currentView');

            if (totalKolamsEl) totalKolamsEl.textContent = totalKolams;
            if (totalCategoriesEl) totalCategoriesEl.textContent = Object.keys(this.kolamData).length;
            if (currentViewEl) currentViewEl.textContent = '3D Gallery';

            console.log(`📊 Stats updated: ${totalKolams} Kolams, ${Object.keys(this.kolamData).length} Categories`);
        } catch (error) {
            console.warn('Could not update UI stats:', error);
        }
    }

    createShelf() {
        // Main shelf
        const shelfGeometry = new THREE.BoxGeometry(12, 0.2, 3);
        const shelfMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2a2a3e,
            transparent: true,
            opacity: 0.8
        });
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.y = 0;
        shelf.receiveShadow = true;
        this.scene.add(shelf);
        
        // Back panel
        const backGeometry = new THREE.BoxGeometry(12, 6, 0.2);
        const backMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x1a1a2e,
            transparent: true,
            opacity: 0.9
        });
        const backPanel = new THREE.Mesh(backGeometry, backMaterial);
        backPanel.position.y = 3;
        backPanel.position.z = -1.4;
        this.scene.add(backPanel);
        
        // Side panels
        const sideGeometry = new THREE.BoxGeometry(0.2, 6, 3);
        const sideMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2a2a3e,
            transparent: true,
            opacity: 0.7
        });
        
        const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
        leftSide.position.x = -6;
        leftSide.position.y = 3;
        this.scene.add(leftSide);
        
        const rightSide = new THREE.Mesh(sideGeometry, sideMaterial);
        rightSide.position.x = 6;
        rightSide.position.y = 3;
        this.scene.add(rightSide);
    }

    createBook(category, index) {
        const bookGroup = new THREE.Group();
        
        // Book dimensions with slight variation for realism
        const width = 1.8 + (Math.random() - 0.5) * 0.2;
        const height = 2.5 + (Math.random() - 0.5) * 0.3;
        const depth = 0.3 + (Math.random() - 0.5) * 0.1;
        
        // Get enhanced materials
        const materials = this.getBookMaterials(category);
        
        // Main book cover
        const bookGeometry = new THREE.BoxGeometry(width, height, depth);
        const book = new THREE.Mesh(bookGeometry, materials.cover);
        book.castShadow = true;
        book.receiveShadow = true;
        bookGroup.add(book);
        
        // Enhanced glow effect with better colors
        const glowGeometry = new THREE.BoxGeometry(width * 1.05, height * 1.02, depth * 1.05);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: materials.accent,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.name = 'glow';
        bookGroup.add(glow);
        
        // Enhanced book spine with better materials
        this.createEnhancedBookSpine(bookGroup, category, width, height, depth, materials);
        
        // Add book pages effect
        this.createBookPages(bookGroup, width, height, depth);
        
        // Add decorative corner elements
        this.createBookCornerDecorations(bookGroup, category, width, height, depth, materials);
        
        // Add book title embossing
        this.createBookTitleEmbossing(bookGroup, category, width, height, materials);
        
        // Store category information and dimensions
        bookGroup.userData = {
            category: category,
            index: index,
            originalRotation: bookGroup.rotation.clone(),
            isHovered: false,
            dimensions: { width, height, depth },
            materials: materials
        };
        
        return bookGroup;
    }

    setupLighting() {
        console.log('💡 Setting up warm, realistic library lighting...');
        
        // Warm ambient light for cozy library atmosphere
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light simulating sunlight through library window
        const sunLight = new THREE.DirectionalLight(0xfffaf0, 0.8); // Warm white
        sunLight.position.set(5, 10, 3);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 50;
        sunLight.shadow.camera.left = -12;
        sunLight.shadow.camera.right = 12;
        sunLight.shadow.camera.top = 12;
        sunLight.shadow.camera.bottom = -12;
        this.scene.add(sunLight);
        
        // Soft fill light from the opposite side
        const fillLight = new THREE.DirectionalLight(0xfff8dc, 0.3); // Cornsilk
        fillLight.position.set(-3, 4, 2);
        this.scene.add(fillLight);

        // Reading lamp style point lights
        const readingLamp1 = new THREE.PointLight(0xffd700, 0.6, 8); // Golden
        readingLamp1.position.set(-4, 3, 2);
        this.scene.add(readingLamp1);
        
        const readingLamp2 = new THREE.PointLight(0xffd700, 0.6, 8);
        readingLamp2.position.set(4, 3, 2);
        this.scene.add(readingLamp2);

        // Subtle accent lights for book highlighting
        const bookAccentLight1 = new THREE.SpotLight(0xfff8dc, 0.4, 6, Math.PI / 8, 0.2);
        bookAccentLight1.position.set(-2, 4, 3);
        bookAccentLight1.target.position.set(-2, 0, 0);
        this.scene.add(bookAccentLight1);
        this.scene.add(bookAccentLight1.target);
        
        const bookAccentLight2 = new THREE.SpotLight(0xfff8dc, 0.4, 6, Math.PI / 8, 0.2);
        bookAccentLight2.position.set(2, 4, 3);
        bookAccentLight2.target.position.set(2, 0, 0);
        this.scene.add(bookAccentLight2);
        this.scene.add(bookAccentLight2.target);

        // Subtle warm glow from traditional oil lamps (created in bookshelf)
        const traditionalGlow = new THREE.PointLight(0xffa500, 0.2, 4);
        traditionalGlow.position.set(0, 1, 1.5);
        this.scene.add(traditionalGlow);

        // Very subtle flickering for the traditional lamps
        if (typeof gsap !== 'undefined') {
            gsap.to(traditionalGlow, {
                intensity: 0.1,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
            
            // Gentle variation in sunlight to simulate clouds
            gsap.to(sunLight, {
                intensity: 0.6,
                duration: 8,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
        }

        console.log('✨ Warm library lighting setup complete!');
    }

    setupControls() {
        // Check if OrbitControls is available
        if (typeof THREE.OrbitControls === 'undefined') {
            console.error('OrbitControls not available, camera will be static');
            return;
        }
        
        try {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 15;
            this.controls.minDistance = 3;
            this.controls.maxPolarAngle = Math.PI / 2;
            this.controls.enablePan = false;
            console.log('OrbitControls initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OrbitControls:', error);
        }
    }

    setupEventListeners() {
        console.log('🎮 Setting up event listeners...');
        
        // Mouse events for book interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Safely add canvas event listeners
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
            this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
            console.log('✅ Canvas event listeners added');
        } else {
            console.warn('⚠️ Renderer domElement not available for event listeners');
        }
        
        // Safely add UI event listeners
        const closeBookBtn = document.getElementById('close-book');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        
        if (closeBookBtn) {
            closeBookBtn.addEventListener('click', () => this.closeBook());
        }
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.prevPage());
        }
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.nextPage());
        }
        
        // Add search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchKolams(e.target.value);
                }, 300);
            });
            console.log('✅ Search functionality added');
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.resetCamera();
            }
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                if (searchInput) searchInput.focus();
            }
            // Category shortcuts
            if (e.key >= '1' && e.key <= '4') {
                const categories = ['all', 'Festival Kolams', 'Regional Kolams', 'AI-Generated Kolams'];
                this.filterByCategory(categories[parseInt(e.key) - 1]);
            }
        });
        
        console.log('🎮 Event listeners setup complete');
    }
    
    resetCamera() {
        if (this.controls) {
            this.controls.reset();
            console.log('📷 Camera reset to default position');
        }
    }

    setupBookInteractions() {
        // Book interactions are handled through raycasting and direct mesh manipulation
        console.log('📚 Book interactions ready');
    }

    onMouseMove(event) {
        if (this.bookAnimationInProgress) return;
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.books, true);
        
        if (intersects.length > 0) {
            const book = intersects[0].object.parent;
            this.hoverBook(book);
        } else {
            this.unhoverAllBooks();
        }
    }

    onMouseClick(event) {
        console.log('🖱️ Mouse click detected. Animation state:', this.bookAnimationInProgress, 'Book open state:', this.isBookOpen);
        
        if (this.bookAnimationInProgress) {
            console.log('🚫 Book animation in progress, ignoring click. Time:', new Date().toISOString());
            return;
        }
        
        // Calculate mouse position from the click event
        const rect = this.renderer.domElement.getBoundingClientRect();
        const clickMouse = {
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: -((event.clientY - rect.top) / rect.height) * 2 + 1
        };
        
        console.log('🖱️ Mouse clicked at:', clickMouse.x, clickMouse.y);
        console.log('📚 Available books:', this.books.length);
        console.log('📚 Books array:', this.books.map(b => b.userData.category));
        
        this.raycaster.setFromCamera(clickMouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.books, true);
        
        console.log(`🎯 Found ${intersects.length} intersections with books`);
        
        if (intersects.length > 0) {
            // Log all intersections for debugging
            intersects.forEach((intersect, i) => {
                console.log(`Intersection ${i}:`, {
                    objectType: intersect.object.type,
                    distance: intersect.distance,
                    hasParentBook: !!intersect.object.userData?.parentBook,
                    parentCategory: intersect.object.userData?.category,
                    isClickZone: intersect.object.userData?.isClickZone,
                    directCategory: intersect.object.parent?.userData?.category
                });
            });
            
            // Find the book from the intersection
            let book = null;
            
            // Method 1: Check if the object has a parentBook reference (including click zones)
            if (intersects[0].object.userData?.parentBook) {
                book = intersects[0].object.userData.parentBook;
                console.log('📖 Found book via parentBook reference:', book.userData.category);
            }
            // Method 2: Check if the intersected object IS a book (direct hit)
            else if (intersects[0].object.userData?.category && this.books.includes(intersects[0].object)) {
                book = intersects[0].object;
                console.log('📖 Found book via direct hit:', book.userData.category);
            }
            // Method 3: Traverse up the hierarchy to find the book group
            else {
                let currentObject = intersects[0].object;
                while (currentObject && !currentObject.userData?.category) {
                    console.log('Traversing up from:', currentObject.type, 'to parent:', currentObject.parent?.type);
                    currentObject = currentObject.parent;
                }
                if (currentObject && currentObject.userData?.category && this.books.includes(currentObject)) {
                    book = currentObject;
                    console.log('📖 Found book via hierarchy traversal:', book.userData.category);
                }
            }
            // Method 4: Direct lookup in books array by position proximity
            if (!book) {
                const clickPosition = intersects[0].point;
                book = this.books.find(b => {
                    const distance = b.position.distanceTo(clickPosition);
                    return distance < 3; // Within reasonable distance
                });
                if (book) {
                    console.log('📖 Found book via position proximity:', book.userData.category);
                }
            }
            
            if (book && book.userData?.category && this.books.includes(book)) {
                console.log('✅ Successfully identified book:', book.userData.category);
                this.selectBook(book);
            } else {
                console.log('❌ Could not identify a valid book from click');
                console.log('❌ Intersection object:', intersects[0].object);
                console.log('❌ Object userData:', intersects[0].object.userData);
                console.log('❌ Object parent:', intersects[0].object.parent);
                console.log('❌ Parent userData:', intersects[0].object.parent?.userData);
                console.log('❌ Available books:', this.books.map(b => b.userData.category));
            }
        } else {
            console.log('❌ No books clicked - no intersections found');
        }
    }

    hoverBook(book) {
        if (this.hoveredBook === book) return;
        
        // Unhover previous book
        if (this.hoveredBook) {
            this.unhoverBook(this.hoveredBook);
        }
        
        this.hoveredBook = book;
        book.userData.isHovered = true;
        
        // Enhanced glow effect on main book cover
        const bookCover = book.children.find(child => 
            child.geometry && child.geometry.type === 'BoxGeometry' && child.material
        );
        if (bookCover && bookCover.material && 'emissiveIntensity' in bookCover.material) {
            gsap.to(bookCover.material, {
                emissiveIntensity: 0.4,
                duration: 0.3,
                ease: "power2.out"
            });
        }

        // Enhanced glow effect on all metallic elements
        book.children.forEach(child => {
            if (child.material && child.material.metalness > 0.5) {
                gsap.to(child.material, {
                    emissiveIntensity: 0.5,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        // Activate the glow halo
        const glow = book.getObjectByName('glow');
        if (glow) {
            gsap.to(glow.material, {
                opacity: 0.3,
                duration: 0.4,
                ease: "power2.out"
            });
            gsap.to(glow.scale, {
                x: 1.1, y: 1.1, z: 1.1,
                duration: 0.4,
                ease: "power2.out"
            });
        }
        
        // Float UP animation - lift book upward on hover
        gsap.to(book.position, {
            y: book.position.y + 0.5, // Float UP by 0.5 units for more dramatic effect
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        
        // Enhanced scale animation with slight rotation
        gsap.to(book.scale, {
            x: 1.08, y: 1.08, z: 1.08,
            duration: 0.4,
            ease: "power2.out"
        });

        // Add subtle rotation for dynamic effect
        gsap.to(book.rotation, {
            z: book.rotation.z + 0.02,
            duration: 0.4,
            ease: "power2.out"
        });

        // Create particle burst effect around the book
        this.createHoverParticles(book);
        
        // Show category label with enhanced styling
        this.showCategoryLabel(book.userData.category);
    }

    unhoverBook(book) {
        if (!book || !book.userData.isHovered) return;
        
        book.userData.isHovered = false;
        
        // Remove glow effect from main cover
        const bookCover = book.children.find(child => 
            child.geometry && child.geometry.type === 'BoxGeometry' && child.material
        );
        if (bookCover && bookCover.material && 'emissiveIntensity' in bookCover.material) {
            gsap.to(bookCover.material, {
                emissiveIntensity: 0.05,
                duration: 0.4,
                ease: "power2.out"
            });
        }

        // Remove glow from all metallic elements
        book.children.forEach(child => {
            if (child.material && child.material.metalness > 0.5) {
                gsap.to(child.material, {
                    emissiveIntensity: 0.1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });

        // Hide the glow halo
        const glow = book.getObjectByName('glow');
        if (glow) {
            gsap.to(glow.material, {
                opacity: 0.0,
                duration: 0.4,
                ease: "power2.out"
            });
            gsap.to(glow.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.4,
                ease: "power2.out"
            });
        }
        
        // Return DOWN to original position
        const originalPos = this.originalPositions.get(book) || book.userData.originalPosition;
        if (originalPos) {
            gsap.to(book.position, {
                y: originalPos.y, // Return to original Y position (DOWN)
                duration: 0.4,
                ease: "power2.out"
            });
        }
        
        // Return to original scale
        gsap.to(book.scale, {
            x: 1.0, y: 1.0, z: 1.0,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    unhoverAllBooks() {
        if (this.hoveredBook) {
            this.unhoverBook(this.hoveredBook);
            this.hoveredBook = null;
            this.hideCategoryLabel();
        }
    }

    showCategoryLabel(category) {
        const label = document.getElementById('category-label');
        if (!label) {
            console.warn('Category label element not found, skipping label display');
            return;
        }
        
        const categoryData = this.kolamData[category];
        if (!categoryData) {
            console.warn('Category data not found for:', category);
            return;
        }
        
        label.textContent = `${categoryData.icon || '📚'} ${category}`;
        label.style.backgroundColor = categoryData.color || '#8b5cf6';
        
        if (typeof gsap !== 'undefined') {
            gsap.to(label, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            label.style.opacity = '1';
        }
    }

    hideCategoryLabel() {
        const label = document.getElementById('category-label');
        if (!label) {
            return;
        }
        
        if (typeof gsap !== 'undefined') {
            gsap.to(label, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            label.style.opacity = '0';
        }
    }

    createHoverParticles(book) {
        // Get book materials for particle colors
        const materials = book.userData.materials;
        if (!materials) return;

        // Create particle system around the book
        const particleCount = 15;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 8, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: materials.accent,
                transparent: true,
                opacity: 0.8,
                emissive: materials.accent,
                emissiveIntensity: 0.5
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position particles around the book
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 2;
            particle.position.set(
                book.position.x + Math.cos(angle) * radius,
                book.position.y + (Math.random() - 0.5) * 2,
                book.position.z + Math.sin(angle) * radius
            );
            
            particles.push(particle);
            this.scene.add(particle);
            
            // Animate particles floating outward and fading
            gsap.to(particle.position, {
                x: particle.position.x + Math.cos(angle) * 1.5,
                y: particle.position.y + Math.random() * 2 + 1,
                z: particle.position.z + Math.sin(angle) * 1.5,
                duration: 1.5,
                ease: "power2.out"
            });
            
            gsap.to(particle.material, {
                opacity: 0,
                duration: 1.5,
                ease: "power2.out",
                onComplete: () => {
                    this.scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                }
            });
            
            gsap.to(particle.scale, {
                x: 0.1, y: 0.1, z: 0.1,
                duration: 1.5,
                ease: "power2.out"
            });
        }
    }

    selectBook(book) {
        console.log('📖 selectBook called for:', book?.userData?.category, 'Time:', new Date().toISOString());
        console.log('📖 Current state - Animation in progress:', this.bookAnimationInProgress, 'Book open:', this.isBookOpen);
        
        if (this.isBookOpen || this.bookAnimationInProgress) {
            console.log('🚫 Book interaction blocked - States:', {
                isBookOpen: this.isBookOpen,
                bookAnimationInProgress: this.bookAnimationInProgress,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        if (!book || !book.userData || !book.userData.category) {
            console.error('❌ Invalid book object:', book);
            return;
        }
        
        console.log('📖 Opening book:', book.userData.category);
        console.log('📖 Book object:', book);
        console.log('📖 Book userData:', book.userData);
        
        // Set animation state IMMEDIATELY to prevent race conditions
        this.bookAnimationInProgress = true;
        console.log('🔒 Animation state locked at:', new Date().toISOString());
        this.selectedBook = book;
        
        // Animate book sliding out with Gen Z flair
        const originalPos = this.originalPositions.get(book);
        
        if (!originalPos) {
            console.error('❌ No original position found for book:', book.userData.category);
            console.log('Available positions:', this.originalPositions);
            this.bookAnimationInProgress = false;
            return;
        }
        
        console.log('📍 Original position:', originalPos);
        console.log('📍 Current position:', book.position);
        
        // Kill any existing animations to prevent conflicts
        gsap.killTweensOf([book.position, book.rotation, book.scale]);
        if (book.userData.edges) {
            gsap.killTweensOf(book.userData.edges.material);
        }
        
        // Add glow effect to selected book
        if (book.userData.edges) {
            gsap.to(book.userData.edges.material, {
                opacity: 1,
                duration: 0.3
            });
        }
        
        const timeline = gsap.timeline({
            onComplete: () => {
                console.log('✅ Book animation completed, opening modal');
                this.openBookModal(book.userData.category);
            },
            onInterrupt: () => {
                // Fallback in case animation is interrupted
                console.warn('⚠️ Select animation interrupted, forcing modal open');
                this.bookAnimationInProgress = false;
                this.openBookModal(book.userData.category);
            }
        });
        
        timeline
            .to(book.position, {
                z: originalPos.z + 3,
                y: originalPos.y + 1.5,
                duration: 0.8,
                ease: "power3.out"
            })
            .to(book.rotation, {
                x: Math.PI / 8,
                y: Math.PI / 12,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.4")
            .to(book.scale, {
                x: 1.2, y: 1.2, z: 1.2,
                duration: 0.4,
                ease: "back.out(1.7)"
            }, "-=0.3");
            
        // Add timeout fallback in case animation fails
        setTimeout(() => {
            if (this.bookAnimationInProgress && !this.isBookOpen) {
                console.warn('⚠️ Select animation timeout, forcing modal open');
                timeline.kill();
                this.openBookModal(book.userData.category);
            }
        }, 2000);
    }

    openBookModal(category) {
        console.log('🚀 Opening book modal for category:', category);
        
        this.isBookOpen = true;
        
        try {
            this.generateBookPages(category);
        } catch (error) {
            console.error('❌ Failed to generate book pages:', error);
            this.isBookOpen = false;
            this.bookAnimationInProgress = false;
            return;
        }
        
        // Show flipbook container with Gen Z animation
        const flipbookContainer = document.getElementById('flipbookContainer');
        if (flipbookContainer) {
            flipbookContainer.style.display = 'flex';
            
            // Kill any existing animations to prevent conflicts
            gsap.killTweensOf([flipbookContainer, '#flipbook']);
            
            const timeline = gsap.timeline({
                onComplete: () => {
                    this.bookAnimationInProgress = false;
                    console.log('✅ Book modal opened successfully');
                },
                onInterrupt: () => {
                    // Fallback in case animation is interrupted
                    console.warn('⚠️ Modal animation interrupted, forcing completion');
                    this.bookAnimationInProgress = false;
                }
            });
            
            timeline
                .fromTo(flipbookContainer, {
                    opacity: 0,
                    backdropFilter: 'blur(0px)'
                }, {
                    opacity: 1,
                    backdropFilter: 'blur(10px)',
                    duration: 0.4,
                    ease: "power2.out"
                })
                .fromTo('#flipbook', {
                    scale: 0.3,
                    rotationY: -30,
                    opacity: 0
                }, {
                    scale: 1,
                    rotationY: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)"
                }, "-=0.2");
                
            // Add timeout fallback in case animation fails
            setTimeout(() => {
                if (this.bookAnimationInProgress) {
                    console.warn('⚠️ Modal animation timeout, forcing completion');
                    timeline.kill();
                    this.bookAnimationInProgress = false;
                }
            }, 2000);
            
        } else {
            console.error('❌ Flipbook container not found!');
            this.isBookOpen = false;
            this.bookAnimationInProgress = false;
        }
    }

    generateBookPages(category) {
        console.log('🔧 Generating book pages for category:', category);
        const flipbook = document.getElementById('flipbook');
        if (!flipbook) {
            console.error('❌ Flipbook container not found!');
            return;
        }
        
        flipbook.innerHTML = '';
        
        const categoryData = this.kolamData[category];
        console.log('📊 Category data:', categoryData);
        
        if (!categoryData) {
            console.error('❌ No data found for category:', category);
            console.log('Available categories:', Object.keys(this.kolamData));
            return;
        }
        
        const kolams = categoryData.kolams || [];
        console.log(`📚 Found ${kolams.length} kolams for ${category}`);
        
        // Create cover page
        console.log('📄 Creating cover page...');
        const coverPage = this.createCoverPage(category, categoryData);
        flipbook.appendChild(coverPage);
        console.log('✅ Cover page created');
        
        // Create pages for each kolam (image on left, description on right)
        kolams.forEach((kolam, index) => {
            console.log(`📄 Creating pages for kolam ${index + 1}:`, kolam.title);
            
            // Image page
            const imagePage = this.createImagePage(kolam);
            flipbook.appendChild(imagePage);
            
            // Description page
            const descPage = this.createDescriptionPage(kolam);
            flipbook.appendChild(descPage);
        });
        
        // Back cover
        console.log('📄 Creating back cover...');
        const backCover = this.createBackCoverPage(category);
        flipbook.appendChild(backCover);
        console.log('✅ Back cover created');
        
        console.log(`📚 Total pages created: ${flipbook.children.length}`);
        
        // Initialize page flip
        console.log('🔄 Initializing page flip...');
        this.initializePageFlip();
        console.log('✅ Page flip initialized');
    }

    createCoverPage(category, categoryData) {
        const page = document.createElement('div');
        page.className = 'book-page';
        
        // Safe fallback values
        const safeColor = categoryData?.color || '#8b5cf6';
        const safeIcon = categoryData?.icon || '📚';
        const safeDescription = categoryData?.description || 'A collection of beautiful Kolam patterns';
        const kolamCount = categoryData?.kolams?.length || 0;
        
        console.log('📄 Creating cover page with:', { category, safeColor, safeIcon, kolamCount });
        
        page.style.background = `linear-gradient(135deg, ${safeColor}20, ${safeColor}10)`;
        page.style.color = '#333';
        page.style.display = 'flex';
        page.style.flexDirection = 'column';
        page.style.justifyContent = 'center';
        page.style.alignItems = 'center';
        page.style.padding = '40px';
        page.style.textAlign = 'center';
        
        page.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <div style="font-size: 4rem; margin-bottom: 20px;">${safeIcon}</div>
                <h1 style="font-size: 2.5rem; color: ${safeColor}; margin-bottom: 20px; font-weight: 700;">${category}</h1>
                <p style="font-size: 1.3rem; margin: 30px 0; color: #5a6c7d; line-height: 1.6; max-width: 80%;">
                    ${safeDescription}
                </p>
                <div style="margin-top: 40px; padding: 20px; background: rgba(0,0,0,0.05); border-radius: 10px; max-width: 90%;">
                    <p style="font-weight: bold; color: ${safeColor}; margin-bottom: 10px;">${kolamCount} Kolam Patterns</p>
                    <p style="font-size: 0.9rem; color: #6c757d;">
                        Click next to explore the patterns
                    </p>
                </div>
            </div>
        `;
        
        console.log('✅ Cover page created successfully');
        return page;
    }

    createImagePage(kolam) {
        const page = document.createElement('div');
        page.className = 'book-page';
        
        // Safe fallback values
        const safeTitle = kolam?.title || 'Kolam Pattern';
        const safeImage = kolam?.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Lb2xhbSBQYXR0ZXJuPC90ZXh0Pjwvc3ZnPg==';
        const safeRegion = kolam?.region || 'Traditional';
        const safeFestival = kolam?.festival || 'Cultural';
        const safeColor = '#8b5cf6';
        
        console.log('📄 Creating image page for:', safeTitle);
        
        page.style.display = 'flex';
        page.style.flexDirection = 'column';
        page.style.justifyContent = 'center';
        page.style.alignItems = 'center';
        page.style.padding = '20px';
        page.style.textAlign = 'center';
        
        page.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <img src="${safeImage}" alt="${safeTitle}" 
                     style="max-width: 80%; max-height: 60%; object-fit: contain; border: 3px solid ${safeColor}; border-radius: 8px; margin-bottom: 20px;"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5Lb2xhbSBQYXR0ZXJuPC90ZXh0Pjwvc3ZnPg==';">
                <h2 style="font-size: 1.8rem; color: #2c3e50; margin-bottom: 20px; font-weight: 600;">${safeTitle}</h2>
                <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
                    <span style="padding: 8px 15px; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
                        📍 ${safeRegion}
                    </span>
                    <span style="padding: 8px 15px; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
                        🎭 ${safeFestival}
                    </span>
                </div>
            </div>
        `;
        
        console.log('✅ Image page created successfully');
        return page;
    }

    createDescriptionPage(kolam) {
        const page = document.createElement('div');
        page.className = 'book-page';
        
        // Safe fallback values
        const safeTitle = kolam?.title || 'Kolam Pattern';
        const safeDescription = kolam?.description || 'A beautiful traditional Kolam pattern with cultural significance.';
        const safeSymmetry = kolam?.symmetry || 'Radial';
        const safeComplexity = kolam?.complexity || 'Intermediate';
        const safeCulturalSignificance = kolam?.cultural_significance || 'Traditional pattern representing harmony and prosperity.';
        const safeTags = kolam?.tags || ['traditional', 'cultural'];
        
        console.log('📄 Creating description page for:', safeTitle);
        
        page.style.display = 'flex';
        page.style.flexDirection = 'column';
        page.style.justifyContent = 'flex-start';
        page.style.alignItems = 'stretch';
        page.style.padding = '30px';
        page.style.textAlign = 'left';
        page.style.overflow = 'auto';
        
        page.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <h3 style="color: #2c3e50; font-size: 1.5rem; margin-bottom: 20px; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; text-align: center;">
                    ${safeTitle}
                </h3>
                
                <p style="margin-bottom: 25px; line-height: 1.8; color: #4a5568; flex-grow: 1;">
                    ${safeDescription}
                </p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                        <strong style="color: #8b5cf6; display: block; margin-bottom: 5px;">Symmetry</strong>
                        <span style="color: #4a5568;">${safeSymmetry}</span>
                    </div>
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                        <strong style="color: #8b5cf6; display: block; margin-bottom: 5px;">Complexity</strong>
                        <span style="color: #4a5568;">${safeComplexity}</span>
                    </div>
                </div>
                
                <div style="background: rgba(244, 114, 182, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong style="color: #f472b6; display: block; margin-bottom: 10px;">Cultural Significance</strong>
                    <span style="color: #4a5568; font-style: italic; line-height: 1.6;">${safeCulturalSignificance}</span>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto;">
                    ${safeTags.map(tag => 
                        `<span style="background: rgba(0, 245, 255, 0.2); color: #0891b2; padding: 5px 12px; border-radius: 15px; font-size: 0.85rem; font-weight: 500;">#${tag}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        console.log('✅ Description page created successfully');
        return page;
    }

    createBackCoverPage(category) {
        const page = document.createElement('div');
        page.className = 'book-page';
        page.style.background = 'linear-gradient(135deg, #2c3e50, #34495e)';
        page.style.color = '#ffffff';
        
        page.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #ffffff; margin-bottom: 30px;">Thank You for Exploring</h2>
                <div style="font-size: 3rem; margin-bottom: 20px;">🕉️</div>
                <p style="color: #bdc3c7; font-size: 1.1rem; line-height: 1.6;">
                    May these sacred patterns inspire peace, harmony, and creativity in your life.
                </p>
                <div style="margin-top: 40px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <p style="font-size: 0.9rem; color: #ecf0f1;">
                        Generated by KolamGen - Where tradition meets technology
                    </p>
                </div>
            </div>
        `;
        
        return page;
    }

    initializePageFlip() {
        const flipbook = document.getElementById('flipbook');
        
        if (!flipbook) {
            console.error('❌ Flipbook element not found!');
            return;
        }
        
        console.log('🔄 Initializing page flip with', flipbook.children.length, 'pages');
        
        // Destroy existing pageFlip instance
        if (this.pageFlip) {
            console.log('🗑️ Destroying existing page flip instance');
            this.pageFlip.destroy();
        }
        
        // Check if PageFlip library is available
        if (typeof St === 'undefined' || !St.PageFlip) {
            console.error('❌ PageFlip library not loaded! Using simple fallback display.');
            this.createSimpleBookDisplay(flipbook);
            return;
        }
        
        try {
            // Initialize new pageFlip
            console.log('🔄 Creating new PageFlip instance...');
            this.pageFlip = new St.PageFlip(flipbook, {
                width: 400,
                height: 500,
                size: 'fixed',
                orientation: 'portrait',
                autoSize: false,
                maxShadowOpacity: 0.5,
                showCover: true,
                mobileScrollSupport: false,
                clickEventForward: true,
                usePortrait: true,
                startZIndex: 0,
                drawShadow: true
            });
            
            // Load all pages
            const pages = Array.from(flipbook.children);
            console.log('📚 Loading pages into PageFlip:', pages.length);
            this.pageFlip.loadFromHTML(pages);
            console.log('✅ PageFlip initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize PageFlip:', error);
            console.log('🔄 Using simple fallback display...');
            this.createSimpleBookDisplay(flipbook);
        }
    }

    createSimpleBookDisplay(flipbook) {
        console.log('📖 Creating simple book display fallback');
        
        // Add navigation controls
        const navContainer = document.createElement('div');
        navContainer.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 10;
        `;
        
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← Previous';
        prevBtn.style.cssText = `
            padding: 10px 20px;
            background: #8b5cf6;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 500;
        `;
        
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next →';
        nextBtn.style.cssText = `
            padding: 10px 20px;
            background: #8b5cf6;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 500;
        `;
        
        const pageCounter = document.createElement('span');
        pageCounter.style.cssText = `
            padding: 10px 15px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 20px;
            font-weight: 500;
            color: #333;
        `;
        
        navContainer.appendChild(prevBtn);
        navContainer.appendChild(pageCounter);
        navContainer.appendChild(nextBtn);
        flipbook.parentElement.appendChild(navContainer);
        
        let currentPage = 0;
        const pages = Array.from(flipbook.children);
        
        function showPage(index) {
            pages.forEach((page, i) => {
                page.style.display = i === index ? 'block' : 'none';
            });
            pageCounter.textContent = `${index + 1} / ${pages.length}`;
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === pages.length - 1;
            prevBtn.style.opacity = index === 0 ? '0.5' : '1';
            nextBtn.style.opacity = index === pages.length - 1 ? '0.5' : '1';
        }
        
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                showPage(currentPage);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentPage < pages.length - 1) {
                currentPage++;
                showPage(currentPage);
            }
        });
        
        // Show first page
        showPage(0);
        console.log('✅ Simple book display created with navigation');
    }

    closeBook() {
        console.log('🔐 closeBook called. Time:', new Date().toISOString());
        console.log('🔐 Current state - Animation:', this.bookAnimationInProgress, 'Book open:', this.isBookOpen, 'Selected book:', this.selectedBook?.userData?.category);
        
        if (!this.isBookOpen || this.bookAnimationInProgress) {
            console.log('⚠️ Cannot close book - not open or animation in progress');
            return;
        }
        
        console.log('📚 Closing book...');
        this.bookAnimationInProgress = true;
        console.log('🔒 Animation state locked for closing at:', new Date().toISOString());
        
        const flipbookContainer = document.getElementById('flipbookContainer');
        if (flipbookContainer) {
            // Kill any existing animations to prevent conflicts
            gsap.killTweensOf([flipbookContainer, '#flipbook']);
            
            // Hide flipbook with Gen Z animation
            const timeline = gsap.timeline({
                onComplete: () => {
                    flipbookContainer.style.display = 'none';
                    this.returnBookToShelf();
                    // Auto-refresh after book return animation completes
                    setTimeout(() => {
                        console.log('🔄 Auto-refreshing page after book close');
                        location.reload();
                    }, 1000); // Wait for return animation to complete
                },
                onInterrupt: () => {
                    // Fallback in case animation is interrupted
                    console.warn('⚠️ Close animation interrupted, forcing completion');
                    flipbookContainer.style.display = 'none';
                    this.forceReturnBookToShelf();
                    // Auto-refresh even on interrupt
                    setTimeout(() => {
                        console.log('🔄 Auto-refreshing page after interrupted close');
                        location.reload();
                    }, 500);
                }
            });
            
            timeline
                .to('#flipbook', {
                    scale: 0.3,
                    rotationY: 30,
                    opacity: 0,
                    duration: 0.5,
                    ease: "back.in(1.7)"
                })
                .to(flipbookContainer, {
                    opacity: 0,
                    backdropFilter: 'blur(0px)',
                    duration: 0.3,
                    ease: "power2.in"
                }, "-=0.2");
                
            // Add timeout fallback in case animation fails
            setTimeout(() => {
                if (this.isBookOpen || this.bookAnimationInProgress) {
                    console.warn('⚠️ Close animation timeout, forcing completion');
                    timeline.kill();
                    flipbookContainer.style.display = 'none';
                    this.forceReturnBookToShelf();
                }
            }, 2000);
            
        } else {
            console.warn('⚠️ Flipbook container not found, closing anyway');
            this.forceReturnBookToShelf();
        }
    }

    returnBookToShelf() {
        console.log('↩️ returnBookToShelf called. Time:', new Date().toISOString());
        console.log('↩️ Current state - Animation:', this.bookAnimationInProgress, 'Book open:', this.isBookOpen, 'Selected book:', this.selectedBook?.userData?.category);
        
        if (!this.selectedBook) {
            // Force reset states even without selected book
            this.isBookOpen = false;
            this.bookAnimationInProgress = false;
            console.log('⚠️ No selected book, but resetting states at:', new Date().toISOString());
            return;
        }
        
        console.log('↩️ Returning book to shelf...');
        const book = this.selectedBook;
        const originalPos = this.originalPositions.get(book);
        
        if (!originalPos) {
            console.error('❌ No original position found for book, forcing reset');
            this.forceReturnBookToShelf();
            return;
        }
        
        // Kill any existing animations to prevent conflicts
        gsap.killTweensOf([book.position, book.rotation, book.scale]);
        if (book.userData.edges) {
            gsap.killTweensOf(book.userData.edges.material);
        }
        
        // Reset glow effect
        if (book.userData.edges) {
            gsap.to(book.userData.edges.material, {
                opacity: 0.9,
                duration: 0.3
            });
        }
        
        // Animate book returning to shelf with style
        const timeline = gsap.timeline({
            onComplete: () => {
                this.isBookOpen = false;
                this.bookAnimationInProgress = false;
                this.selectedBook = null;
                console.log('✅ Book returned to shelf. States reset at:', new Date().toISOString());
                console.log('✅ Final state - Animation:', this.bookAnimationInProgress, 'Book open:', this.isBookOpen);
            },
            onInterrupt: () => {
                // Fallback in case animation is interrupted
                console.warn('⚠️ Return animation interrupted, forcing completion at:', new Date().toISOString());
                this.forceReturnBookToShelf();
            }
        });
        
        timeline
            .to(book.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.4,
                ease: "back.in(1.7)"
            })
            .to(book.rotation, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.2")
            .to(book.position, {
                x: originalPos.x,
                y: originalPos.y,
                z: originalPos.z,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.4");
            
        // Add timeout fallback in case animation fails
        setTimeout(() => {
            if (this.isBookOpen || this.bookAnimationInProgress) {
                console.warn('⚠️ Return animation timeout, forcing completion at:', new Date().toISOString());
                timeline.kill();
                this.forceReturnBookToShelf();
            }
        }, 3000); // 3 second timeout
        
        // Add emergency state reset as absolute fallback  
        setTimeout(() => {
            if (this.bookAnimationInProgress) {
                console.error('🚨 EMERGENCY: Return animation state stuck, forcing reset at:', new Date().toISOString());
                this.forceReturnBookToShelf();
            }
        }, 5000); // 5 second emergency timeout
    }

    forceReturnBookToShelf() {
        console.log('🔧 Force returning book to shelf at:', new Date().toISOString());
        console.log('🔧 Before reset - Animation:', this.bookAnimationInProgress, 'Book open:', this.isBookOpen, 'Selected:', this.selectedBook?.userData?.category);
        
        if (this.selectedBook) {
            const book = this.selectedBook;
            const originalPos = this.originalPositions.get(book);
            
            // Instantly reset book position and properties
            if (originalPos) {
                book.position.set(originalPos.x, originalPos.y, originalPos.z);
                book.rotation.set(0, 0, 0);
                book.scale.set(1, 1, 1);
            }
            
            // Reset glow effect
            if (book.userData.edges && book.userData.edges.material) {
                book.userData.edges.material.opacity = 0.9;
            }
        }
        
        // Force reset all states
        this.isBookOpen = false;
        this.bookAnimationInProgress = false;
        this.selectedBook = null;
        
        console.log('✅ Book forcefully returned to shelf and states reset at:', new Date().toISOString());
        console.log('✅ After reset - Animation:', this.bookAnimationInProgress, 'Book open:', this.isBookOpen);
    }

    // Emergency reset method to clear all states and animations
    resetAllStates() {
        console.log('🔧 Emergency reset - clearing all states and animations');
        
        // Kill all GSAP animations
        gsap.killTweensOf("*");
        
        // Reset all book positions and properties
        this.books.forEach(book => {
            const originalPos = this.originalPositions.get(book);
            if (originalPos) {
                book.position.set(originalPos.x, originalPos.y, originalPos.z);
                book.rotation.set(0, 0, 0);
                book.scale.set(1, 1, 1);
                
                // Reset glow effect
                if (book.userData.edges && book.userData.edges.material) {
                    book.userData.edges.material.opacity = 0.9;
                }
            }
        });
        
        // Reset all states
        this.isBookOpen = false;
        this.bookAnimationInProgress = false;
        this.selectedBook = null;
        this.hoveredBook = null;
        
        // Hide flipbook if open
        const flipbookContainer = document.getElementById('flipbookContainer');
        if (flipbookContainer) {
            flipbookContainer.style.display = 'none';
        }
        
        console.log('✅ Emergency reset completed');
    }

    prevPage() {
        if (this.pageFlip && this.pageFlip.getCurrentPageIndex() > 0) {
            this.pageFlip.flipPrev();
        }
    }

    nextPage() {
        if (this.pageFlip) {
            this.pageFlip.flipNext();
        }
    }

    onWindowResize() {
        const container = this.renderer.domElement.parentElement;
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Rotate books slightly for dynamic effect
        this.books.forEach((book, index) => {
            if (!book.userData.isHovered && !this.isBookOpen) {
                book.rotation.y = Math.sin(Date.now() * 0.001 + index) * 0.02;
            }
        });
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    showError(message) {
        if (window.kolamGenApp) {
            window.kolamGenApp.showNotification(message, 'error');
        } else {
            console.error(message);
        }
    }

    // Public methods for external access
    openCategory(categoryName) {
        const book = this.books.find(b => b.userData.category === categoryName);
        if (book && !this.isBookOpen) {
            this.selectBook(book);
        }
    }

    getAvailableCategories() {
        return Object.keys(this.kolamData);
    }

    getKolamCount(category) {
        return this.kolamData[category]?.kolams?.length || 0;
    }

    // Gen Z Filter System 🔥
    filterByCategory(category) {
        console.log(`🎯 Filtering by category: ${category}`);
        
        this.books.forEach((book, index) => {
            const bookCategory = book.userData.category;
            const shouldShow = category === 'all' || bookCategory === category;
            
            if (typeof gsap !== 'undefined') {
                if (shouldShow) {
                    // Show book with smooth animation
                    gsap.to(book.scale, {
                        x: 1, y: 1, z: 1,
                        duration: 0.6,
                        ease: "back.out(1.7)",
                        delay: index * 0.1
                    });
                    gsap.to(book.position, {
                        y: book.userData.originalPosition.y,
                        duration: 0.6,
                        ease: "back.out(1.7)",
                        delay: index * 0.1
                    });
                    
                    // Enhance glow effect
                    if (book.userData.edges) {
                        gsap.to(book.userData.edges.material, {
                            opacity: 0.9,
                            duration: 0.3
                        });
                    }
                } else {
                    // Hide book with smooth animation
                    gsap.to(book.scale, {
                        x: 0.1, y: 0.1, z: 0.1,
                        duration: 0.4,
                        ease: "back.in(1.7)",
                        delay: index * 0.05
                    });
                    gsap.to(book.position, {
                        y: book.userData.originalPosition.y - 2,
                        duration: 0.4,
                        ease: "back.in(1.7)",
                        delay: index * 0.05
                    });
                    
                    // Fade glow
                    if (book.userData.edges) {
                        gsap.to(book.userData.edges.material, {
                            opacity: 0.2,
                            duration: 0.3
                        });
                    }
                }
            } else {
                // Fallback without GSAP
                book.visible = shouldShow;
            }
        });
        
        // Update current view in UI
        const currentViewEl = document.getElementById('currentView');
        if (currentViewEl) {
            currentViewEl.textContent = category === 'all' ? '3D Gallery' : category;
        }
        
        // Particle burst effect for category change
        this.createCategoryParticleBurst(category);
    }

    createCategoryParticleBurst(category) {
        if (typeof THREE === 'undefined') return;
        
        const color = this.getCategoryColor(category);
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 10
            );
            
            this.scene.add(particle);
            
            // Animate particles
            if (typeof gsap !== 'undefined') {
                gsap.to(particle.position, {
                    x: particle.position.x + (Math.random() - 0.5) * 20,
                    y: particle.position.y + Math.random() * 10,
                    z: particle.position.z + (Math.random() - 0.5) * 20,
                    duration: 2,
                    ease: "power2.out"
                });
                
                gsap.to(particle.material, {
                    opacity: 0,
                    duration: 2,
                    ease: "power2.out",
                    onComplete: () => {
                        this.scene.remove(particle);
                        particleGeometry.dispose();
                        particleMaterial.dispose();
                    }
                });
            }
        }
    }

    // Social media style search functionality
    searchKolams(query) {
        console.log(`🔍 Searching for: ${query}`);
        
        if (!query || query.trim() === '') {
            this.filterByCategory('all');
            return;
        }
        
        query = query.toLowerCase().trim();
        
        this.books.forEach((book, index) => {
            const category = book.userData.category;
            const categoryData = this.kolamData[category];
            
            // Search in category name and kolam details
            const matchesCategory = category.toLowerCase().includes(query);
            const matchesDescription = categoryData.description && 
                categoryData.description.toLowerCase().includes(query);
            
            let matchesKolam = false;
            if (categoryData.kolams) {
                matchesKolam = categoryData.kolams.some(kolam => 
                    kolam.name.toLowerCase().includes(query) ||
                    kolam.description.toLowerCase().includes(query) ||
                    kolam.occasion.toLowerCase().includes(query)
                );
            }
            
            const shouldShow = matchesCategory || matchesDescription || matchesKolam;
            
            if (typeof gsap !== 'undefined') {
                if (shouldShow) {
                    gsap.to(book.scale, {
                        x: 1.1, y: 1.1, z: 1.1, // Slightly bigger for search results
                        duration: 0.5,
                        ease: "back.out(1.7)",
                        delay: index * 0.08
                    });
                    gsap.to(book.rotation, {
                        y: book.rotation.y + Math.PI * 0.1,
                        duration: 0.5,
                        ease: "back.out(1.7)"
                    });
                } else {
                    gsap.to(book.scale, {
                        x: 0.1, y: 0.1, z: 0.1,
                        duration: 0.3,
                        ease: "back.in(1.7)"
                    });
                }
            } else {
                book.visible = shouldShow;
            }
        });
        
        // Update UI
        const currentViewEl = document.getElementById('currentView');
        if (currentViewEl) {
            currentViewEl.textContent = `Search: ${query}`;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KolamLibrary3D;
}