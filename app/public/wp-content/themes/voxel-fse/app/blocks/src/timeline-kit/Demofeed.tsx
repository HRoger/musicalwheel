/**
 * Timeline Kit Demofeed Component
 *
 * Matches Voxel's timeline-kit.php demofeed structure 1:1
 * Evidence: themes/voxel/templates/widgets/timeline-kit.php
 */

// Placeholder image - gradient SVG
const placeholderImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238B5CF6'/%3E%3Cstop offset='100%25' style='stop-color:%2306B6D4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='200' height='200'/%3E%3C/svg%3E";

// SVG Icons (matching Voxel originals)
const HeartIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M11.8227 4.77124L12 4.94862L12.1773 4.77135C14.4244 2.52427 18.0676 2.52427 20.3147 4.77134C22.5618 7.01842 22.5618 10.6616 20.3147 12.9087L13.591 19.6324C12.7123 20.5111 11.2877 20.5111 10.409 19.6324L3.6853 12.9086C1.43823 10.6615 1.43823 7.01831 3.6853 4.77124C5.93237 2.52417 9.5756 2.52417 11.8227 4.77124ZM10.762 5.8319C9.10073 4.17062 6.40725 4.17062 4.74596 5.8319C3.08468 7.49319 3.08468 10.1867 4.74596 11.848L11.4697 18.5718C11.7625 18.8647 12.2374 18.8647 12.5303 18.5718L19.254 11.8481C20.9153 10.1868 20.9153 7.49329 19.254 5.83201C17.5927 4.17072 14.8993 4.17072 13.238 5.83201L12.5304 6.53961C12.3897 6.68026 12.199 6.75928 12 6.75928C11.8011 6.75928 11.6104 6.68026 11.4697 6.53961L10.762 5.8319Z" />
	</svg>
);

const HeartFilledIcon = () => (
	<svg fill="currentColor" width="52" height="52" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
		<path d="M32,57.6c-0.8,0-1.6-0.3-2.2-0.8c-2.3-2-4.6-3.9-6.6-5.6l0,0c-5.8-4.9-10.9-9.2-14.4-13.4C4.8,33,3,28.6,3,23.7c0-4.7,1.6-9.1,4.6-12.3c3-3.2,7.1-5,11.6-5c3.3,0,6.4,1.1,9.1,3.1c1.1,0.8,2,1.8,2.9,2.9c0.4,0.5,1.1,0.5,1.5,0c0.9-1.1,1.9-2,2.9-2.9c2.7-2.1,5.8-3.1,9.1-3.1c4.5,0,8.6,1.8,11.6,5c3,3.2,4.6,7.6,4.6,12.3c0,4.9-1.8,9.3-5.8,14c-3.5,4.2-8.6,8.5-14.4,13.4c-2,1.7-4.3,3.6-6.6,5.6C33.6,57.3,32.8,57.6,32,57.6z" />
	</svg>
);

const RepostIcon = () => (
	<svg viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M18.5324 16.7804C18.2395 16.4875 18.2394 16.0126 18.5323 15.7197C18.8252 15.4268 19.3001 15.4268 19.593 15.7196L22.0931 18.2195C22.2338 18.3601 22.3128 18.5509 22.3128 18.7498C22.3128 18.9487 22.2338 19.1395 22.0932 19.2802L19.593 21.7803C19.3001 22.0732 18.8252 22.0732 18.5323 21.7803C18.2394 21.4874 18.2394 21.0126 18.5323 20.7197L19.752 19.5H5.06267C3.82003 19.5 2.81267 18.4926 2.81267 17.25V12C2.81267 11.5858 3.14846 11.25 3.56267 11.25C3.97688 11.25 4.31267 11.5858 4.31267 12V17.25C4.31267 17.6642 4.64846 18 5.06267 18H19.7522L18.5324 16.7804Z" />
		<path d="M21.0627 12.75C20.6485 12.75 20.3127 12.4142 20.3127 12V6.75C20.3127 6.33579 19.9769 6 19.5627 6H4.87316L6.09296 7.21963C6.38588 7.51251 6.38591 7.98738 6.09304 8.28029C5.80016 8.57321 5.32529 8.57324 5.03238 8.28037L2.53221 5.78054C2.39154 5.63989 2.31251 5.44912 2.3125 5.2502C2.31249 5.05127 2.39151 4.8605 2.53217 4.71984L5.03234 2.21967C5.32523 1.92678 5.80011 1.92678 6.093 2.21967C6.38589 2.51256 6.38589 2.98744 6.093 3.28033L4.87333 4.5H19.5627C20.8053 4.5 21.8127 5.50736 21.8127 6.75V12C21.8127 12.4142 21.4769 12.75 21.0627 12.75Z" />
	</svg>
);

const ShareIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M21.375 8.62636C21.3753 8.81862 21.3021 9.01096 21.1555 9.15769L17.1555 13.1605C16.8627 13.4535 16.3878 13.4536 16.0949 13.1609C15.8019 12.8681 15.8017 12.3932 16.0945 12.1002L18.8177 9.37503H8.75C6.19568 9.37503 4.125 11.4457 4.125 14C4.125 16.5543 6.19568 18.625 8.75 18.625H16.6571C17.0713 18.625 17.4071 18.9608 17.4071 19.375C17.4071 19.7892 17.0713 20.125 16.6571 20.125H8.75C5.36726 20.125 2.625 17.3828 2.625 14C2.625 10.6173 5.36726 7.87503 8.75 7.87503H18.8126L16.0945 5.15516C15.8017 4.86217 15.8019 4.3873 16.0948 4.0945C16.3878 3.8017 16.8627 3.80185 17.1555 4.09484L21.1176 8.05948C21.2753 8.19698 21.375 8.39936 21.375 8.62503L21.375 8.62636Z" />
	</svg>
);

const CommentIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M7 10.5957C7 10.1815 7.33579 9.8457 7.75 9.8457H16.25C16.6642 9.8457 17 10.1815 17 10.5957C17 11.0099 16.6642 11.3457 16.25 11.3457H7.75C7.33579 11.3457 7 11.0099 7 10.5957Z" />
		<path d="M7.75 12.8457C7.33579 12.8457 7 13.1815 7 13.5957C7 14.0099 7.33579 14.3457 7.75 14.3457H12.75C13.1642 14.3457 13.5 14.0099 13.5 13.5957C13.5 13.1815 13.1642 12.8457 12.75 12.8457H7.75Z" />
		<path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12V20H12C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5H3.25C2.83579 21.5 2.5 21.1642 2.5 20.75V12Z" />
	</svg>
);

const MoreIcon = () => (
	<svg viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M6.3125 13.7558C5.346 13.7559 4.5625 12.9723 4.5625 12.0059V11.9959C4.5625 11.0294 5.346 10.2458 6.3125 10.2458C7.279 10.2458 8.0625 11.0294 8.0625 11.9958V12.0058C8.0625 12.9723 7.279 13.7558 6.3125 13.7558Z" />
		<path d="M18.3125 13.7558C17.346 13.7558 16.5625 12.9723 16.5625 12.0058V11.9958C16.5625 11.0294 17.346 10.2458 18.3125 10.2458C19.279 10.2458 20.0625 11.0294 20.0625 11.9958V12.0058C20.0625 12.9723 19.279 13.7558 18.3125 13.7558Z" />
		<path d="M10.5625 12.0058C10.5625 12.9723 11.346 13.7558 12.3125 13.7558C13.279 13.7558 14.0625 12.9723 14.0625 12.0058V11.9958C14.0625 11.0294 13.279 10.2458 12.3125 10.2458C11.346 10.2458 10.5625 11.0294 10.5625 11.9958V12.0058Z" />
	</svg>
);

const VerifiedIcon = () => (
	<svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
		<path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
	</svg>
);

const SearchIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M11.25 2.75C6.14154 2.75 2 6.89029 2 11.998C2 17.1056 6.14154 21.2459 11.25 21.2459C13.5335 21.2459 15.6238 20.4187 17.2373 19.0475L20.7182 22.5287C21.011 22.8216 21.4859 22.8217 21.7788 22.5288C22.0717 22.2359 22.0718 21.761 21.7789 21.4681L18.2983 17.9872C19.6714 16.3736 20.5 14.2826 20.5 11.998C20.5 6.89029 16.3585 2.75 11.25 2.75ZM3.5 11.998C3.5 7.71905 6.96962 4.25 11.25 4.25C15.5304 4.25 19 7.71905 19 11.998C19 16.2769 15.5304 19.7459 11.25 19.7459C6.96962 19.7459 3.5 16.2769 3.5 11.998Z" />
	</svg>
);

const StarIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
	</svg>
);

const ImageIcon = () => (
	<svg width="80" height="80" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M8.25016 10.5C7.5598 10.5 7.00016 11.0596 7.00016 11.75C7.00016 12.4404 7.5598 13 8.25016 13H8.26016C8.95051 13 9.51016 12.4404 9.51016 11.75C9.51016 11.0596 8.95051 10.5 8.26016 10.5H8.25016Z" />
		<path fillRule="evenodd" clipRule="evenodd" d="M7.75016 5.5C7.75016 4.25736 8.75751 3.25 10.0002 3.25H19.0002C20.2428 3.25 21.2502 4.25736 21.2502 5.5V14.5C21.2502 15.7426 20.2428 16.75 19.0002 16.75H17.2502V18.5C17.2502 19.7426 16.2428 20.75 15.0002 20.75H6.00016C4.75751 20.75 3.75016 19.7426 3.75016 18.5V17.6916C3.74995 17.6814 3.74995 17.6712 3.75016 17.6611V9.5C3.75016 8.25736 4.75751 7.25 6.00016 7.25H7.75016V5.5ZM15.7502 9.5V15.9558L13.4851 13.8525C12.789 13.206 11.7619 13.0665 10.9186 13.5037L5.25016 16.4421L5.25016 9.5C5.25016 9.08579 5.58594 8.75 6.00016 8.75H15.0002C15.4144 8.75 15.7502 9.08579 15.7502 9.5ZM5.25016 18.5V18.1317L11.6089 14.8354C11.89 14.6896 12.2324 14.7362 12.4644 14.9516L15.7502 18.0028V18.5C15.7502 18.9142 15.4144 19.25 15.0002 19.25H6.00016C5.58594 19.25 5.25016 18.9142 5.25016 18.5ZM9.25016 7.25H15.0002C16.2428 7.25 17.2502 8.25736 17.2502 9.5V15.25H19.0002C19.4144 15.25 19.7502 14.9142 19.7502 14.5V5.5C19.7502 5.08579 19.4144 4.75 19.0002 4.75H10.0002C9.58594 4.75 9.25016 5.08579 9.25016 5.5V7.25Z" />
	</svg>
);

const EmojiIcon = () => (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM12 20.5C7.31 20.5 3.5 16.69 3.5 12C3.5 7.31 7.31 3.5 12 3.5C16.69 3.5 20.5 7.31 20.5 12C20.5 16.69 16.69 20.5 12 20.5Z" />
		<path d="M17.6 13.19C17.37 13.04 17.07 13.02 16.83 13.15C16.81 13.16 14.56 14.35 12 14.35C9.44 14.35 7.19 13.16 7.17 13.15C6.93 13.02 6.63 13.03 6.4 13.19C6.17 13.34 6.04 13.61 6.07 13.89C6.3 16.26 8.46 18.78 12 18.78C15.54 18.78 17.69 16.26 17.93 13.89C17.96 13.61 17.83 13.35 17.6 13.19ZM12 17.27C10.07 17.27 8.7 16.31 8.02 15.13C9.04 15.48 10.45 15.85 12 15.85C13.55 15.85 14.96 15.49 15.98 15.13C15.3 16.31 13.93 17.27 12 17.27Z" />
	</svg>
);

const RefreshIcon = () => (
	<svg width="80" height="80" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M3.13644 9.54175C3.02923 9.94185 3.26667 10.3531 3.66676 10.4603C4.06687 10.5675 4.47812 10.3301 4.58533 9.92998C5.04109 8.22904 6.04538 6.72602 7.44243 5.65403C8.83948 4.58203 10.5512 4.00098 12.3122 4.00098C14.0731 4.00098 15.7848 4.58203 17.1819 5.65403C18.3999 6.58866 19.3194 7.85095 19.8371 9.28639L18.162 8.34314C17.801 8.1399 17.3437 8.26774 17.1405 8.62867C16.9372 8.98959 17.0651 9.44694 17.426 9.65017L20.5067 11.3849C20.68 11.4825 20.885 11.5072 21.0766 11.4537C21.2682 11.4001 21.4306 11.2727 21.5282 11.0993L23.2629 8.01828C23.4661 7.65734 23.3382 7.2 22.9773 6.99679C22.6163 6.79358 22.159 6.92145 21.9558 7.28239L21.195 8.63372C20.5715 6.98861 19.5007 5.54258 18.095 4.464C16.436 3.19099 14.4033 2.50098 12.3122 2.50098C10.221 2.50098 8.1883 3.19099 6.52928 4.464C4.87027 5.737 3.67766 7.52186 3.13644 9.54175Z" />
		<path d="M21.4906 14.4582C21.5978 14.0581 21.3604 13.6469 20.9603 13.5397C20.5602 13.4325 20.1489 13.6699 20.0417 14.07C19.5859 15.7709 18.5816 17.274 17.1846 18.346C15.7875 19.418 14.0758 19.999 12.3149 19.999C10.5539 19.999 8.84219 19.418 7.44514 18.346C6.2292 17.4129 5.31079 16.1534 4.79261 14.721L6.45529 15.6573C6.81622 15.8605 7.27356 15.7327 7.47679 15.3718C7.68003 15.0108 7.55219 14.5535 7.19127 14.3502L4.11056 12.6155C3.93723 12.5179 3.73222 12.4932 3.54065 12.5467C3.34907 12.6003 3.18662 12.7278 3.08903 12.9011L1.3544 15.9821C1.15119 16.3431 1.27906 16.8004 1.64 17.0036C2.00094 17.2068 2.45828 17.079 2.66149 16.718L3.42822 15.3562C4.05115 17.0054 5.12348 18.4552 6.532 19.536C8.19102 20.809 10.2237 21.499 12.3149 21.499C14.406 21.499 16.4387 20.809 18.0977 19.536C19.7568 18.263 20.9494 16.4781 21.4906 14.4582Z" />
	</svg>
);

const DeleteIcon = () => (
	<svg width="80" height="80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75Z" />
		<path d="M14.75 10.5C14.75 10.0858 14.4142 9.75 14 9.75C13.5858 9.75 13.25 10.0858 13.25 10.5V16.5C13.25 16.9142 13.5858 17.25 14 17.25C14.4142 17.25 14.75 16.9142 14.75 16.5V10.5Z" />
		<path fillRule="evenodd" clipRule="evenodd" d="M7.99951 4.25C7.99951 3.00736 9.00687 2 10.2495 2H13.7495C14.9922 2 15.9995 3.00736 15.9995 4.25V5H19.999C20.4132 5 20.749 5.33579 20.749 5.75C20.749 6.16421 20.4132 6.5 19.999 6.5H19.5V19.75C19.5 20.9926 18.4926 22 17.25 22H6.75C5.50736 22 4.5 20.9926 4.5 19.75V6.5H4C3.58579 6.5 3.25 6.16421 3.25 5.75C3.25 5.33579 3.58579 5 4 5H7.99951V4.25ZM18 6.5H6V19.75C6 20.1642 6.33579 20.5 6.75 20.5H17.25C17.6642 20.5 18 20.1642 18 19.75V6.5ZM9.49951 5H14.4995V4.25C14.4995 3.83579 14.1637 3.5 13.7495 3.5H10.2495C9.8353 3.5 9.49951 3.83579 9.49951 4.25V5Z" />
	</svg>
);

const ExternalLinkIcon = () => (
	<svg viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M13.6568 3.25H6.32422C5.08158 3.25 4.07422 4.25736 4.07422 5.5V18.5C4.07422 19.7426 5.08158 20.75 6.32422 20.75H19.3228C20.5654 20.75 21.5728 19.7426 21.5728 18.5L21.5728 11.1642C21.3367 11.2484 21.0823 11.2943 20.8173 11.2944C20.5564 11.2945 20.3058 11.2502 20.0728 11.1686L20.0728 18.5C20.0728 18.9142 19.737 19.25 19.3228 19.25H6.32422C5.91 19.25 5.57422 18.9142 5.57422 18.5V5.5C5.57422 5.08579 5.91001 4.75 6.32422 4.75H13.6533C13.5714 4.51655 13.5269 4.2655 13.527 4.00406C13.5271 3.73955 13.5729 3.48571 13.6568 3.25Z" />
		<path d="M19.0017 4.75745L13.7462 10.0129C13.4533 10.3058 13.4533 10.7807 13.7462 11.0736C14.0391 11.3665 14.514 11.3665 14.8069 11.0736L20.0646 5.81588L20.0656 9.04612C20.0657 9.46033 20.4016 9.79601 20.8158 9.79588C21.2301 9.79575 21.5657 9.45985 21.5656 9.04564L21.564 4.02719C21.5697 3.82808 21.4966 3.62712 21.3447 3.47515C21.1823 3.31281 20.9641 3.24045 20.7519 3.25807L15.7763 3.25632C15.3621 3.25618 15.0262 3.59185 15.0261 4.00606C15.0259 4.42027 15.3616 4.75618 15.7758 4.75632L19.0017 4.75745Z" />
	</svg>
);

/**
 * Demofeed Component - Matches Voxel timeline-kit.php demofeed 1:1
 */
export default function Demofeed(): JSX.Element {
	return (
		<div className="vxfeed demofeed">
			{/* 1. Create Post (collapsed) */}
			<div className="vxf-create-post flexify">
				<div className="vxf-avatar flexify">
					<img src={placeholderImg} alt="Avatar" />
				</div>
				<div className="vxf-create-post__content">
					<div className="vxf-content__highlighter"></div>
					<textarea className="vxf-content__textarea" placeholder="What's on your mind, Albion?" maxLength={5000} readOnly />
				</div>
			</div>

			{/* 2. Create Post (expanded) */}
			<div className="vxf-create-post flexify vxf-expanded">
				<div className="vxf-avatar flexify">
					<img src={placeholderImg} alt="Avatar" />
				</div>
				<div className="vxf-create-post__content">
					<div className="vxf-content__highlighter"></div>
					<textarea className="vxf-content__textarea" placeholder="Write something" maxLength={5000} readOnly />
				</div>
				<div className="vxf-footer-wrapper" style={{ height: 'auto' }}>
					{/* File uploads */}
					<div className="ts-form-group ts-file-upload vxf-create-section">
						<div className="ts-file-list">
							{[1, 2, 3].map((i) => (
								<div key={i} className="ts-file ts-file-img" style={{
									backgroundImage: "url('/wp-content/themes/voxel/assets/images/bg.jpg')"
								}}>
									<a href="#" className="ts-remove-file flexify">
										<DeleteIcon />
									</a>
								</div>
							))}
						</div>
					</div>
					{/* Rating stars */}
					<div className="vxf-create-section review-cats">
						<div className="ts-form-group review-category">
							<label>Rating</label>
							<ul className="rs-stars simplify-ul flexify">
								{[1, 2, 3, 4, 5].map((i) => (
									<li key={i} className={`flexify ${i <= 3 ? 'active' : ''}`}>
										<div className="ts-star-icon">
											<StarIcon />
										</div>
									</li>
								))}
							</ul>
						</div>
						<div className="ts-form-group review-category">
							<label>General</label>
							<ul className="rs-num simplify-ul flexify">
								<li>1 <span>Poor</span></li>
								<li className="active">2 <span>Fair</span></li>
								<li>3 <span>Good</span></li>
								<li>4 <span>Very good</span></li>
								<li>5 <span>Excellent</span></li>
							</ul>
						</div>
					</div>
					{/* Footer with actions */}
					<div className="vxf-footer flexify">
						<div className="vxf-actions flexify">
							<a href="#" className="vxf-icon"><ImageIcon /></a>
							<a href="#" className="vxf-icon"><EmojiIcon /></a>
						</div>
						<div className="vxf-buttons flexify">
							<a href="#" className="ts-btn ts-btn-1">Cancel</a>
							<a href="#" className="ts-btn ts-btn-2">Publish</a>
						</div>
					</div>
				</div>
			</div>

			{/* 3. Filters */}
			<div className="vxf-filters">
				<div className="ts-form">
					<div className="ts-input-icon flexify">
						<SearchIcon />
						<input type="text" placeholder="Search" maxLength={128} readOnly />
					</div>
				</div>
				<a href="#">Most discussed <div className="ts-down-icon"></div></a>
			</div>

			{/* 4. Simple post with "Liked" highlight */}
			<div className="vxf-post">
				<div className="vxf-highlight flexify">
					<div className="vxf-icon"><HeartFilledIcon /></div>
					<span>Albion liked</span>
				</div>
				<div className="vxf-head flexify">
					<a href="#" className="vxf-avatar flexify"><img src={placeholderImg} alt="Albion" /></a>
					<div className="vxf-user flexify">
						<a href="#">Albion <div className="vxf-icon vxf-verified"><VerifiedIcon /></div></a>
						<span><a href="#">@admin</a><a href="#">6d</a></span>
					</div>
					<a href="#" className="vxf-icon vxf-more"><MoreIcon /></a>
				</div>
				<div className="vxf-body">
					<div className="vxf-body-text">Just another day at the beach! 🏖️</div>
				</div>
				<div className="vxf-footer flexify">
					<div className="vxf-actions flexify">
						<a href="#" className="vxf-icon"><HeartIcon /></a>
						<a href="#" className="vxf-icon"><RepostIcon /></a>
						<a href="#" className="vxf-icon"><ShareIcon /></a>
						<a href="#" className="vxf-icon vxf-has-replies"><CommentIcon /></a>
					</div>
					<div className="vxf-details flexify">
						<span><a href="#">12 replies</a></span>
					</div>
				</div>
			</div>

			{/* 5. Gallery post */}
			<div className="vxf-post">
				<div className="vxf-head flexify">
					<a href="#" className="vxf-avatar flexify"><img src={placeholderImg} alt="Albion" /></a>
					<div className="vxf-user flexify">
						<a href="#">Albion <div className="vxf-icon vxf-verified"><VerifiedIcon /></div></a>
						<span><a href="#">@albion</a><a href="#">Voxel Users</a><a href="#">14h</a></span>
					</div>
					<a href="#" className="vxf-icon vxf-more"><MoreIcon /></a>
				</div>
				<div className="vxf-body">
					<div className="vxf-body-text">Hello Voxel!</div>
					<ul className="vxf-gallery simplify-ul">
						{[1, 2, 3].map((i) => (
							<li key={i}><a href="#"><img src="/wp-content/themes/voxel/assets/images/bg.jpg" alt={`Gallery ${i}`} /></a></li>
						))}
					</ul>
				</div>
				<div className="vxf-footer flexify">
					<div className="vxf-actions flexify">
						<a href="#" className="vxf-icon vxf-liked"><HeartFilledIcon /></a>
						<a href="#" className="vxf-icon vxf-reposted"><RepostIcon /></a>
						<a href="#" className="vxf-icon"><ShareIcon /></a>
					</div>
					<div className="vxf-details flexify">
						<div className="vxf-recent-likes flexify">
							<img src={placeholderImg} alt="Like 1" />
							<img src={placeholderImg} alt="Like 2" />
						</div>
						<span><span>2 likes</span></span>
					</div>
				</div>
			</div>

			{/* 6. Review post */}
			<div className="vxf-post">
				<div className="vxf-head flexify">
					<a href="#" className="vxf-avatar flexify"><img src={placeholderImg} alt="Albion" /></a>
					<div className="vxf-user flexify">
						<a href="#">Albion <div className="vxf-icon vxf-verified"><VerifiedIcon /></div></a>
						<span><a href="#">@admin</a><a href="#">Voxel Users</a><a href="#">1w</a></span>
					</div>
					<a href="#" className="vxf-icon vxf-more"><MoreIcon /></a>
				</div>
				<div className="vxf-body">
					<div className="rev-score" style={{ '--ts-accent-1': '#1bafb1' } as React.CSSProperties}>
						<ul className="rev-star-score flexify simplify-ul">
							{[1, 2, 3, 4, 5].map((i) => (
								<li key={i} className={i <= 4 ? 'active' : ''}><span><StarIcon /></span></li>
							))}
						</ul>
						<span>Very good</span>
					</div>
					<div className="rev-score" style={{ '--ts-accent-1': '#1bafb1' } as React.CSSProperties}>
						<div className="rev-num-score flexify">3.5</div>
						<span>Very good</span>
					</div>
					<div className="rev-cats">
						{[
							{ label: 'Very good', active: 4, color: '#1bafb1' },
							{ label: 'Good', active: 3, color: '#ff2424' },
							{ label: 'Very good', active: 4, color: '#1bafb1' },
							{ label: 'Good', active: 3, color: '#ff2424' },
						].map((cat, idx) => (
							<div key={idx} className="review-cat" style={{ '--ts-accent-1': cat.color } as React.CSSProperties}>
								<span>{cat.label}</span>
								<ul className="rev-chart simplify-ul">
									{[1, 2, 3, 4, 5].map((i) => (
										<li key={i} className={i <= cat.active ? 'active' : ''}></li>
									))}
								</ul>
							</div>
						))}
					</div>
					<div className="vxf-body-text">Great!</div>
				</div>
				<div className="vxf-footer flexify">
					<div className="vxf-actions flexify">
						<a href="#" className="vxf-icon"><HeartIcon /></a>
						<a href="#" className="vxf-icon"><RepostIcon /></a>
						<a href="#" className="vxf-icon"><ShareIcon /></a>
						<a href="#" className="vxf-icon vxf-has-replies"><CommentIcon /></a>
					</div>
					<div className="vxf-details flexify">
						<span><a href="#">4 replies</a></span>
					</div>
				</div>
			</div>

			{/* 7. Rich text post with link preview */}
			<div className="vxf-post">
				<div className="vxf-head flexify">
					<a href="#" className="vxf-avatar flexify"><img src={placeholderImg} alt="Albion" /></a>
					<div className="vxf-user flexify">
						<a href="#">Albion <div className="vxf-icon vxf-verified"><VerifiedIcon /></div></a>
						<span><a href="#">@admin</a><a href="#">1w</a></span>
					</div>
					<a href="#" className="vxf-icon vxf-more"><MoreIcon /></a>
				</div>
				<div className="vxf-body">
					<div className="vxf-body-text">
						Some <strong>bold</strong>, <em>italic</em>, and <del>strikethrough</del> text!{'\n\n'}
						<code>Here some inline code!</code> A link <a href="#">https://example.com/</a>{'\n\n'}
						<a href="#">#VoxelOnePointFive</a> Tagging <a href="#">@admin</a>{'\n\n'}
						<pre className="min-scroll" data-lang="php">{`<?php
if ( ! defined('ABSPATH') ) {
    exit;
}

$current_user = \\Voxel\\get_current_user();
$current_post = \\Voxel\\get_current_post();
$mode = $this->get_settings( 'ts_mode' );`}</pre>
					</div>
					<a href="#" className="vxfeed__read-more"> Read less ▴ </a>
					<a href="#" target="_blank" rel="noopener noreferrer nofollow" className="vxf-link flexify">
						<img src="/wp-content/themes/voxel/assets/images/bg.jpg" alt="Link preview" />
						<div className="vxf-link-details flexify">
							<b>Example Link Title</b>
							<span className="vxf-icon vxf-link-source">example.com <ExternalLinkIcon /></span>
						</div>
					</a>
				</div>
				<div className="vxf-footer flexify">
					<div className="vxf-actions flexify">
						<a href="#" className="vxf-icon"><HeartIcon /></a>
						<a href="#" className="vxf-icon"><RepostIcon /></a>
						<a href="#" className="vxf-icon"><ShareIcon /></a>
					</div>
				</div>
			</div>

			{/* 8. Reposted post */}
			<div className="vxf-post">
				<div className="vxf-highlight flexify">
					<div className="vxf-icon"><RepostIcon /></div>
					<span>Albion reposted</span>
				</div>
				<div className="vxf-head flexify">
					<a href="#" className="vxf-avatar flexify"><img src={placeholderImg} alt="Albion" /></a>
					<div className="vxf-user flexify">
						<a href="#">Albion <div className="vxf-icon vxf-verified"><VerifiedIcon /></div></a>
						<span><a href="#">@admin</a><a href="#">1w</a></span>
					</div>
					<a href="#" className="vxf-icon vxf-more"><MoreIcon /></a>
				</div>
				<div className="vxf-body">
					<div className="vxf-body-text">Hello there!</div>
					{/* Quoted post */}
					<div className="vxf-post vxf__quoted-post">
						<div className="vxf-head flexify">
							<div className="vxf-avatar flexify"><img src={placeholderImg} alt="Albion" /></div>
							<div className="vxf-user flexify">
								<a href="#">Albion <div className="vxf-icon vxf-verified"><VerifiedIcon /></div></a>
								<span>@admin · 1w</span>
							</div>
						</div>
						<div className="vxf-body">
							<div className="vxf-body-text">Hello <a href="#">@arian</a> 👋</div>
						</div>
					</div>
				</div>
				<div className="vxf-footer flexify">
					<div className="vxf-actions flexify">
						<a href="#" className="vxf-icon"><HeartIcon /></a>
						<a href="#" className="vxf-icon vxf-reposted"><RepostIcon /></a>
						<a href="#" className="vxf-icon"><ShareIcon /></a>
					</div>
				</div>
			</div>

			{/* Load more buttons */}
			<a href="#" className="ts-load-more ts-btn ts-btn-1">
				<RefreshIcon /> Load more
			</a>
			<a href="#" className="ts-btn ts-btn-4">
				<RefreshIcon /> Load more comments
			</a>
		</div>
	);
}
