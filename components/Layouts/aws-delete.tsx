import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';

// Initialize S3 with DigitalOcean Spaces endpoint
const spacesEndpoint = new AWS.Endpoint('https://blr1.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'DO00MUC2HWP9YVLPXKXT', // Add your access key here
  secretAccessKey: 'W9N9b51nxVBvpS59Er9aB6Ht7xx2ZXMrbf3vjBBR8OA', // Add your secret key here
});

const ImageManager = () => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        const params = {
            Bucket: 'prade', // Your Space name

        };

        try {
            const data = await s3.listObjectsV2(params).promise();
            const imageUrls = data.Contents.map(item => ({
                url: `https://prade.blr1.cdn.digitaloceanspaces.com/${item.Key}`,
                key: item.Key,
            }));
            setImages(imageUrls);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const handleDelete = async (key) => {
        const params = {
            Bucket: 'prade', // Your Space name
            Key: key, // The key of the file you want to delete
        };

        try {
           const res= await s3.deleteObject(params).promise();
            setImages(images.filter(image => image.key !== key));
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    return (
        <div>
            {images.length > 0 ? (
                <div>
                    {images.map(image => (
                        <div key={image.key} className="image-item">
                            <img src={image.url} alt={image.key} style={{ width: '200px', height: '200px' }} />
                            <button onClick={() => handleDelete(image.key)}>Delete</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No images found.</p>
            )}
        </div>
    );
};

export default ImageManager;
