import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchPhotos = async() => {
    const response = await axios.get(`${API_BASE_URL}/photos`);
    return response.data.photos || response.data;
}

export const uploadPhoto = async(file, title) => {
    const formData = new FormData();
    formData.append('image', file);

    if (title){
        formData.append('title', title);
    }
    const response = await axios.post(`${API_BASE_URL}/photos/upload`, formData, {
        headers : {'Content-Type' : 'multipart/form-data'},
    })
    return response.data;
}

export const searchPhotos = async(query) => {
    const response = await axios.post(`${API_BASE_URL}/ai/search`, {query});
    return response.data.results;
}

export const findSimilarPhotos = async(photoId) => {
    const response = await axios.post(`${API_BASE_URL}/ai/similar/${photoId}`)
    return response.data.results;
}

export const deletePhoto = async(photoId) => {
    const response = await axios.delete(`${API_BASE_URL}/photos/${photoId}`);
    return response.data;
}