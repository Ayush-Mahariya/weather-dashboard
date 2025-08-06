# Weather Dashboard

An interactive weather data visualization dashboard built with Next.js, React, and TypeScript. Features timeline-based data exploration and spatial polygon analysis.

## 🚀 Features

- **Interactive Timeline Slider**: 30-day window with hourly resolution
- **Dynamic Map Interface**: Canvas-based map with polygon drawing tools
- **Real-time Data Visualization**: Color-coded polygons based on weather data
- **Multiple Data Sources**: Support for various weather data providers
- **Responsive Design**: Mobile-friendly interface
- **TypeScript**: Full type safety and IntelliSense support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Open-Meteo Weather API
- **Deployment**: Vercel/Netlify ready

## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/Ayush-Mahariya/weather-dashboard.git
cd weather-dashboard
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### Timeline Navigation
- Use the dual-handle slider to select time ranges
- Drag handles to adjust the time window
- View hourly weather data across 30 days

### Polygon Drawing
1. Click "Draw Polygon" button
2. Click on the map to add points (3-12 points)
3. Double-click to complete the polygon
4. Polygons are automatically colored based on weather data

### Data Sources
- Select different data sources from the sidebar
- Configure color rules for data visualization
- Add custom data sources and thresholds

## 🔧 Configuration

### API Configuration
The app uses Open-Meteo API by default. To configure:

1. Update \`.env.local\` with your API settings
2. Modify \`src/lib/api/weatherApi.ts\` for custom endpoints
3. Adjust data processing in \`src/lib/utils/weatherUtils.ts\`

### Styling
- Customize colors in \`tailwind.config.js\`
- Modify component styles in respective component files
- Global styles in \`src/styles/globals.css\`

## 📁 Project Structure

- \`src/components/\` - Reusable React components
- \`src/lib/\` - Utilities, API functions, and types
- \`src/hooks/\` - Custom React hooks
- \`src/pages/\` - Next.js pages and API routes
- \`public/\` - Static assets

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Manual Build
\`\`\`bash
npm run build
npm run start
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request


## 🆘 Support

For support, please open an issue on GitHub or contact [ayushmahariya123@gmail.com]
