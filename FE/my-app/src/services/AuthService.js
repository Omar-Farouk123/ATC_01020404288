import { API_URL } from '../config';

class AuthService {
    // ... existing code ...

    async uploadUserImage(userId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/api/users/${userId}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const imageUrl = await response.text();
            return imageUrl;
        } catch (error) {
            console.error('Error uploading user image:', error);
            throw error;
        }
    }

    async getUserImage(userId) {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/image`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // No image found
                }
                throw new Error('Failed to fetch user image');
            }

            const imageUrl = await response.text();
            return imageUrl;
        } catch (error) {
            console.error('Error fetching user image:', error);
            throw error;
        }
    }

    // ... existing code ...
}

export default new AuthService(); 