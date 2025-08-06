import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { MapPin, Play, Trash2, Edit3, Plus, Minus, RotateCcw, Palette, Cloud, Github, ExternalLink } from 'lucide-react';

// Types
interface WeatherData {
  hour: number;
  temperature_2m: number;
  timestamp: string;
}

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: number;
  points: Point[];
  dataSource: string;
  weatherData: WeatherData[];
}

interface DataSource {
  id: number;
  name: string;
  field: string;
  colorRules: ColorRule[];
}

interface ColorRule {
  operator: '<' | '>' | '<=' | '>=' | '=';
  threshold: number;
  color: string;
}

// Mock weather data generator
const generateWeatherData = (lat: number, lon: number, hours: number): WeatherData[] => {
  const data: WeatherData[] = [];
  const baseTemp = 20 + Math.random() * 15;
  
  for (let i = 0; i < hours; i++) {
    const temp = baseTemp + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 3;
    data.push({
      hour: i,
      temperature_2m: parseFloat(temp.toFixed(1)),
      timestamp: new Date(Date.now() + i * 3600000).toISOString(),
    });
  }
  return data;
};

// Header Component
const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Weather Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Interactive spatial weather analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/yourusername/weather-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">View Code</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

// Timeline Slider Component
const TimelineSlider: React.FC<{
  value: [number, number];
  onChange: (value: [number, number]) => void;
  max?: number;
}> = ({ value, onChange, max = 720 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<0 | 1 | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, handleIndex: 0 | 1) => {
    e.preventDefault();
    setIsDragging(true);
    setActiveHandle(handleIndex);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current || activeHandle === null) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = percentage * max;
    
    const [start, end] = value;
    if (activeHandle === 0) {
      onChange([Math.min(newValue, end - 1), end]);
    } else {
      onChange([start, Math.max(newValue, start + 1)]);
    }
  }, [isDragging, activeHandle, value, onChange, max]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const formatHour = (hour: number) => {
    const date = new Date();
    date.setHours(Math.floor(hour));
    date.setMinutes((hour % 1) * 60);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{formatHour(value[0])}</span>
        <span>Duration: {Math.round(value[1] - value[0])} hours</span>
        <span>{formatHour(value[1])}</span>
      </div>
      
      <div className="relative w-full h-12 flex items-center">
        <div
          ref={sliderRef}
          className="relative w-full h-2 bg-gray-200 rounded-full"
        >
          <div
            className="absolute h-full bg-blue-400 rounded-full"
            style={{
              left: `${(value[0] / max) * 100}%`,
              width: `${((value[1] - value[0]) / max) * 100}%`
            }}
          />
          
          <div
            className="absolute w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
            style={{ left: `${(value[0] / max) * 100}%`, top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={(e) => handleMouseDown(e, 0)}
          />
          
          <div
            className="absolute w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
            style={{ left: `${(value[1] / max) * 100}%`, top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={(e) => handleMouseDown(e, 1)}
          />
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>15 days ago</span>
        <span>Today</span>
        <span>15 days ahead</span>
      </div>
    </div>
  );
};

// Interactive Map Component
const InteractiveMap: React.FC<{
  polygons: Polygon[];
  onPolygonCreate: (polygon: Polygon) => void;
  onPolygonDelete: (id: number) => void;
  selectedDataSource: DataSource | null;
  timeRange: [number, number];
}> = ({ polygons, onPolygonCreate, onPolygonDelete, selectedDataSource, timeRange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const mapWidth = 800;
  const mapHeight = 600;

  const getPolygonColor = (polygon: Polygon) => {
    if (!polygon.weatherData || !selectedDataSource) return '#94a3b8';
    
    const rules = selectedDataSource.colorRules;
    const avgTemp = polygon.weatherData.reduce((sum, d) => sum + d.temperature_2m, 0) / polygon.weatherData.length;
    
    for (const rule of rules) {
      if (rule.operator === '<' && avgTemp < rule.threshold) return rule.color;
      if (rule.operator === '>' && avgTemp > rule.threshold) return rule.color;
      if (rule.operator === '<=' && avgTemp <= rule.threshold) return rule.color;
      if (rule.operator === '>=' && avgTemp >= rule.threshold) return rule.color;
    }
    return '#94a3b8';
  };

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, mapWidth, mapHeight);
    
    // Draw background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, mapWidth, mapHeight);
    
    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= mapWidth; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i + mapOffset.x % 50, 0);
      ctx.lineTo(i + mapOffset.x % 50, mapHeight);
      ctx.stroke();
    }
    for (let i = 0; i <= mapHeight; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i + mapOffset.y % 50);
      ctx.lineTo(mapWidth, i + mapOffset.y % 50);
      ctx.stroke();
    }
    
    // Draw polygons
    polygons.forEach((polygon, index) => {
      if (polygon.points.length < 3) return;
      
      ctx.beginPath();
      ctx.moveTo(polygon.points[0].x + mapOffset.x, polygon.points[0].y + mapOffset.y);
      polygon.points.forEach(point => {
        ctx.lineTo(point.x + mapOffset.x, point.y + mapOffset.y);
      });
      ctx.closePath();
      
      ctx.fillStyle = getPolygonColor(polygon);
      ctx.globalAlpha = 0.7;
      ctx.fill();
      
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw centroid label
      const centroid = {
        x: polygon.points.reduce((sum, p) => sum + p.x, 0) / polygon.points.length,
        y: polygon.points.reduce((sum, p) => sum + p.y, 0) / polygon.points.length
      };
      
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`P${index + 1}`, centroid.x + mapOffset.x, centroid.y + mapOffset.y);
    });
    
    // Draw current polygon being drawn
    if (currentPolygon.length > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentPolygon[0].x + mapOffset.x, currentPolygon[0].y + mapOffset.y);
      currentPolygon.forEach(point => {
        ctx.lineTo(point.x + mapOffset.x, point.y + mapOffset.y);
      });
      ctx.stroke();
      
      // Draw points
      currentPolygon.forEach(point => {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(point.x + mapOffset.x, point.y + mapOffset.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [polygons, currentPolygon, mapOffset, selectedDataSource]);

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging || !isDrawing) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - mapOffset.x;
    const y = e.clientY - rect.top - mapOffset.y;
    
    const newPolygon = [...currentPolygon, { x, y }];
    setCurrentPolygon(newPolygon);
    
    if (newPolygon.length >= 12) {
      completePolygon();
    }
  };

  const handleCanvasDoubleClick = () => {
    if (currentPolygon.length >= 3) {
      completePolygon();
    }
  };

  const completePolygon = () => {
    if (currentPolygon.length >= 3) {
      const newPolygon: Polygon = {
        id: Date.now(),
        points: [...currentPolygon],
        dataSource: selectedDataSource?.name || 'Open-Meteo',
        weatherData: generateWeatherData(50, 10, Math.round(timeRange[1] - timeRange[0]))
      };
      onPolygonCreate(newPolygon);
    }
    setCurrentPolygon([]);
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setMapOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Interactive Map
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsDrawing(!isDrawing)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isDrawing ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isDrawing ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isDrawing ? 'Stop Drawing' : 'Draw Polygon'}
          </button>
          <button
            onClick={() => setMapOffset({ x: 0, y: 0 })}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset View
          </button>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={mapWidth}
        height={mapHeight}
        className="border-2 border-gray-300 rounded-lg"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ 
          cursor: isDrawing ? 'crosshair' : isDragging ? 'grabbing' : 'grab'
        }}
      />
      
      {isDrawing && (
        <div className="mt-2 text-sm text-gray-600">
          Click to add points (3-12 points). Double-click to complete polygon.
          Current points: {currentPolygon.length}
        </div>
      )}
    </div>
  );
};

// Data Source Sidebar Component
const DataSourceSidebar: React.FC<{
  dataSources: DataSource[];
  selectedDataSource: DataSource | null;
  onDataSourceChange: (source: DataSource) => void;
  onDataSourceAdd: (source: DataSource) => void;
}> = ({ dataSources, selectedDataSource, onDataSourceChange, onDataSourceAdd }) => {
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceField, setNewSourceField] = useState('temperature_2m');

  const addDataSource = () => {
    if (!newSourceName.trim()) return;
    
    const newSource: DataSource = {
      id: Date.now(),
      name: newSourceName,
      field: newSourceField,
      colorRules: [
        { operator: '<', threshold: 10, color: '#3b82f6' },
        { operator: '>=', threshold: 10, color: '#f59e0b' },
        { operator: '>=', threshold: 25, color: '#ef4444' }
      ]
    };
    
    onDataSourceAdd(newSource);
    setNewSourceName('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5" />
        Data Sources
      </h2>
      
      {dataSources.map((source) => (
        <div 
          key={source.id} 
          className={`mb-4 p-4 border rounded-lg transition-colors ${
            selectedDataSource?.id === source.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{source.name}</h3>
            <button
              onClick={() => onDataSourceChange(source)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedDataSource?.id === source.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {selectedDataSource?.id === source.id ? 'Selected' : 'Select'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            Field: {source.field}
          </div>
          
          <div className="space-y-1">
            {source.colorRules.map((rule, ruleIndex) => (
              <div key={ruleIndex} className="flex items-center gap-2 text-sm">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: rule.color }}
                />
                <span>
                  {rule.operator === '<' && `< ${rule.threshold}°C`}
                  {rule.operator === '>=' && `≥ ${rule.threshold}°C`}
                  {rule.operator === '>' && `> ${rule.threshold}°C`}
                  {rule.operator === '<=' && `≤ ${rule.threshold}°C`}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Add Data Source</h3>
        <input
          type="text"
          placeholder="Source name"
          value={newSourceName}
          onChange={(e) => setNewSourceName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={newSourceField}
          onChange={(e) => setNewSourceField(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="temperature_2m">Temperature (°C)</option>
          <option value="humidity">Humidity (%)</option>
          <option value="wind_speed">Wind Speed (m/s)</option>
        </select>
        <button
          onClick={addDataSource}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
        >
          Add Source
        </button>
      </div>
    </div>
  );
};

// Polygon List Component
const PolygonList: React.FC<{
  polygons: Polygon[];
  onPolygonDelete: (id: number) => void;
}> = ({ polygons, onPolygonDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        Polygons ({polygons.length})
      </h2>
      
      {polygons.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No polygons created yet. Use the map to draw polygons.
        </p>
      ) : (
        <div className="space-y-2">
          {polygons.map((polygon, index) => {
            const avgTemp = polygon.weatherData.length > 0 
              ? (polygon.weatherData.reduce((sum, d) => sum + d.temperature_2m, 0) / polygon.weatherData.length).toFixed(1)
              : 'N/A';
            
            return (
              <div key={polygon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <span className="text-sm font-medium">Polygon {index + 1}</span>
                  <div className="text-xs text-gray-500">
                    Points: {polygon.points.length} • Avg Temp: {avgTemp}°C
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onPolygonDelete(polygon.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete polygon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Statistics Component
const Statistics: React.FC<{
  polygons: Polygon[];
  timeRange: [number, number];
  selectedDataSource: DataSource | null;
}> = ({ polygons, timeRange, selectedDataSource }) => {
  const totalDataPoints = polygons.reduce((sum, p) => sum + p.weatherData.length, 0);
  const avgTemp = polygons.length > 0 
    ? polygons.reduce((sum, p) => {
        const polygonAvg = p.weatherData.reduce((tempSum, d) => tempSum + d.temperature_2m, 0) / p.weatherData.length;
        return sum + polygonAvg;
      }, 0) / polygons.length
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Statistics</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active Polygons:</span>
          <span className="font-semibold text-lg">{polygons.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Time Range:</span>
          <span className="font-semibold">{Math.round(timeRange[1] - timeRange[0])}h</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Data Source:</span>
          <span className="font-semibold text-sm">{selectedDataSource?.name || 'None'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Data Points:</span>
          <span className="font-semibold">{totalDataPoints}</span>
        </div>
        {polygons.length > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Temperature:</span>
            <span className="font-semibold">{avgTemp.toFixed(1)}°C</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Footer Component
const Footer: React.FC = () => {
  return (
    <footer className="mt-8 py-6 border-t bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center text-gray-500 text-sm">
          <p className="mb-2">
            Built with React, Next.js, and TypeScript • Weather data from Open-Meteo API
          </p>
          <p>
            Interactive dashboard for spatial weather analysis and visualization
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main Dashboard Page
const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 24]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: 1,
      name: 'Open-Meteo',
      field: 'temperature_2m',
      colorRules: [
        { operator: '<', threshold: 10, color: '#3b82f6' },
        { operator: '>=', threshold: 10, color: '#f59e0b' },
        { operator: '>=', threshold: 25, color: '#ef4444' }
      ]
    }
  ]);

  // Initialize selected data source
  useEffect(() => {
    if (dataSources.length > 0 && !selectedDataSource) {
      setSelectedDataSource(dataSources[0]);
    }
  }, [dataSources, selectedDataSource]);

  // Update polygon weather data when timeline changes
  useEffect(() => {
    setPolygons(prev => prev.map(polygon => ({
      ...polygon,
      weatherData: generateWeatherData(50, 10, Math.round(timeRange[1] - timeRange[0]))
    })));
  }, [timeRange]);

  const handlePolygonCreate = (polygon: Polygon) => {
    setPolygons(prev => [...prev, polygon]);
  };

  const handlePolygonDelete = (polygonId: number) => {
    setPolygons(prev => prev.filter(p => p.id !== polygonId));
  };

  const handleDataSourceAdd = (source: DataSource) => {
    setDataSources(prev => [...prev, source]);
  };

  return (
    <>
      <Head>
        <title>Weather Dashboard - Interactive Spatial Analysis</title>
        <meta name="description" content="Interactive weather dashboard with timeline and spatial polygon analysis" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Timeline Section */}
          <section className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Timeline Selector</h2>
            <TimelineSlider
              value={timeRange}
              onChange={setTimeRange}
              max={720} // 30 days in hours
            />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map Section - Takes up 3/4 of the space */}
            <div className="lg:col-span-3">
              <InteractiveMap
                polygons={polygons}
                onPolygonCreate={handlePolygonCreate}
                onPolygonDelete={handlePolygonDelete}
                selectedDataSource={selectedDataSource}
                timeRange={timeRange}
              />
            </div>

            {/* Sidebar - Takes up 1/4 of the space */}
            <div className="space-y-6">
              <DataSourceSidebar
                dataSources={dataSources}
                selectedDataSource={selectedDataSource}
                onDataSourceChange={setSelectedDataSource}
                onDataSourceAdd={handleDataSourceAdd}
              />
              
              <PolygonList
                polygons={polygons}
                onPolygonDelete={handlePolygonDelete}
              />

              <Statistics
                polygons={polygons}
                timeRange={timeRange}
                selectedDataSource={selectedDataSource}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Dashboard;