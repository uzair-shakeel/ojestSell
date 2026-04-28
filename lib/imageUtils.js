export const optimizeCloudinaryUrl = (url, width = 800) => {
    if (!url) return url;
    // Check if it's a Cloudinary URL and hasn't been transformed yet
    if (typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/w_')) {
        return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
    }
    return url;
};
