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

    const achievementsContainer = document.querySelector('.achievements-container');

    const achievements = [
        { id: 'level_1', name: 'First Steps', description: 'Complete level 1.', icon: 'fa-shoe-prints' },
        { id: 'level_10', name: 'Halfway There', description: 'Complete level 10.', icon: 'fa-mountain' },
        { id: 'level_25', name: 'Maze Master', description: 'Complete all 25 levels.', icon: 'fa-crown' },
        { id: 'no_backtrack', name: 'Forward Momentum', description: 'Complete a level without backtracking.', icon: 'fa-arrow-right' },
        { id: 'all_coins', name: 'Coin Collector', description: 'Collect all coins in a level.', icon: 'fa-coins' },
    ];

    const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];

    achievements.forEach(achievement => {
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        const achievementElement = document.createElement('div');
        achievementElement.classList.add('achievement');
        if (isUnlocked) {
            achievementElement.classList.add('unlocked');
        }
        achievementElement.innerHTML = `
            <div class="achievement-icon"><i class="fas ${achievement.icon}"></i></div>
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
        `;
        achievementsContainer.appendChild(achievementElement);
    });
});
