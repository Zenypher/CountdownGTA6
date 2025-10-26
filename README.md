# GTA VI Countdown Website

A sleek, real-time countdown timer website for the Grand Theft Auto VI release date. Built with vanilla HTML, CSS, and JavaScript with an Express backend.

## Features

- **Live Countdown Timer** — Real-time countdown showing months, days, hours, minutes, and seconds until GTA VI releases
- **Modern Aesthetic** — Colorful, urban-inspired design with gradient overlays and smooth animations
- **Blurred Background** — Eye-catching background image and gradient overlay effect
- **Custom Fonts** — Typography using Google Fonts for a premium feel

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js with Express.js
- **Styling:** Custom CSS with Flexbox and Grid layouts
- **Server:** Express with CORS support
- **Static Files:** Served via Express static middleware

## Project Structure

```
countdowngta6/
├── public/
│   ├── css/
│   │   └── base.css
│   │   └── layout.css
│   ├── js/
│   │   └── main.js
│   │   └── logo.js
│   ├── assets/
│   │   └── gtaVI_artwork.jpg
│   └── index.html
├── app.js
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Zenypher/CountdownGTA6.git
   cd countdowngta6
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```

   Or with hot reload:

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5000`

## Setup Guide

### Dependencies

Install Express and CORS:

```bash
npm install express cors
```

### Development

For automatic server restarts during development:

```bash
npm install --save-dev nodemon
```

Add to `package.json`:

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

## How It Works

The countdown timer runs every second, calculating the time remaining until the GTA VI release date. It displays:

- **Months** — Number of full months remaining
- **Days** — Remaining days after months
- **Hours** — Remaining hours after days
- **Minutes** — Remaining minutes after hours
- **Seconds** — Remaining seconds

The timer automatically updates in real-time without requiring a page refresh.

## Customization

### Change the Release Date

Edit the countdown date in `js/main.js`:

```javascript
startCountdown("2026-05-26"); // Update to actual release date
```

### Modify Colors and Styling

Edit `public/css/base.css` or `public/css/layout` to customize:

- Gradient overlay colors
- Background blur amount
- Font sizes and colors
- Layout spacing

### Update Background Image

Replace `assets/gtaVI_artwork.jpg` with your own image file.

## Browser Support

Works on all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Images are optimized for web loading
- Countdown uses efficient `setInterval()` with minimal DOM updates
- Static files are served with caching headers
- CSS animations run smoothly on 60 FPS

## Disclaimer

This is a fan project and is not affiliated with Rockstar Games or Take-Two Interactive. Grand Theft Auto is a trademark of Rockstar Games. All rights belong to their respective owners.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Enhancements

- Social media sharing buttons
- News feed section
- API integration for official GTA VI updates
- Better responsive design
- New and refined animations
- Slideshow style background image
