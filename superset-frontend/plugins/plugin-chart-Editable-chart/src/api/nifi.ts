import axios from 'axios';

const UpdateTable = async (
  payload: any,
  updateUrl: string,
): Promise<any | false> => {
  try {
    const response = await axios.post(updateUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    console.log(response);
    return response.statusText;
  } catch (error) {
    console.error('NiFi Update Error:', error);
    return false;
  }
};

export default UpdateTable;
