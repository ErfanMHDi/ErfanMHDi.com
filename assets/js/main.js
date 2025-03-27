document.addEventListener("DOMContentLoaded", async function () {


	/*-----------------------------------------------------------------------------*/
	/* PreLoader ------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
	const MIN_PRELOAD_TIME = 250;
	const start = performance.now();
	window.addEventListener("load", () => {
		const now = performance.now();
		const elapsed = now - start;
		const delay = Math.max(MIN_PRELOAD_TIME - elapsed, 0);
		setTimeout(() => {
			document.body.classList.add("Loaded");
		}, delay);
	});


	/*-----------------------------------------------------------------------------*/
	/* ScrollDown Animation -------------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
	const totalFrames = 60;
	const fps = 30;
	const frameDuration = 1000 / fps;
	let current = 0;
	let lastTime = performance.now();
	const canvas = document.getElementById("ScrollCanvas");
	const ctx = canvas.getContext("2d");
	const frames = [];
	const preloadFrames = () => {
	  let loaded = 0;
	  for (let i = 1; i <= totalFrames; i++) {
		const frameNum = i.toString().padStart(2, '0');
		const img = new Image();
		img.onload = () => {
		  loaded++;
		  if (loaded === totalFrames) {
			requestAnimationFrame(animate);
		  }
		};
		img.src = `assets/img/hero/ScrollDown/ScrollDown-${frameNum}.svg`;
		frames.push(img);
	  }
	};
	const animate = (now) => {
	  if (now - lastTime >= frameDuration) {
		current = (current + 1) % totalFrames;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(frames[current], 0, 0, canvas.width, canvas.height);
		lastTime = now;
	  }
	  requestAnimationFrame(animate);
	};
	preloadFrames();


	/*-----------------------------------------------------------------------------*/
	/* MultiLanguage Engine -------------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
	const urlParams = new URLSearchParams(window.location.search);
	let lang = urlParams.get("lang") || "en";
	let translations = {};
	try {
		const response = await fetch("assets/json/translations.json");
		if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
		translations = await response.json();
		document.querySelectorAll("*").forEach(element => {
			if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) { 
				let text = element.textContent;
				if (text.includes("{{")) {
					element.textContent = text.replace(/{{(.*?)}}/g, (_, key) => {
						key = key.trim();
						return translations[key] && translations[key][lang] ? translations[key][lang] : `{{${key}}}`;
					});
				}
			}
		});
	} catch (error) {
		console.error("❌ Error fetching translations:", error);
	}
	const htmlTag = document.documentElement;
	if (lang === "fa") {
		htmlTag.setAttribute("lang", "fa");
		htmlTag.setAttribute("dir", "rtl");
	} else {
		htmlTag.setAttribute("lang", "en");
		htmlTag.setAttribute("dir", "ltr");
	}
	document.querySelectorAll(".LanguageSwitcher a").forEach(link => {
		const linkLang = new URL(link.href).searchParams.get("lang");
		if (linkLang === lang) {
			link.classList.add("Current");
			link.setAttribute("aria-current", "true");
		} else {
			link.classList.remove("Current");
			link.setAttribute("aria-current", "false");
		}
	});

	
	/*-----------------------------------------------------------------------------*/
	/* Light Switch ---------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
    const themeToggleInputs = document.querySelectorAll(".LightSwitch input");
    function setState(state) {
        const currentTheme = document.documentElement.getAttribute("lights");
        if (state === currentTheme) return; 

        if (state === "auto") {
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.setAttribute("lights", systemPrefersDark ? "off" : "on");
        } else {
            document.documentElement.setAttribute("lights", state);
        }

        localStorage.setItem("lights", state);
    }
    setState(localStorage.getItem("lights") || "auto");
    themeToggleInputs.forEach((input) => {
        input.addEventListener("change", function () {
            if (this.checked) {
                setState(this.value);
            }
        });
    });


	/*-----------------------------------------------------------------------------*/
	/* SplineViewer WhiteLabel ----------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
    function removeSplineLogos() {
        const splineViewers = document.querySelectorAll("spline-viewer");
        if (splineViewers.length === 0) {
            return;
        }
        splineViewers.forEach((splineViewer) => {
            let attempts = 0;
            function attemptRemoval() {
                if (attempts >= 10) {
                    return;
                }
                if (splineViewer.shadowRoot) {
                    const logo = splineViewer.shadowRoot.querySelector("#logo");
                    if (logo) {
                        logo.remove();
                    } else {
                        attempts++;
                        setTimeout(attemptRemoval, 500);
                    }
                } else {
                    attempts++;
                    setTimeout(attemptRemoval, 500);
                }
            }
            attemptRemoval();
        });
    }
    setTimeout(removeSplineLogos, 500);

	
	/*-----------------------------------------------------------------------------*/
	/* Footer ---------------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
	function updateCopyRightYear() {
		const copyRightElement = document.querySelector('.CopyRight span');
		if (copyRightElement) {
			const currentYear = new Date().getFullYear();
			copyRightElement.textContent = currentYear;
		}
	}
	updateCopyRightYear();


	/*-----------------------------------------------------------------------------*/
	/* Hero Benex -----------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
    let ticking = false;
    function updateHeroState() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const mainHero = document.querySelector("#Hero");
                if (!mainHero) return;

                const heroHeight = mainHero.offsetHeight;
                const scrollY = window.scrollY;

                let progress = Math.min(scrollY / heroHeight, 1);
                let currentStep = Math.floor(progress * 100);

                const scaleValue = 1 - (currentStep * 0.001);
                const translateYValue = currentStep * 0.75;
                const rotateXValue = currentStep * 0.1;

                let fadeBlurProgress = Math.max((currentStep - 0) / 100, 0);
                const opacityValue = 1 - fadeBlurProgress;
                const blurValue = fadeBlurProgress * 20;

                mainHero.style.transform = `scale(${scaleValue}) translateY(${translateYValue}px) rotateX(${rotateXValue}deg)`;
                mainHero.style.opacity = opacityValue;
                mainHero.style.filter = `blur(${blurValue}px)`;

                ticking = false;
            });
            ticking = true;
        }
    }
    window.addEventListener("scroll", updateHeroState);
    updateHeroState();

	const statusElement = document.querySelector('#Hero .Status');
	const today = new Date();
	const futureDate = new Date(today);
	futureDate.setDate(today.getDate() + 15);
	let displayMonth = futureDate.toLocaleString('default', { month: 'long' });
	let displayYear = futureDate.getFullYear();
	if (futureDate.getDate() > 15) {
		futureDate.setMonth(futureDate.getMonth() + 1);
		futureDate.setDate(1);
		displayMonth = futureDate.toLocaleString('default', { month: 'long' });
		displayYear = futureDate.getFullYear();
	}
	statusElement.querySelector('strong').textContent = `${displayMonth} ${displayYear}`;
	
	const slider = document.querySelector('#Hero .Developer .Magic');
	const afterImage = document.querySelector('#Hero .Developer .After');
	const container = document.querySelector('#Hero .Developer .WebDev');
	let isDragging = false;
	slider.addEventListener('mousedown', () => {
		isDragging = true;
		document.body.style.userSelect = 'none';
	});
	window.addEventListener('mouseup', () => {
		isDragging = false;
		document.body.style.userSelect = '';
	});
	window.addEventListener('mousemove', (e) => {
		if (!isDragging) return;
		let rect = container.getBoundingClientRect();
		let offsetX = e.clientX - rect.left;
		let width = rect.width;
		if (offsetX < -4) offsetX = -4;
		if (offsetX > width - 8) offsetX = width - 8;
		let topPosition = 10 - (offsetX / 10);
		slider.style.left = `${offsetX}px`;
		slider.style.top = `${topPosition}px`;
		afterImage.style.width = `${offsetX}px`;
	});

	const colorItems = document.querySelectorAll("#Hero .Designer .ColorSets li");
	const titleElement = document.querySelector("#Hero .Designer h2");
	colorItems.forEach(item => {
		item.addEventListener("click", function () {
			const isAlreadySelected = this.classList.contains("Selected");
			if (isAlreadySelected) {
				this.classList.remove("Selected");
				titleElement.classList.forEach(cls => {
					if (cls.startsWith("Color")) {
						titleElement.classList.remove(cls);
					}
				});
				return; 
			}
			titleElement.style.opacity = "0.5";
			setTimeout(() => {
				titleElement.classList.forEach(cls => {
					if (cls.startsWith("Color")) {
						titleElement.classList.remove(cls);
					}
				});
				titleElement.classList.add(...this.classList);
				titleElement.style.opacity = "1";
			}, 500);
			colorItems.forEach(li => li.classList.remove("Selected"));
			this.classList.add("Selected");
		});
	});
	
	
	/*-----------------------------------------------------------------------------*/
	/* Gravity Benex --------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
	function loadMatterScript() {
		return new Promise((resolve, reject) => {
			if (window.Matter) return resolve(window.Matter);

			const script = document.createElement("script");
			script.src = "../assets/js/matter.min.js"; // adjust path if needed
			script.onload = () => resolve(window.Matter);
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	async function initGravity() {
		const Matter = await loadMatterScript();
		const { Engine, Render, Runner, Bodies, World, Mouse, MouseConstraint } = Matter;

		const container = document.querySelector("#Services .DEV .Wrapper");
		if (!container) return;

		container.style.position = "relative";

		const engine = Engine.create();
		const world = engine.world;

		const render = Render.create({
			element: container,
			engine: engine,
			options: {
				width: container.clientWidth,
				height: container.clientHeight,
				wireframes: false,
				background: "transparent",
				pixelRatio: window.devicePixelRatio,
				enabled: false
			},
		});

		Render.run(render);

		const runner = Runner.create();
		Runner.run(runner, engine);

		render.canvas.addEventListener("wheel", (event) => {
			event.stopPropagation();
		}, { passive: true });

		let ground, leftWall, rightWall, topWall;

		function createBoundaries() {
			const width = container.clientWidth;
			const height = container.clientHeight;
			if (ground) World.remove(world, [ground, leftWall, rightWall, topWall]);

			ground = Bodies.rectangle(width / 2, height - 5, width, 10, { isStatic: true, render: { visible: false } });
			leftWall = Bodies.rectangle(5, height / 2, 10, height, { isStatic: true, render: { visible: false } });
			rightWall = Bodies.rectangle(width - 5, height / 2, 10, height, { isStatic: true, render: { visible: false } });
			topWall = Bodies.rectangle(width / 2, 5, width, 10, { isStatic: true, render: { visible: false } });

			World.add(world, [ground, leftWall, rightWall, topWall]);
		}

		setTimeout(createBoundaries, 50);

		const spans = container.querySelectorAll(".Pill");
		const spanBodies = [];

		spans.forEach((span) => {
			const rect = span.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();
			const initialWidth = rect.width;
			const initialHeight = rect.height;

			const body = Bodies.rectangle(
				rect.left - containerRect.left + rect.width / 2,
				rect.top - containerRect.top + rect.height / 2,
				rect.width,
				rect.height,
				{
					restitution: 0.32,
					friction: 0.1,
					density: 0.02,
					frictionAir: 0.02,
					chamfer: { radius: Math.min(rect.width, rect.height) / 2 },
					render: { visible: false },
				}
			);

			World.add(world, body);
			spanBodies.push({ element: span, body, initialWidth, initialHeight });
		});

		function repositionObjects() {
			const width = container.clientWidth;
			const height = container.clientHeight;
			spanBodies.forEach(({ body }) => {
				Matter.Body.setPosition(body, {
					x: Math.min(Math.max(body.position.x, 20), width - 20),
					y: Math.min(Math.max(body.position.y, 20), height - 20),
				});
			});
		}

		function resizeRender() {
			const width = container.clientWidth;
			const height = container.clientHeight;
			render.bounds.max.x = width;
			render.bounds.max.y = height;
			render.options.width = width;
			render.options.height = height;
			render.canvas.width = width;
			render.canvas.height = height;
			Matter.Render.setPixelRatio(render, window.devicePixelRatio);
			createBoundaries();
			repositionObjects();
		}

		let resizeTimeout;
		window.addEventListener("resize", () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeRender, 200);
		});

		const mouse = Mouse.create(render.canvas);
		const mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: {
				stiffness: 0.2,
				render: { visible: false },
			},
		});

		World.add(world, mouseConstraint);
		render.mouse = mouse;

		container.addEventListener("mouseleave", () => {
			if (mouseConstraint.body) {
				mouseConstraint.body = null;
			}
			mouseConstraint.constraint.pointA = null;
			mouseConstraint.constraint.bodyB = null;
			mouseConstraint.constraint.pointB = null;
		});

		engine.enableSleeping = true;

		let frameCount = 0;

		function updateSpans() {
			frameCount++;
			if (frameCount % 2 === 0) {
				spanBodies.forEach(({ element, body, initialWidth, initialHeight }) => {
					element.style.position = "absolute";
					element.style.left = `${body.position.x - initialWidth / 2}px`;
					element.style.top = `${body.position.y - initialHeight / 2}px`;
					element.style.transform = `rotate(${body.angle}rad)`;
				});
			}
			requestAnimationFrame(updateSpans);
		}

		updateSpans();

		mouse.element.removeEventListener('wheel', mouse.mousewheel);
	}

	function runGravityWhenWrapperAtViewportCenter() {
		const wrapper = document.querySelector("#Services .DEV .Wrapper");
		if (!wrapper) return;

		let gravityInitialized = false;

		function checkWrapperCenter() {
			if (gravityInitialized) return;

			const rect = wrapper.getBoundingClientRect();
			const wrapperCenterY = rect.top + rect.height / 2;
			const viewportCenterY = window.innerHeight / 2;
			const offset = Math.abs(wrapperCenterY - viewportCenterY);
			const tolerance = window.innerHeight * 0.5;

			if (offset < tolerance) {
				initGravity();
				gravityInitialized = true;
				window.removeEventListener('scroll', checkWrapperCenter);
			}
		}

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting && !gravityInitialized) {
					window.addEventListener('scroll', checkWrapperCenter);
					checkWrapperCenter();
				}
			});
		}, { threshold: 0.5 });

		observer.observe(wrapper);
	}

	runGravityWhenWrapperAtViewportCenter();

	/*-----------------------------------------------------------------------------*/
	/* Music Benex ----------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
	const audioElement = document.querySelector('.Music audio');
	let currentAudioIndex = 0;
	
	// Get all <source> elements (original list)
	const sources = audioElement.querySelectorAll('source');
	const audioList = Array.from(sources).map(source => source.src);
	
	function updateSourceForCurrentAudio() {
		const sources = audioElement.querySelectorAll('source');
	
		sources.forEach((source, index) => {
			source.src = index === currentAudioIndex ? audioList[index] : '';
		});
	
		audioElement.load(); // Load the newly selected track
	}
	
	async function loadJsmediatagsAndReadMetadata() {
		try {
			await import('../js/jsmediatags.min.js');
			const jsmediatags = window.jsmediatags;
			const audioUrl = audioList[currentAudioIndex];
	
			jsmediatags.read(audioUrl, {
				onSuccess: function (tag) {
					const poster = tag.tags.picture;
					const title = tag.tags.title;
					const artist = tag.tags.artist;
	
					if (poster) {
						const byteArray = new Uint8Array(poster.data);
						let binary = '';
						byteArray.forEach((byte) => {
							binary += String.fromCharCode(byte);
						});
						const base64Image = window.btoa(binary);
						const imageUrl = 'data:' + poster.format + ';base64,' + base64Image;
	
						document.querySelectorAll('.Music .ArtWork img').forEach((img) => {
							img.src = imageUrl;
						});
					}
	
					const titleElement = document.querySelector('.Music strong');
					if (titleElement) {
						titleElement.textContent = title || 'Unknown Title';
					}
	
					const artistElement = document.querySelector('.Music p');
					if (artistElement) {
						artistElement.textContent = artist || 'Unknown Artist';
					}
	
					updateRemainingTimeDisplay();
				},
				onError: function (error) {
					console.error("⚠️ Error reading Music MetaData:", error);
				}
			});
		} catch (error) {
			console.error("❌ Failed to load jsMediaTags:", error);
		}
	}
	
	function updateRemainingTimeDisplay() {
		const durationFloored = Math.floor(audioElement.duration);
		const remainingTime = isNaN(durationFloored) ? 0 : durationFloored;
		const remainingMinutes = Math.floor(remainingTime / 60);
		const remainingSeconds = remainingTime % 60;
	
		durationTimeDisplay.textContent =
			remainingTime === 0
				? '0:00'
				: `-${remainingMinutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
	}
	
	const progressBar = document.querySelector('.Benex.Music .Wrapper .ProgressBar');
	const currentTimeDisplay = document.querySelector('.Benex.Music .Wrapper .Current');
	const durationTimeDisplay = document.querySelector('.Benex.Music .Wrapper .Duration');
	
	audioElement.addEventListener('timeupdate', function () {
		const progress = isNaN(audioElement.currentTime / audioElement.duration * 100) ? 0 : (audioElement.currentTime / audioElement.duration) * 100;
		progressBar.value = progress;
		progressBar.style.setProperty('--value', progressBar.value);
		progressBar.style.setProperty('--min', progressBar.min || '0');
		progressBar.style.setProperty('--max', progressBar.max || '100');
	
		const currentTimeFloored = Math.floor(audioElement.currentTime);
		const durationFloored = Math.floor(audioElement.duration);
		const currentMinutes = Math.floor(currentTimeFloored / 60);
		const currentSeconds = currentTimeFloored % 60;
		const remainingTime = Math.floor(durationFloored - currentTimeFloored);
		const remainingMinutes = Math.floor(remainingTime / 60);
		const remainingSeconds = remainingTime % 60;
	
		currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' + currentSeconds : currentSeconds}`;
		durationTimeDisplay.textContent =
			remainingTime === 0
				? '0:00'
				: `-${remainingMinutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
	});
	
	progressBar.addEventListener('input', function () {
		const seekTime = (progressBar.value / 100) * audioElement.duration;
		audioElement.currentTime = seekTime;
		progressBar.style.setProperty('--value', progressBar.value);
	});
	
	const playButton = document.querySelector('.Music .Controls .Play');
	const pauseButton = document.querySelector('.Music .Controls .Pause');
	
	function updatePlayPauseButtons() {
		if (audioElement.paused) {
			playButton.classList.remove('Hide');
			pauseButton.classList.add('Hide');
		} else {
			pauseButton.classList.remove('Hide');
			playButton.classList.add('Hide');
		}
	}
	updatePlayPauseButtons();
	
	playButton.addEventListener('click', function () {
		audioElement.play();
		updatePlayPauseButtons();
	});
	
	pauseButton.addEventListener('click', function () {
		audioElement.pause();
		updatePlayPauseButtons();
	});
	
	const prevButton = document.querySelector('.Music .Controls .Prev');
	const nextButton = document.querySelector('.Music .Controls .Next');
	
	prevButton.addEventListener('click', function () {
		const isPlaying = !audioElement.paused;
		currentAudioIndex = (currentAudioIndex - 1 + audioList.length) % audioList.length;
		updateSourceForCurrentAudio();
		loadJsmediatagsAndReadMetadata();
		if (isPlaying) {
			audioElement.play();
		}
		updatePlayPauseButtons();
	});
	
	nextButton.addEventListener('click', function () {
		const isPlaying = !audioElement.paused;
		currentAudioIndex = (currentAudioIndex + 1) % audioList.length;
		updateSourceForCurrentAudio();
		loadJsmediatagsAndReadMetadata();
		if (isPlaying) {
			audioElement.play();
		}
		updatePlayPauseButtons();
	});
	
	audioElement.addEventListener('ended', function () {
		currentAudioIndex = (currentAudioIndex + 1) % audioList.length;
		updateSourceForCurrentAudio();
		loadJsmediatagsAndReadMetadata();
		audioElement.play();
		updatePlayPauseButtons();
	});
	
	// 👇 Initial call (lazy load first song when user interacts)
	updateSourceForCurrentAudio();
	loadJsmediatagsAndReadMetadata();
	

	/*-----------------------------------------------------------------------------*/
	/* Photos Benex ---------------------------------------------------------------*/
	/*-----------------------------------------------------------------------------*/
    const photoSlider = document.querySelector('.PhotoSlider');
    const sliderImages = photoSlider.querySelectorAll('.Photo');
    const navItems = document.querySelectorAll('.Nav .Item');
	const indicator = document.querySelector('.Nav .Indicator');
    let currentIndex = 0;
    const showImage = (index, filteredImages) => {
        sliderImages.forEach((media) => {
            media.classList.remove('visible');
            if (media.tagName.toLowerCase() === 'video') {
                media.pause(); // Pause all videos
            }
        });
        const currentMedia = sliderImages[filteredImages[index]];
        currentMedia.classList.add('visible');
        if (currentMedia.tagName.toLowerCase() === 'video') {
            currentMedia.play();
        }
    };

    navItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('Active'));
            item.classList.add('Active');
            const activeClass = item.classList[1];
            filterImagesByClass(activeClass);
            const itemRect = item.getBoundingClientRect();
            const navRect = item.parentElement.getBoundingClientRect();
            const leftSpace = itemRect.left - navRect.left;
			indicator.style.width = `${item.clientWidth}px`;
			indicator.style.height = `${item.clientHeight}px`;
			indicator.style.left = `${leftSpace}px`;
			function adjustIndicator() {
				const itemRect = item.getBoundingClientRect();
				const navRect = item.parentElement.getBoundingClientRect();
				const leftSpace = itemRect.left - navRect.left;
				indicator.style.width = `${item.clientWidth}px`;
				indicator.style.height = `${item.clientHeight}px`;
				indicator.style.left = `${leftSpace}px`;
			}
			adjustIndicator();
			window.addEventListener('resize', adjustIndicator);
        });
    });
	
    const filterImagesByClass = (activeClass) => {
        const filteredImages = [];
        sliderImages.forEach((media, index) => {
            if (media.classList.contains(activeClass)) {
                filteredImages.push(index);
            }
        });
        if (filteredImages.length > 0) {
            currentIndex = 0;
            showImage(currentIndex, filteredImages);
        }
    };

    sliderImages.forEach((media) => {
        media.addEventListener('click', function() {
            const activeClass = document.querySelector('.Nav .Item.Active')?.classList[1];
            const filteredImages = [];
            sliderImages.forEach((media, index) => {
                if (media.classList.contains(activeClass)) {
                    filteredImages.push(index);
                }
            });
            currentIndex = (currentIndex + 1) % filteredImages.length;
            showImage(currentIndex, filteredImages);
        });
    });

    if (navItems.length > 0) {
        navItems[0].click();
    }
	let autoSlideInterval;
    const startAutoSlide = () => {
        autoSlideInterval = setInterval(() => {
            const activeClass = document.querySelector('.Nav .Item.Active')?.classList[1];
            const filteredImages = [];
            sliderImages.forEach((media, index) => {
                if (media.classList.contains(activeClass)) {
                    filteredImages.push(index);
                }
            });
            currentIndex = (currentIndex + 1) % filteredImages.length;
            showImage(currentIndex, filteredImages);
        }, 3200);
    };
    const stopAutoSlide = () => {
        clearInterval(autoSlideInterval);
    };
    startAutoSlide();
    const benexPhotos = document.querySelector('.Benex.Photos');
    benexPhotos.addEventListener('mouseenter', function() {
        stopAutoSlide();
    });
    benexPhotos.addEventListener('mouseleave', function() {
        startAutoSlide();
    });




});