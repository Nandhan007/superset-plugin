import axios, { AxiosInstance } from 'axios';

// --- Configuration ---
const DIRECTUS_URL = process.env.REACT_APP_DIRECTUS_URL;

// --- Axios Instance with Token Support ---
const directusAPI: AxiosInstance = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const GetEditColumns = async (): Promise<any[]> => {
  try {
    const response = await directusAPI.get(`/items/editable_configs`);
    return response.data.data;
  } catch (error) {
    console.error('Error adding grid row:', error);
    return [];
  }
};

export default directusAPI;
