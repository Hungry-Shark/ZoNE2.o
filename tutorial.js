class Tutorial extends StoryMode {
    constructor() {
        super();
        this.tutorialStep = 0;
        this.startTutorial();
    }

    startTutorial() {
        this.showMessage("Welcome to the tutorial! Use the W, A, S, D keys to move.", 3000);
    }

    showMessage(message, duration) {
        const messageElement = document.getElementById('tutorial-message');
        messageElement.textContent = message;
        messageElement.style.display = 'block';

        if (duration) {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, duration);
        }
    }

    handleKeyPress(event) {
        super.handleKeyPress(event);

        switch (this.tutorialStep) {
            case 0:
                this.showMessage("Great! Now, try to reach the end of the maze.", 3000);
                this.tutorialStep++;
                break;
            case 1:
                if (this.player.row > 5) {
                    this.showMessage("You can collect coins to increase your score.", 3000);
                    this.tutorialStep++;
                }
                break;
            case 2:
                if (this.coins.length < 2) { // Assuming there are at least 2 coins
                    this.showMessage("Power-ups like this one will give you a speed boost!", 3000);
                    this.tutorialStep++;
                }
                break;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles.js
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#66FCF1"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#45A29E",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

    const game = new Tutorial();
});
