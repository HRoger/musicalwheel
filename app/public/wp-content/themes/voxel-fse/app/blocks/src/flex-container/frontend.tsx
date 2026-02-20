/**
 * Flex Container Block - Frontend Script
 *
 * Handles slideshow background animation for flex-container blocks.
 * Supports both auto-play (infinite loop) and manual drag/swipe navigation.
 * Reads configuration from data attributes on .voxel-fse-slideshow-background elements.
 *
 * @package VoxelFSE
 */

interface SlideshowConfig {
	duration: number;
	transition: string;
	transitionDuration: number;
	kenBurns: boolean;
	infinite: boolean;
}

interface DragState {
	isDragging: boolean;
	startX: number;
	startY: number;
	currentX: number;
	currentY: number;
}

/**
 * Initialize slideshow for a container
 */
function initSlideshow(container: HTMLElement): void {
	const slides = container.querySelectorAll<HTMLElement>('.voxel-fse-slideshow-slide');
	if (slides.length < 2) return;

	// Parse config from data attributes
	const config: SlideshowConfig = {
		duration: parseInt(container.dataset['duration'] || '5000', 10),
		transition: container.dataset['transition'] || 'fade',
		transitionDuration: parseInt(container.dataset['transitionDuration'] || '500', 10),
		kenBurns: container.dataset['kenBurns'] === 'true',
		infinite: container.dataset['infinite'] !== 'false',
	};

	let currentIndex = 0;
	let isRunning = config.infinite;
	let autoPlayInterval: ReturnType<typeof setInterval> | null = null;

	// Drag state
	const dragState: DragState = {
		isDragging: false,
		startX: 0,
		startY: 0,
		currentX: 0,
		currentY: 0,
	};

	// Drag threshold (minimum distance to trigger slide change)
	const DRAG_THRESHOLD = 50;

	// Ken Burns effect CSS
	if (config.kenBurns) {
		slides.forEach((slide, index) => {
			slide.style.animation = `kenBurns ${config.duration + config.transitionDuration}ms ease-in-out infinite`;
			slide.style.animationDelay = `${index * config.duration}ms`;
		});
	}

	/**
	 * Go to a specific slide
	 */
	function goToSlide(targetIndex: number, direction?: 'next' | 'prev'): void {
		if (targetIndex === currentIndex) return;
		if (targetIndex < 0 || targetIndex >= slides.length) return;

		const prevIndex = currentIndex;
		currentIndex = targetIndex;

		// Determine direction if not provided
		if (!direction) {
			direction = targetIndex > prevIndex ? 'next' : 'prev';
		}

		// Apply transition based on type
		if (config.transition === 'fade') {
			slides[prevIndex].style.opacity = '0';
			slides[currentIndex].style.opacity = '1';
		} else if (config.transition === 'slide_left') {
			if (direction === 'next') {
				slides[prevIndex].style.transform = 'translateX(-100%)';
				slides[prevIndex].style.opacity = '0';
				slides[currentIndex].style.transform = 'translateX(0)';
				slides[currentIndex].style.opacity = '1';
				setTimeout(() => {
					slides[prevIndex].style.transform = 'translateX(100%)';
				}, config.transitionDuration);
			} else {
				slides[prevIndex].style.transform = 'translateX(100%)';
				slides[prevIndex].style.opacity = '0';
				slides[currentIndex].style.transform = 'translateX(0)';
				slides[currentIndex].style.opacity = '1';
				setTimeout(() => {
					slides[prevIndex].style.transform = 'translateX(100%)';
				}, config.transitionDuration);
			}
		} else if (config.transition === 'slide_right') {
			if (direction === 'next') {
				slides[prevIndex].style.transform = 'translateX(100%)';
				slides[prevIndex].style.opacity = '0';
				slides[currentIndex].style.transform = 'translateX(0)';
				slides[currentIndex].style.opacity = '1';
				setTimeout(() => {
					slides[prevIndex].style.transform = 'translateX(-100%)';
				}, config.transitionDuration);
			} else {
				slides[prevIndex].style.transform = 'translateX(-100%)';
				slides[prevIndex].style.opacity = '0';
				slides[currentIndex].style.transform = 'translateX(0)';
				slides[currentIndex].style.opacity = '1';
				setTimeout(() => {
					slides[prevIndex].style.transform = 'translateX(-100%)';
				}, config.transitionDuration);
			}
		} else if (config.transition === 'slide_up') {
			if (direction === 'next') {
				slides[prevIndex].style.transform = 'translateY(-100%)';
				slides[prevIndex].style.opacity = '0';
				slides[currentIndex].style.transform = 'translateY(0)';
				slides[currentIndex].style.opacity = '1';
				setTimeout(() => {
					slides[prevIndex].style.transform = 'translateY(100%)';
				}, config.transitionDuration);
			} else {
				slides[prevIndex].style.transform = 'translateY(100%)';
				slides[prevIndex].style.opacity = '0';
				slides[currentIndex].style.transform = 'translateY(0)';
				slides[currentIndex].style.opacity = '1';
				setTimeout(() => {
					slides[prevIndex].style.transform = 'translateY(100%)';
				}, config.transitionDuration);
			}
		} else if (config.transition === 'slide_down') {
			if (direction === 'next') {
				slides[prevIndex].style.transform = 'translateY(100%)';
				slides[prevIndex].style.opacity = '0';
				slides[currentIndex].style.transform = 'translateY(0)';
				slides[currentIndex].style.opacity = '1';
				setTimeout(() => {
					slides[prevIndex].style.transform = 'translateY(-100%)';
				}, config.transitionDuration);
			} else {
				slides[prevIndex].style.transform = 'translateY(-100%)';
				slides[prevIndex].style.opacity = '0';
				slides[currentIndex].style.transform = 'translateY(0)';
				slides[currentIndex].style.opacity = '1';
				setTimeout(() => {
					slides[prevIndex].style.transform = 'translateY(-100%)';
				}, config.transitionDuration);
			}
		}
	}

	/**
	 * Go to next slide
	 */
	function nextSlide(): void {
		let nextIndex = currentIndex + 1;

		// Handle wrapping
		if (nextIndex >= slides.length) {
			if (config.infinite) {
				nextIndex = 0;
			} else {
				isRunning = false;
				return;
			}
		}

		goToSlide(nextIndex, 'next');
	}

	/**
	 * Go to previous slide
	 */
	function prevSlide(): void {
		let prevIndex = currentIndex - 1;

		// Handle wrapping
		if (prevIndex < 0) {
			if (config.infinite) {
				prevIndex = slides.length - 1;
			} else {
				return;
			}
		}

		goToSlide(prevIndex, 'prev');
	}

	/**
	 * Handle drag start (mouse/touch)
	 */
	function handleDragStart(clientX: number, clientY: number): void {
		dragState.isDragging = true;
		dragState.startX = clientX;
		dragState.startY = clientY;
		dragState.currentX = clientX;
		dragState.currentY = clientY;

		// Pause auto-play during drag
		if (autoPlayInterval) {
			clearInterval(autoPlayInterval);
			autoPlayInterval = null;
		}

		// Add grabbing cursor
		container.style.cursor = 'grabbing';
	}

	/**
	 * Handle drag move (mouse/touch)
	 */
	function handleDragMove(clientX: number, clientY: number): void {
		if (!dragState.isDragging) return;

		dragState.currentX = clientX;
		dragState.currentY = clientY;
	}

	/**
	 * Handle drag end (mouse/touch)
	 */
	function handleDragEnd(): void {
		if (!dragState.isDragging) return;

		dragState.isDragging = false;
		container.style.cursor = 'grab';

		// Calculate drag distance
		const deltaX = dragState.currentX - dragState.startX;
		const deltaY = dragState.currentY - dragState.startY;

		// Determine if drag was horizontal or vertical based on transition type
		const isHorizontalTransition = config.transition === 'slide_left' ||
			config.transition === 'slide_right' ||
			config.transition === 'fade';

		if (isHorizontalTransition) {
			// Horizontal drag
			if (Math.abs(deltaX) > DRAG_THRESHOLD) {
				if (deltaX < 0) {
					// Dragged left -> go to next slide
					nextSlide();
				} else {
					// Dragged right -> go to previous slide
					prevSlide();
				}
			}
		} else {
			// Vertical drag (slide_up, slide_down)
			if (Math.abs(deltaY) > DRAG_THRESHOLD) {
				if (deltaY < 0) {
					// Dragged up -> go to next slide
					nextSlide();
				} else {
					// Dragged down -> go to previous slide
					prevSlide();
				}
			}
		}

		// Restart auto-play if infinite loop is enabled
		if (config.infinite && isRunning) {
			autoPlayInterval = setInterval(() => {
				if (isRunning) nextSlide();
			}, config.duration);
		}
	}

	// Mouse event handlers
	function onMouseDown(e: MouseEvent): void {
		// Only handle left mouse button
		if (e.button !== 0) return;
		e.preventDefault();
		handleDragStart(e.clientX, e.clientY);
	}

	function onMouseMove(e: MouseEvent): void {
		if (!dragState.isDragging) return;
		e.preventDefault();
		handleDragMove(e.clientX, e.clientY);
	}

	function onMouseUp(_e: MouseEvent): void {
		handleDragEnd();
	}

	function onMouseLeave(_e: MouseEvent): void {
		if (dragState.isDragging) {
			handleDragEnd();
		}
	}

	// Touch event handlers
	function onTouchStart(e: TouchEvent): void {
		if (e.touches.length !== 1) return;
		const touch = e.touches[0];
		handleDragStart(touch.clientX, touch.clientY);
	}

	function onTouchMove(e: TouchEvent): void {
		if (!dragState.isDragging || e.touches.length !== 1) return;
		const touch = e.touches[0];
		handleDragMove(touch.clientX, touch.clientY);
	}

	function onTouchEnd(_e: TouchEvent): void {
		handleDragEnd();
	}

	// Set initial transition styles
	slides.forEach((slide, index) => {
		slide.style.transition = `opacity ${config.transitionDuration}ms ease, transform ${config.transitionDuration}ms ease`;
		if (index !== 0) {
			slide.style.opacity = '0';
			// Pre-position slides for slide transitions
			if (config.transition === 'slide_left') {
				slide.style.transform = 'translateX(100%)';
			} else if (config.transition === 'slide_right') {
				slide.style.transform = 'translateX(-100%)';
			} else if (config.transition === 'slide_up') {
				slide.style.transform = 'translateY(100%)';
			} else if (config.transition === 'slide_down') {
				slide.style.transform = 'translateY(-100%)';
			}
		}
	});

	// Set up drag cursor
	container.style.cursor = 'grab';

	// Attach mouse event listeners
	container.addEventListener('mousedown', onMouseDown);
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);
	container.addEventListener('mouseleave', onMouseLeave);

	// Attach touch event listeners
	container.addEventListener('touchstart', onTouchStart, { passive: true });
	container.addEventListener('touchmove', onTouchMove, { passive: true });
	container.addEventListener('touchend', onTouchEnd, { passive: true });

	// Start auto-play if infinite loop is enabled
	if (config.infinite) {
		autoPlayInterval = setInterval(() => {
			if (isRunning) nextSlide();
		}, config.duration);
	}
}

/**
 * Initialize all slideshows on the page
 */
function initAllSlideshows(): void {
	console.log('[Flex Container] initAllSlideshows called');
	const slideshows = document.querySelectorAll<HTMLElement>('.voxel-fse-slideshow-background');
	console.log('[Flex Container] Found slideshows:', slideshows.length);
	slideshows.forEach((slideshow, index) => {
		console.log(`[Flex Container] Initializing slideshow ${index}`, slideshow);
		initSlideshow(slideshow);
	});
}

// Add Ken Burns keyframes to document
function addKenBurnsStyles(): void {
	if (document.getElementById('voxel-fse-ken-burns-styles')) return;

	const style = document.createElement('style');
	style.id = 'voxel-fse-ken-burns-styles';
	style.textContent = `
		@keyframes kenBurns {
			0% {
				transform: scale(1) translate(0, 0);
			}
			50% {
				transform: scale(1.1) translate(-2%, -2%);
			}
			100% {
				transform: scale(1) translate(0, 0);
			}
		}
	`;
	document.head.appendChild(style);
}

/**
 * Initialize entrance animations using IntersectionObserver.
 * Matches Elementor's animated class system.
 */
function initEntranceAnimations(): void {
	const containers = document.querySelectorAll<HTMLElement>('.voxel-fse-flex-container[data-animation]');
	if (!containers.length) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const el = entry.target as HTMLElement;
					const animation = el.dataset['animation'];
					const duration = el.dataset['animationDuration'];
					const delay = el.dataset['animationDelay'];

					if (!animation) return;

					// Apply delay if set
					if (delay && parseFloat(delay) > 0) {
						el.style.animationDelay = `${delay}ms`;
					}

					// Apply duration class (slow, fast, faster)
					if (duration) {
						el.classList.add(`animated-${duration}`);
					}

					// Add animation class to trigger it
					el.classList.add('animated', animation);

					// Stop observing after animation triggers
					observer.unobserve(el);
				}
			});
		},
		{ threshold: 0.1 }
	);

	containers.forEach((container) => {
		// Hide initially until animation triggers
		container.style.opacity = '0';
		observer.observe(container);
	});
}

// Initialize when DOM is ready
console.log('[Flex Container] Frontend script loaded, readyState:', document.readyState);
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		console.log('[Flex Container] DOMContentLoaded fired');
		addKenBurnsStyles();
		initAllSlideshows();
		initEntranceAnimations();
	});
} else {
	console.log('[Flex Container] DOM already loaded, initializing immediately');
	addKenBurnsStyles();
	initAllSlideshows();
	initEntranceAnimations();
}
