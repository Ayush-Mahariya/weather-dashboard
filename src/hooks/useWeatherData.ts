import axios from 'axios';
import { WeatherData, ApiResponse } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_OPENMETEO_API_URL || 'https://archive-api.open-meteo.com/v1/archive';

export class WeatherAPI {
  private static instance: WeatherAPI;
  private baseURL: string;

  private constructor() {
    this.baseURL = API_BASE_URL;
  }

  public static getInstance(): WeatherAPI {
    if (!WeatherAPI.instance) {
      WeatherAPI.instance = new WeatherAPI();
    }
    return WeatherAPI.instance;
  }

  async fetchWeatherData(
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string,
    hourly: string = 'temperature_2m'
  ): Promise<ApiResponse<WeatherData[]>> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        start_date: startDate,
        end_date: endDate,
        hourly,
      });

      const response = await axios.get(`${this.baseURL}?${params}`);
      
      const weatherData: WeatherData[] = response.data.hourly.time.map((time: string, index: number) => ({
        hour: index,
        temperature_2m: response.data.hourly.temperature_2m[index],
        timestamp: time,
      }));

      return {
        data: weatherData,
        status: response.status,
        message: 'Success'
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      
      // Return mock data for development
      const mockData = this.generateMockData(24);
      return {
        data: mockData,
        status: 200,
        message: 'Using mock data'
      };
    }
  }

  private generateMockData(hours: number): WeatherData[] {
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
  }
}

export const weatherAPI = WeatherAPI.getInstance();