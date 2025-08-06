export interface WeatherData {
  hour: number;
  temperature_2m: number;
  timestamp: string;
  humidity?: number;
  wind_speed?: number;
}

export interface Polygon {
  id: number;
  points: Point[];
  dataSource: string;
  weatherData: WeatherData[];
  name?: string;
}

export interface Point {
  x: number;
  y: number;
  lat?: number;
  lon?: number;
}

export interface DataSource {
  id: number;
  name: string;
  field: keyof WeatherData;
  colorRules: ColorRule[];
  apiEndpoint?: string;
}

export interface ColorRule {
  operator: '<' | '>' | '<=' | '>=' | '=';
  threshold: number;
  color: string;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface MapState {
  offset: Point;
  zoom: number;
  isDragging: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}